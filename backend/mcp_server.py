"""Swiggy MCP Server simulation with local JSON-RPC transport."""

from __future__ import annotations

import secrets
import uuid
from typing import Any

from models import (
    Address,
    FoodItem,
    GroceryProduct,
    JsonRpcRequest,
    JsonRpcResponse,
    MacroInfo,
)

FOOD_SERVER = "mcp.swiggy.com/food"
INSTAMART_SERVER = "mcp.swiggy.com/instamart"


class SwiggyMCPServer:
    """Simulates Swiggy Food + Instamart MCP tool endpoints."""

    def __init__(self) -> None:
        self._addresses: list[Address] = [
            Address(
                address_id="addr_home_001",
                label="Home",
                line1="42 Koramangala 5th Block",
                city="Bangalore",
                pincode="560095",
                lat=12.9352,
                lng=77.6245,
            ),
            Address(
                address_id="addr_gym_098",
                label="Gym",
                line1="Cult Fit, Indiranagar",
                city="Bangalore",
                pincode="560038",
                lat=12.9784,
                lng=77.6408,
            ),
        ]

        self._restaurants: list[FoodItem] = [
            FoodItem(
                item_id="food_001",
                name="Keto Grilled Chicken Bowl",
                restaurant_id="rest_healthy_bites",
                restaurant_name="Healthy Bites",
                price=349.0,
                rating=4.6,
                cuisine="healthy",
                macros=MacroInfo(calories=420, protein=45, carbs=12, fats=18),
                tags=["keto", "high-protein", "low-carb"],
            ),
            FoodItem(
                item_id="food_002",
                name="Protein Power Paneer Tikka",
                restaurant_id="rest_fit_kitchen",
                restaurant_name="Fit Kitchen",
                price=299.0,
                rating=4.8,
                cuisine="healthy",
                macros=MacroInfo(calories=380, protein=42, carbs=15, fats=14),
                tags=["high-protein", "vegetarian"],
            ),
            FoodItem(
                item_id="food_003",
                name="Lean Muscle Salmon Plate",
                restaurant_id="rest_ocean_grill",
                restaurant_name="Ocean Grill",
                price=549.0,
                rating=4.7,
                cuisine="seafood",
                macros=MacroInfo(calories=460, protein=48, carbs=8, fats=22),
                tags=["high-protein", "omega-3"],
            ),
            FoodItem(
                item_id="food_004",
                name="Post-Workout Egg White Omelette",
                restaurant_id="rest_muscle_meals",
                restaurant_name="Muscle Meals",
                price=249.0,
                rating=4.5,
                cuisine="healthy",
                macros=MacroInfo(calories=310, protein=38, carbs=6, fats=12),
                tags=["post-workout", "high-protein"],
                in_stock=False,
            ),
            FoodItem(
                item_id="food_005",
                name="Quinoa Buddha Bowl",
                restaurant_id="rest_green_spoon",
                restaurant_name="Green Spoon",
                price=279.0,
                rating=4.4,
                cuisine="healthy",
                macros=MacroInfo(calories=390, protein=18, carbs=52, fats=12),
                tags=["balanced", "vegetarian"],
            ),
            FoodItem(
                item_id="food_006",
                name="Double Chicken Breast Meal",
                restaurant_id="rest_protein_lab",
                restaurant_name="Protein Lab",
                price=399.0,
                rating=4.9,
                cuisine="healthy",
                macros=MacroInfo(calories=520, protein=55, carbs=20, fats=16),
                tags=["high-protein", "bulking"],
            ),
        ]

        self._groceries: list[GroceryProduct] = [
            GroceryProduct(
                product_id="groc_001",
                name="Greek Yogurt (500g)",
                brand="Epigamia",
                price=149.0,
                unit="500g",
                macros=MacroInfo(calories=120, protein=15, carbs=8, fats=3),
                category="dairy",
            ),
            GroceryProduct(
                product_id="groc_002",
                name="Whey Protein Isolate (1kg)",
                brand="MuscleBlaze",
                price=2499.0,
                unit="1kg",
                macros=MacroInfo(calories=120, protein=25, carbs=2, fats=1),
                category="supplements",
            ),
            GroceryProduct(
                product_id="groc_003",
                name="Chicken Breast (500g)",
                brand="Licious",
                price=199.0,
                unit="500g",
                macros=MacroInfo(calories=165, protein=31, carbs=0, fats=4),
                category="meat",
            ),
            GroceryProduct(
                product_id="groc_004",
                name="Brown Rice (1kg)",
                brand="India Gate",
                price=89.0,
                unit="1kg",
                macros=MacroInfo(calories=112, protein=3, carbs=24, fats=1),
                category="grains",
            ),
            GroceryProduct(
                product_id="groc_005",
                name="Avocado (2 pcs)",
                brand="Fresho",
                price=129.0,
                unit="2 pcs",
                macros=MacroInfo(calories=160, protein=2, carbs=9, fats=15),
                category="produce",
            ),
            GroceryProduct(
                product_id="groc_006",
                name="Almond Butter (200g)",
                brand="Pintola",
                price=349.0,
                unit="200g",
                macros=MacroInfo(calories=98, protein=3, carbs=3, fats=9),
                category="spreads",
                in_stock=False,
            ),
            GroceryProduct(
                product_id="groc_007",
                name="Egg Whites (500ml)",
                brand="Eggoz",
                price=119.0,
                unit="500ml",
                macros=MacroInfo(calories=52, protein=11, carbs=1, fats=0),
                category="dairy",
            ),
        ]

        self._cart: dict[str, Any] = {"items": [], "address_id": None}

    def dispatch(self, server: str, request: JsonRpcRequest) -> JsonRpcResponse:
        """Route JSON-RPC method to the appropriate handler."""
        method = request.method
        params = request.params

        handlers = {
            "get_addresses": self._get_addresses,
            "search_restaurants": self._search_restaurants,
            "search_products": self._search_products,
            "update_cart": self._update_cart,
            "get_cart": self._get_cart,
        }

        handler = handlers.get(method)
        if handler is None:
            return JsonRpcResponse(
                id=request.id,
                error={"code": -32601, "message": f"Method not found: {method}"},
            )

        try:
            result = handler(params)
            return JsonRpcResponse(id=request.id, result=result)
        except Exception as exc:
            return JsonRpcResponse(
                id=request.id,
                error={"code": -32000, "message": str(exc)},
            )

    def _get_addresses(self, _params: dict[str, Any]) -> dict[str, Any]:
        return {
            "addresses": [a.model_dump() for a in self._addresses],
            "default_address_id": self._addresses[0].address_id,
        }

    def _search_restaurants(self, params: dict[str, Any]) -> dict[str, Any]:
        cuisine = params.get("cuisine", "").lower()
        min_protein = float(params.get("min_protein", 0))
        max_calories = params.get("max_calories")
        address_id = params.get("address_id", self._addresses[0].address_id)
        sort_by = params.get("sort_by", "rating")

        filtered = self._restaurants
        if cuisine:
            filtered = [
                r
                for r in filtered
                if cuisine in r.cuisine.lower()
                or any(cuisine in t for t in r.tags)
            ]
        if min_protein > 0:
            filtered = [r for r in filtered if r.macros.protein >= min_protein]
        if max_calories is not None:
            filtered = [r for r in filtered if r.macros.calories <= float(max_calories)]

        if sort_by == "rating":
            filtered = sorted(filtered, key=lambda r: r.rating, reverse=True)
        elif sort_by == "protein":
            filtered = sorted(filtered, key=lambda r: r.macros.protein, reverse=True)

        return {
            "address_id": address_id,
            "results": [r.model_dump() for r in filtered],
            "total": len(filtered),
        }

    def _search_products(self, params: dict[str, Any]) -> dict[str, Any]:
        query = params.get("query", "").lower()
        min_protein = float(params.get("min_protein", 0))
        category = params.get("category", "").lower()
        address_id = params.get("address_id", self._addresses[0].address_id)

        filtered = self._groceries
        if query:
            filtered = [
                p
                for p in filtered
                if query in p.name.lower()
                or query in p.brand.lower()
                or query in p.category.lower()
            ]
        if min_protein > 0:
            filtered = [p for p in filtered if p.macros.protein >= min_protein]
        if category:
            filtered = [p for p in filtered if category in p.category.lower()]

        return {
            "address_id": address_id,
            "results": [p.model_dump() for p in filtered],
            "total": len(filtered),
        }

    def _update_cart(self, params: dict[str, Any]) -> dict[str, Any]:
        items = params.get("items", [])
        address_id = params.get("address_id", self._addresses[0].address_id)
        source = params.get("source", "food")

        self._cart = {"items": items, "address_id": address_id, "source": source}
        token = secrets.token_urlsafe(32)
        checkout_url = f"https://swiggy.com/checkout/{token}"

        return {
            "cart_id": str(uuid.uuid4()),
            "checkout_url": checkout_url,
            "checkout_token": token,
            "item_count": len(items),
            "address_id": address_id,
        }

    def _get_cart(self, _params: dict[str, Any]) -> dict[str, Any]:
        return self._cart

    def get_food_item(self, item_id: str) -> FoodItem | None:
        return next((r for r in self._restaurants if r.item_id == item_id), None)

    def get_grocery_product(self, product_id: str) -> GroceryProduct | None:
        return next((p for p in self._groceries if p.product_id == product_id), None)

    def find_food_alternative(self, exclude_id: str, min_protein: float) -> FoodItem | None:
        candidates = [
            r
            for r in self._restaurants
            if r.item_id != exclude_id and r.in_stock and r.macros.protein >= min_protein
        ]
        candidates.sort(key=lambda r: r.rating, reverse=True)
        return candidates[0] if candidates else None

    def find_grocery_alternative(self, exclude_id: str, min_protein: float) -> GroceryProduct | None:
        candidates = [
            p
            for p in self._groceries
            if p.product_id != exclude_id and p.in_stock and p.macros.protein >= min_protein
        ]
        return candidates[0] if candidates else None


# Singleton MCP server instance
mcp_server = SwiggyMCPServer()
