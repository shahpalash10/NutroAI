import type { CartSummary, FitnessProfile, TerminalLog, TerminalLogLevel, JSONRPCFrame } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { mcpServer, FOOD_SERVER, INSTAMART_SERVER } from "./mcp-server";

let CURRENT_PROFILE: FitnessProfile = {
  user_id: "user_palash_001",
  name: "Palash Shah",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  goal_type: "bulking",
  wearable_provider: "apple_health",
  wearable_synced_at: "Just now",
  targets: { calories: 2500, protein: 160, carbs: 250, fats: 80 },
  consumed: { calories: 1780, protein: 118, carbs: 175, fats: 52 },
  remaining: { calories: 720, protein: 42, carbs: 75, fats: 28 },
  activity_level: "Heavy Training",
  last_workout: "Heavy Leg Day · 2h ago (640 kcal burned)",
  streak_days: 14,
};

export function getFitnessProfile(): FitnessProfile {
  return {
    ...CURRENT_PROFILE,
    remaining: {
      calories: Math.max(0, CURRENT_PROFILE.targets.calories - CURRENT_PROFILE.consumed.calories),
      protein: Math.max(0, CURRENT_PROFILE.targets.protein - CURRENT_PROFILE.consumed.protein),
      carbs: Math.max(0, CURRENT_PROFILE.targets.carbs - CURRENT_PROFILE.consumed.carbs),
      fats: Math.max(0, CURRENT_PROFILE.targets.fats - CURRENT_PROFILE.consumed.fats),
    },
  };
}

export function updateFitnessProfile(updates: Partial<FitnessProfile>): FitnessProfile {
  CURRENT_PROFILE = {
    ...CURRENT_PROFILE,
    ...updates,
    targets: { ...CURRENT_PROFILE.targets, ...(updates.targets ?? {}) },
  };
  return getFitnessProfile();
}

function makeLog(
  level: TerminalLogLevel,
  server: string,
  tool: string,
  message: string,
  payload?: Record<string, unknown>,
  jsonrpc_request?: JSONRPCFrame,
  jsonrpc_response?: JSONRPCFrame,
  latency_ms?: number
): TerminalLog {
  return {
    id: generateId(),
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    level,
    server,
    tool,
    message,
    payload,
    jsonrpc_request,
    jsonrpc_response,
    latency_ms,
  };
}

function callMcp(
  server: string,
  method: string,
  params: Record<string, unknown> = {}
): { result: Record<string, unknown>; logs: TerminalLog[] } {
  const logs: TerminalLog[] = [];
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");

  logs.push(
    makeLog("calling", server, method, `Calling MCP Tool: ${method}(${paramStr})`, {
      server,
      method,
      params,
    })
  );

  const dispatchRes = mcpServer.dispatch(server, method, params);

  if (dispatchRes.error) {
    logs.push(
      makeLog(
        "error",
        server,
        method,
        dispatchRes.error.message,
        dispatchRes.error as unknown as Record<string, unknown>,
        dispatchRes.jsonrpc_request,
        dispatchRes.jsonrpc_response,
        dispatchRes.latency_ms
      )
    );
    return { result: {}, logs };
  }

  const result = dispatchRes.result ?? {};

  if (method === "get_addresses" && result.addresses) {
    const defaultAddr = result.default_address as { address_id: string; label: string } | undefined;
    logs.push(
      makeLog(
        "parsing",
        server,
        method,
        `Selected address: "${defaultAddr?.label ?? "Home"}" (${result.default_address ? "addr_home_001" : "default"})`,
        { addressId: defaultAddr?.address_id },
        dispatchRes.jsonrpc_request,
        dispatchRes.jsonrpc_response,
        dispatchRes.latency_ms
      )
    );
  } else if (method === "search_restaurants" || method === "search_products") {
    const results = (result.results as unknown[]) ?? [];
    logs.push(
      makeLog(
        "executing",
        server,
        method,
        `Retrieved ${result.total} matching options from ${server.replace("mcp.swiggy.com/", "")}`,
        { total: result.total, top_item: results[0] },
        dispatchRes.jsonrpc_request,
        dispatchRes.jsonrpc_response,
        dispatchRes.latency_ms
      )
    );
  } else if (method === "update_cart") {
    const token = String(result.checkout_token ?? "").slice(0, 16);
    logs.push(
      makeLog(
        "success",
        server,
        method,
        `Generated Swiggy Checkout session: token ${token}...`,
        { checkout_url: result.checkout_url },
        dispatchRes.jsonrpc_request,
        dispatchRes.jsonrpc_response,
        dispatchRes.latency_ms
      )
    );
  } else {
    logs.push(
      makeLog(
        "success",
        server,
        method,
        "Execution complete",
        result as Record<string, unknown>,
        dispatchRes.jsonrpc_request,
        dispatchRes.jsonrpc_response,
        dispatchRes.latency_ms
      )
    );
  }

  return { result: result as Record<string, unknown>, logs };
}

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  const instamartKeywords = ["grocery", "groceries", "instamart", "meal prep", "ingredients", "yogurt", "chicken breast", "buy", "stock up", "pantry", "tofu", "egg white"];
  const foodKeywords = ["dinner", "lunch", "breakfast", "restaurant", "meal", "order", "delivery", "spot", "bowl", "takeout", "eat", "food", "snack"];

  const instamartScore = instamartKeywords.filter((k) => lower.includes(k)).length;
  const foodScore = foodKeywords.filter((k) => lower.includes(k)).length;

  if (instamartScore > foodScore) return "instamart";
  if (foodScore > 0) return "food";
  return "auto";
}

function extractProteinTarget(message: string, remaining: number): number {
  const match = message.toLowerCase().match(/(\d+)\s*g?\s*\+?\s*protein/);
  if (match) return parseFloat(match[1]);
  if (message.toLowerCase().includes("high-protein") || message.toLowerCase().includes("high protein")) {
    return Math.max(35, Math.round(remaining * 0.85));
  }
  return Math.max(20, Math.round(remaining * 0.5));
}

function extractCalorieCap(message: string): number | null {
  const match = message.toLowerCase().match(/under\s+(\d+)\s*cal/);
  return match ? parseFloat(match[1]) : null;
}

interface FoodResult {
  item_id: string;
  name: string;
  restaurant_name?: string;
  image_url?: string;
  price: number;
  rating?: number;
  prep_time_mins?: number;
  macros: { calories: number; protein: number; carbs: number; fats: number };
  in_stock?: boolean;
  tags?: string[];
}

function orchestrateFood(profile: FitnessProfile, message: string) {
  const logs: TerminalLog[] = [];
  const minProtein = extractProteinTarget(message, profile.remaining.protein);
  const maxCalories = extractCalorieCap(message);

  const { result: addrResult, logs: addrLogs } = callMcp(FOOD_SERVER, "get_addresses");
  logs.push(...addrLogs);
  const addressId = String(addrResult.default_address_id ?? "addr_home_001");

  const searchParams: Record<string, unknown> = {
    address_id: addressId,
    cuisine: message.toLowerCase().includes("keto") ? "keto" : "healthy",
    min_protein: minProtein,
    sort_by: "rating",
  };
  if (maxCalories) searchParams.max_calories = maxCalories;

  const { result: searchResult, logs: searchLogs } = callMcp(FOOD_SERVER, "search_restaurants", searchParams);
  logs.push(...searchLogs);

  const results = (searchResult.results as FoodResult[]) ?? [];
  if (results.length === 0) {
    return { logs, cart: null, message: "No restaurants matched your exact macro criteria. Try broadening your request." };
  }

  let selected = results[0];

  if (selected.in_stock === false) {
    logs.push(
      makeLog("error", FOOD_SERVER, "search_restaurants", `Item "${selected.name}" is OUT OF STOCK — trigger auto-fallback`, {
        item_id: selected.item_id,
      })
    );
    const alt = mcpServer.findFoodAlternative(selected.item_id, minProtein);
    if (alt) {
      logs.push(
        makeLog("executing", FOOD_SERVER, "search_restaurants", `Auto-fallback matched → "${alt.name}" (${alt.macros.protein}g protein)`, alt as unknown as Record<string, unknown>)
      );
      selected = alt;
    } else {
      return { logs, cart: null, message: "Preferred item is currently out of stock." };
    }
  }

  const { result: cartResult, logs: cartLogs } = callMcp(FOOD_SERVER, "update_cart", {
    address_id: addressId,
    source: "food",
    items: [{ item_id: selected.item_id, quantity: 1 }],
  });
  logs.push(...cartLogs);

  const cart: CartSummary = {
    items: [
      {
        id: selected.item_id,
        name: selected.name,
        source: "food",
        restaurant: selected.restaurant_name,
        image_url: selected.image_url,
        price: selected.price,
        quantity: 1,
        macros: selected.macros,
        in_stock: selected.in_stock ?? true,
        rating: selected.rating,
        prep_time_mins: selected.prep_time_mins ?? 22,
        tags: selected.tags,
      },
    ],
    total_price: selected.price,
    total_macros: selected.macros,
    checkout_url: String(cartResult.checkout_url ?? ""),
    address_id: addressId,
    estimated_delivery_mins: 22,
  };

  const pct = Math.round((selected.macros.protein / profile.remaining.protein) * 100);
  const messageOut = `Selected **${selected.name}** from *${selected.restaurant_name ?? "Healthy Bites"}*.\n\n` +
    `• **Protein**: ${selected.macros.protein}g (${pct}% of your ${profile.remaining.protein}g target)\n` +
    `• **Calories**: ${selected.macros.calories} kcal\n` +
    `• **Carbs/Fats**: ${selected.macros.carbs}g / ${selected.macros.fats}g\n` +
    `• **Prep & Delivery**: ~${selected.prep_time_mins ?? 22} mins\n\n` +
    `Added to your Swiggy Cart with live checkout link ready.`;

  return { logs, cart, message: messageOut };
}

interface GroceryResult {
  product_id: string;
  name: string;
  brand?: string;
  image_url?: string;
  price: number;
  macros: { calories: number; protein: number; carbs: number; fats: number };
  in_stock?: boolean;
}

function orchestrateInstamart(profile: FitnessProfile, message: string) {
  const logs: TerminalLog[] = [];
  const minProtein = extractProteinTarget(message, profile.remaining.protein);
  const lower = message.toLowerCase();

  const { result: addrResult, logs: addrLogs } = callMcp(INSTAMART_SERVER, "get_addresses");
  logs.push(...addrLogs);
  const addressId = String(addrResult.default_address_id ?? "addr_home_001");

  let query = "protein";
  if (lower.includes("yogurt")) query = "yogurt";
  else if (lower.includes("chicken")) query = "chicken";
  else if (lower.includes("egg")) query = "egg";
  else if (lower.includes("tofu")) query = "tofu";

  const { result: searchResult, logs: searchLogs } = callMcp(INSTAMART_SERVER, "search_products", {
    address_id: addressId,
    query,
    min_protein: Math.min(minProtein, 10),
  });
  logs.push(...searchLogs);

  const results = (searchResult.results as GroceryResult[]) ?? [];
  if (results.length === 0) {
    return { logs, cart: null, message: "No Instamart products matched your query." };
  }

  const cartItems: CartSummary["items"] = [];
  const mcpCartItems: Array<{ product_id: string; quantity: number }> = [];
  let totalPrice = 0;
  const totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };

  for (let item of results.slice(0, 3)) {
    if (item.in_stock === false) {
      logs.push(
        makeLog("error", INSTAMART_SERVER, "search_products", `Item "${item.name}" out of stock — searching alternative`, {
          product_id: item.product_id,
        })
      );
      const alt = mcpServer.findGroceryAlternative(item.product_id, minProtein);
      if (alt) {
        logs.push(
          makeLog("executing", INSTAMART_SERVER, "search_products", `Fallback match → "${alt.name}"`, alt as unknown as Record<string, unknown>)
        );
        item = alt;
      } else {
        continue;
      }
    }

    cartItems.push({
      id: item.product_id,
      name: item.name,
      source: "instamart",
      restaurant: item.brand ?? "Instamart",
      image_url: item.image_url,
      price: item.price,
      quantity: 1,
      macros: item.macros,
      in_stock: item.in_stock ?? true,
      rating: 4.8,
      prep_time_mins: 12,
    });
    mcpCartItems.push({ product_id: item.product_id, quantity: 1 });
    totalPrice += item.price;
    totalMacros.calories += item.macros.calories;
    totalMacros.protein += item.macros.protein;
    totalMacros.carbs += item.macros.carbs;
    totalMacros.fats += item.macros.fats;
  }

  if (cartItems.length === 0) {
    return { logs, cart: null, message: "Matching Instamart items were unavailable." };
  }

  const { result: cartResult, logs: cartLogs } = callMcp(INSTAMART_SERVER, "update_cart", {
    address_id: addressId,
    source: "instamart",
    items: mcpCartItems,
  });
  logs.push(...cartLogs);

  const cart: CartSummary = {
    items: cartItems,
    total_price: totalPrice,
    total_macros: totalMacros,
    checkout_url: String(cartResult.checkout_url ?? ""),
    address_id: addressId,
    estimated_delivery_mins: 12,
  };

  const itemNames = cartItems.map((c) => c.name).join(", ");
  const messageOut = `Selected **${cartItems.length} Instamart essentials** for meal prep:\n\n` +
    `📦 ${itemNames}\n\n` +
    `• **Total Protein**: ${Math.round(totalMacros.protein)}g\n` +
    `• **Total Calories**: ${Math.round(totalMacros.calories)} kcal\n` +
    `• **Estimated Delivery**: 12 mins via Instamart Express\n\n` +
    `Cart updated and ready for checkout!`;

  return { logs, cart, message: messageOut };
}

export async function* runAgent(message: string): AsyncGenerator<Record<string, unknown>> {
  const profile = getFitnessProfile();

  yield { type: "profile", profile };
  yield {
    type: "log",
    log: makeLog(
      "info",
      "nutro.ai/telemetry",
      "analyze_macros",
      `Wearable Sync (${profile.wearable_provider}): ${profile.remaining.protein}g protein, ${profile.remaining.calories} kcal remaining today`,
      { remaining: profile.remaining, wearable: profile.wearable_provider }
    ),
  };

  let intent = detectIntent(message);
  if (intent === "auto") intent = profile.remaining.protein >= 30 ? "food" : "instamart";

  yield {
    type: "log",
    log: makeLog(
      "info",
      "nutro.ai/router",
      "route_intent",
      `Dispatching intent to Swiggy ${intent === "food" ? "Food Delivery" : "Instamart"} MCP Server`,
      { intent, server: intent === "food" ? FOOD_SERVER : INSTAMART_SERVER }
    ),
  };

  const { logs, cart, message: responseMsg } =
    intent === "instamart" ? orchestrateInstamart(profile, message) : orchestrateFood(profile, message);

  for (const log of logs) {
    yield { type: "log", log };
  }

  if (cart) yield { type: "cart", cart };

  const words = responseMsg.split(" ");
  let chunk = "";
  for (let i = 0; i < words.length; i++) {
    chunk += (i > 0 ? " " : "") + words[i];
    yield { type: "text", content: chunk };
  }

  yield { type: "done" };
}
