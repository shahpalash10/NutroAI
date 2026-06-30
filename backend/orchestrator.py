"""Multi-step Nutro AI agent orchestrator."""

from __future__ import annotations

import re
import uuid
from typing import AsyncGenerator

from mcp_server import FOOD_SERVER, INSTAMART_SERVER, mcp_server
from models import (
    CartItem,
    CartSummary,
    FitnessProfile,
    JsonRpcRequest,
    MacroConsumed,
    MacroInfo,
    MacroTargets,
    TerminalLog,
    TerminalLogLevel,
    utc_now_iso,
)

# Mock fitness profile — simulates wearable sync
MOCK_PROFILE = FitnessProfile(
    user_id="user_palash_001",
    name="Palash Shah",
    targets=MacroTargets(calories=2500, protein=160, carbs=250, fats=80),
    consumed=MacroConsumed(calories=1800, protein=120, carbs=180, fats=55),
    remaining=MacroTargets(calories=700, protein=40, carbs=70, fats=25),
    activity_level="Heavy Training",
    last_workout="Heavy Leg Day · 2h ago",
)


def get_fitness_profile() -> FitnessProfile:
    """Return current mock fitness profile with computed remaining macros."""
    profile = MOCK_PROFILE.model_copy(deep=True)
    profile.remaining = MacroTargets(
        calories=max(0, profile.targets.calories - profile.consumed.calories),
        protein=max(0, profile.targets.protein - profile.consumed.protein),
        carbs=max(0, profile.targets.carbs - profile.consumed.carbs),
        fats=max(0, profile.targets.fats - profile.consumed.fats),
    )
    return profile


def _make_log(
    level: TerminalLogLevel,
    server: str,
    tool: str,
    message: str,
    payload: dict | None = None,
) -> TerminalLog:
    return TerminalLog(
        id=str(uuid.uuid4()),
        timestamp=utc_now_iso(),
        level=level,
        server=server,
        tool=tool,
        message=message,
        payload=payload,
    )


def _call_mcp(server: str, method: str, params: dict | None = None) -> tuple[dict, list[TerminalLog]]:
    """Execute a JSON-RPC call against the MCP server and return result + logs."""
    params = params or {}
    logs: list[TerminalLog] = []

    logs.append(
        _make_log(
            TerminalLogLevel.CALLING,
            server,
            method,
            f"tool: `{method}({', '.join(f'{k}={v!r}' for k, v in params.items())})`",
            payload={"jsonrpc": "2.0", "method": method, "params": params},
        )
    )

    request = JsonRpcRequest(id=str(uuid.uuid4()), method=method, params=params)
    response = mcp_server.dispatch(server, request)

    if response.error:
        logs.append(
            _make_log(
                TerminalLogLevel.ERROR,
                server,
                method,
                response.error.get("message", "Unknown error"),
                payload=response.error,
            )
        )
        return {}, logs

    result = response.result or {}

    # Extract key parsed fields for terminal display
    if method == "get_addresses" and "addresses" in result:
        default_id = result.get("default_address_id", "")
        logs.append(
            _make_log(
                TerminalLogLevel.PARSING,
                server,
                method,
                f'extracted `addressId: "{default_id}"`',
                payload={"addressId": default_id},
            )
        )
    elif method in ("search_restaurants", "search_products"):
        count = result.get("total", 0)
        logs.append(
            _make_log(
                TerminalLogLevel.EXECUTING,
                server,
                method,
                f"returned {count} results",
                payload={"total": count, "top_result": (result.get("results") or [{}])[0]},
            )
        )
    elif method == "update_cart":
        logs.append(
            _make_log(
                TerminalLogLevel.SUCCESS,
                server,
                method,
                f"checkout token generated → {result.get('checkout_token', '')[:16]}...",
                payload={"checkout_url": result.get("checkout_url")},
            )
        )
    else:
        logs.append(
            _make_log(
                TerminalLogLevel.SUCCESS,
                server,
                method,
                "completed",
                payload=result,
            )
        )

    return result, logs


def _detect_intent(message: str) -> str:
    """Classify user intent as food, instamart, or auto."""
    lower = message.lower()
    instamart_keywords = [
        "grocery", "groceries", "instamart", "meal prep", "ingredients",
        "yogurt", "chicken breast", "buy", "stock up", "pantry",
    ]
    food_keywords = [
        "dinner", "lunch", "breakfast", "restaurant", "meal", "order",
        "delivery", "spot", "bowl", "takeout", "eat", "food",
    ]

    instamart_score = sum(1 for k in instamart_keywords if k in lower)
    food_score = sum(1 for k in food_keywords if k in lower)

    if instamart_score > food_score:
        return "instamart"
    if food_score > 0:
        return "food"
    return "auto"


def _extract_protein_target(message: str, remaining: MacroTargets) -> float:
    """Parse explicit protein requirements from user message."""
    match = re.search(r"(\d+)\s*g?\s*\+?\s*protein", message.lower())
    if match:
        return float(match.group(1))
    if "high-protein" in message.lower() or "high protein" in message.lower():
        return max(35.0, remaining.protein * 0.8)
    return max(20.0, remaining.protein * 0.5)


def _extract_calorie_cap(message: str) -> float | None:
    match = re.search(r"under\s+(\d+)\s*cal", message.lower())
    if match:
        return float(match.group(1))
    return None


def _orchestrate_food(
    profile: FitnessProfile,
    message: str,
) -> tuple[list[TerminalLog], CartSummary | None, str]:
    """Run Food MCP tool chain."""
    logs: list[TerminalLog] = []
    min_protein = _extract_protein_target(message, profile.remaining)
    max_calories = _extract_calorie_cap(message)

    # Step 1: Get addresses
    addr_result, addr_logs = _call_mcp(FOOD_SERVER, "get_addresses")
    logs.extend(addr_logs)
    address_id = addr_result.get("default_address_id", "addr_home_001")

    # Step 2: Search restaurants
    search_params: dict = {
        "address_id": address_id,
        "cuisine": "healthy",
        "min_protein": min_protein,
        "sort_by": "rating",
    }
    if max_calories:
        search_params["max_calories"] = max_calories

    search_result, search_logs = _call_mcp(FOOD_SERVER, "search_restaurants", search_params)
    logs.extend(search_logs)

    results = search_result.get("results", [])
    if not results:
        return logs, None, "No restaurants matched your macro criteria. Try adjusting your request."

    # Step 3: Select best item, handle out-of-stock
    selected = results[0]
    cart_items: list[CartItem] = []

    if not selected.get("in_stock", True):
        logs.append(
            _make_log(
                TerminalLogLevel.ERROR,
                FOOD_SERVER,
                "search_restaurants",
                f'Item "{selected["name"]}" is OUT OF STOCK — seeking alternative',
                payload={"item_id": selected["item_id"]},
            )
        )
        alt = mcp_server.find_food_alternative(selected["item_id"], min_protein)
        if alt:
            logs.append(
                _make_log(
                    TerminalLogLevel.EXECUTING,
                    FOOD_SERVER,
                    "search_restaurants",
                    f'Auto-fallback → "{alt.name}" ({alt.macros.protein}g protein)',
                    payload=alt.model_dump(),
                )
            )
            selected = alt.model_dump()
        else:
            return logs, None, "Preferred item out of stock and no alternatives found."

    cart_items.append(
        CartItem(
            id=selected["item_id"],
            name=selected["name"],
            source="food",
            restaurant=selected.get("restaurant_name"),
            price=selected["price"],
            quantity=1,
            macros=MacroInfo(**selected["macros"]),
            in_stock=selected.get("in_stock", True),
        )
    )

    # Step 4: Update cart
    cart_payload = {
        "address_id": address_id,
        "source": "food",
        "items": [{"item_id": selected["item_id"], "quantity": 1}],
    }
    cart_result, cart_logs = _call_mcp(FOOD_SERVER, "update_cart", cart_payload)
    logs.extend(cart_logs)

    total_macros = MacroInfo(
        calories=selected["macros"]["calories"],
        protein=selected["macros"]["protein"],
        carbs=selected["macros"]["carbs"],
        fats=selected["macros"]["fats"],
    )

    cart = CartSummary(
        items=cart_items,
        total_price=selected["price"],
        total_macros=total_macros,
        checkout_url=cart_result.get("checkout_url"),
    )

    response_msg = (
        f"Found **{selected['name']}** from {selected.get('restaurant_name', 'a top-rated spot')} "
        f"— {selected['macros']['protein']}g protein, {selected['macros']['calories']} kcal. "
        f"Covers {round(selected['macros']['protein'] / profile.remaining.protein * 100)}% "
        f"of your remaining protein target. Added to cart!"
    )
    return logs, cart, response_msg


def _orchestrate_instamart(
    profile: FitnessProfile,
    message: str,
) -> tuple[list[TerminalLog], CartSummary | None, str]:
    """Run Instamart MCP tool chain."""
    logs: list[TerminalLog] = []
    min_protein = _extract_protein_target(message, profile.remaining)

    addr_result, addr_logs = _call_mcp(INSTAMART_SERVER, "get_addresses")
    logs.extend(addr_logs)
    address_id = addr_result.get("default_address_id", "addr_home_001")

    query = "protein"
    if "yogurt" in message.lower():
        query = "yogurt"
    elif "chicken" in message.lower():
        query = "chicken"
    elif "egg" in message.lower():
        query = "egg"

    search_params = {
        "address_id": address_id,
        "query": query,
        "min_protein": min(min_protein, 10),
    }
    search_result, search_logs = _call_mcp(INSTAMART_SERVER, "search_products", search_params)
    logs.extend(search_logs)

    results = search_result.get("results", [])
    if not results:
        return logs, None, "No Instamart products matched. Try a different query."

    cart_items: list[CartItem] = []
    selected_items = results[:3]
    mcp_cart_items: list[dict] = []
    total_price = 0.0
    total_macros = MacroInfo(calories=0, protein=0, carbs=0, fats=0)

    for item in selected_items:
        if not item.get("in_stock", True):
            logs.append(
                _make_log(
                    TerminalLogLevel.ERROR,
                    INSTAMART_SERVER,
                    "search_products",
                    f'Product "{item["name"]}" OUT OF STOCK — seeking alternative',
                    payload={"product_id": item["product_id"]},
                )
            )
            alt = mcp_server.find_grocery_alternative(item["product_id"], min_protein)
            if alt:
                logs.append(
                    _make_log(
                        TerminalLogLevel.EXECUTING,
                        INSTAMART_SERVER,
                        "search_products",
                        f'Auto-fallback → "{alt.name}"',
                        payload=alt.model_dump(),
                    )
                )
                item = alt.model_dump()
            else:
                continue

        cart_items.append(
            CartItem(
                id=item["product_id"],
                name=item["name"],
                source="instamart",
                price=item["price"],
                quantity=1,
                macros=MacroInfo(**item["macros"]),
                in_stock=item.get("in_stock", True),
            )
        )
        mcp_cart_items.append({"product_id": item["product_id"], "quantity": 1})
        total_price += item["price"]
        total_macros.calories += item["macros"]["calories"]
        total_macros.protein += item["macros"]["protein"]
        total_macros.carbs += item["macros"]["carbs"]
        total_macros.fats += item["macros"]["fats"]

    if not cart_items:
        return logs, None, "All matching products were out of stock."

    cart_result, cart_logs = _call_mcp(
        INSTAMART_SERVER,
        "update_cart",
        {"address_id": address_id, "source": "instamart", "items": mcp_cart_items},
    )
    logs.extend(cart_logs)

    cart = CartSummary(
        items=cart_items,
        total_price=total_price,
        total_macros=total_macros,
        checkout_url=cart_result.get("checkout_url"),
    )

    names = ", ".join(c.name for c in cart_items)
    response_msg = (
        f"Added {len(cart_items)} Instamart items to cart: {names}. "
        f"Combined: {round(total_macros.protein)}g protein, {round(total_macros.calories)} kcal."
    )
    return logs, cart, response_msg


async def run_agent(message: str) -> AsyncGenerator[dict, None]:
    """Main agent loop — inspects macros, routes intent, chains MCP tools."""
    profile = get_fitness_profile()

    yield {"type": "profile", "profile": profile.model_dump()}
    yield {
        "type": "log",
        "log": _make_log(
            TerminalLogLevel.INFO,
            "nutro.ai/orchestrator",
            "analyze_macros",
            f"Remaining: {profile.remaining.protein}g protein, {profile.remaining.calories} kcal",
            payload=profile.remaining.model_dump(),
        ).model_dump(),
    }

    intent = _detect_intent(message)
    if intent == "auto":
        intent = "food" if profile.remaining.protein >= 30 else "instamart"

    yield {
        "type": "log",
        "log": _make_log(
            TerminalLogLevel.INFO,
            "nutro.ai/orchestrator",
            "route_intent",
            f"Routing to Swiggy {'Food' if intent == 'food' else 'Instamart'} MCP server",
            payload={"intent": intent},
        ).model_dump(),
    }

    if intent == "instamart":
        logs, cart, response_msg = _orchestrate_instamart(profile, message)
    else:
        logs, cart, response_msg = _orchestrate_food(profile, message)

    for log in logs:
        yield {"type": "log", "log": log.model_dump()}

    if cart:
        yield {"type": "cart", "cart": cart.model_dump()}

    # Stream response text word by word for UI effect
    words = response_msg.replace("**", "").split(" ")
    chunk = ""
    for i, word in enumerate(words):
        chunk += (" " if i > 0 else "") + word
        yield {"type": "text", "content": chunk}

    yield {"type": "done"}
