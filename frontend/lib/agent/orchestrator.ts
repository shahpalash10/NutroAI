import type { CartSummary, FitnessProfile, TerminalLog, TerminalLogLevel } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { mcpServer, FOOD_SERVER, INSTAMART_SERVER } from "./mcp-server";

const MOCK_PROFILE: FitnessProfile = {
  user_id: "user_palash_001",
  name: "Palash Shah",
  targets: { calories: 2500, protein: 160, carbs: 250, fats: 80 },
  consumed: { calories: 1800, protein: 120, carbs: 180, fats: 55 },
  remaining: { calories: 700, protein: 40, carbs: 70, fats: 25 },
  activity_level: "Heavy Training",
  last_workout: "Heavy Leg Day · 2h ago",
};

export function getFitnessProfile(): FitnessProfile {
  return {
    ...MOCK_PROFILE,
    remaining: {
      calories: Math.max(0, MOCK_PROFILE.targets.calories - MOCK_PROFILE.consumed.calories),
      protein: Math.max(0, MOCK_PROFILE.targets.protein - MOCK_PROFILE.consumed.protein),
      carbs: Math.max(0, MOCK_PROFILE.targets.carbs - MOCK_PROFILE.consumed.carbs),
      fats: Math.max(0, MOCK_PROFILE.targets.fats - MOCK_PROFILE.consumed.fats),
    },
  };
}

function makeLog(
  level: TerminalLogLevel,
  server: string,
  tool: string,
  message: string,
  payload?: Record<string, unknown>
): TerminalLog {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level,
    server,
    tool,
    message,
    payload,
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
    makeLog("calling", server, method, `tool: \`${method}(${paramStr})\``, {
      jsonrpc: "2.0",
      method,
      params,
    })
  );

  const response = mcpServer.dispatch(server, method, params);

  if (response.error) {
    logs.push(
      makeLog("error", server, method, response.error.message, response.error as unknown as Record<string, unknown>)
    );
    return { result: {}, logs };
  }

  const result = response.result ?? {};

  if (method === "get_addresses" && result.addresses) {
    logs.push(
      makeLog("parsing", server, method, `extracted \`addressId: "${result.default_address_id}"\``, {
        addressId: result.default_address_id,
      })
    );
  } else if (method === "search_restaurants" || method === "search_products") {
    const results = result.results as unknown[] | undefined;
    logs.push(
      makeLog("executing", server, method, `returned ${result.total} results`, {
        total: result.total,
        top_result: results?.[0],
      })
    );
  } else if (method === "update_cart") {
    const token = String(result.checkout_token ?? "").slice(0, 16);
    logs.push(
      makeLog("success", server, method, `checkout token generated → ${token}...`, {
        checkout_url: result.checkout_url,
      })
    );
  } else {
    logs.push(makeLog("success", server, method, "completed", result as Record<string, unknown>));
  }

  return { result: result as Record<string, unknown>, logs };
}

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  const instamartKeywords = ["grocery", "groceries", "instamart", "meal prep", "ingredients", "yogurt", "chicken breast", "buy", "stock up", "pantry"];
  const foodKeywords = ["dinner", "lunch", "breakfast", "restaurant", "meal", "order", "delivery", "spot", "bowl", "takeout", "eat", "food"];

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
    return Math.max(35, remaining * 0.8);
  }
  return Math.max(20, remaining * 0.5);
}

function extractCalorieCap(message: string): number | null {
  const match = message.toLowerCase().match(/under\s+(\d+)\s*cal/);
  return match ? parseFloat(match[1]) : null;
}

interface FoodResult {
  item_id: string;
  name: string;
  restaurant_name?: string;
  price: number;
  macros: { calories: number; protein: number; carbs: number; fats: number };
  in_stock?: boolean;
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
    cuisine: "healthy",
    min_protein: minProtein,
    sort_by: "rating",
  };
  if (maxCalories) searchParams.max_calories = maxCalories;

  const { result: searchResult, logs: searchLogs } = callMcp(FOOD_SERVER, "search_restaurants", searchParams);
  logs.push(...searchLogs);

  const results = (searchResult.results as FoodResult[]) ?? [];
  if (results.length === 0) {
    return { logs, cart: null, message: "No restaurants matched your macro criteria. Try adjusting your request." };
  }

  let selected = results[0];

  if (selected.in_stock === false) {
    logs.push(
      makeLog("error", FOOD_SERVER, "search_restaurants", `Item "${selected.name}" is OUT OF STOCK — seeking alternative`, {
        item_id: selected.item_id,
      })
    );
    const alt = mcpServer.findFoodAlternative(selected.item_id, minProtein);
    if (alt) {
      logs.push(
        makeLog("executing", FOOD_SERVER, "search_restaurants", `Auto-fallback → "${alt.name}" (${alt.macros.protein}g protein)`, alt as unknown as Record<string, unknown>)
      );
      selected = alt;
    } else {
      return { logs, cart: null, message: "Preferred item out of stock and no alternatives found." };
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
        price: selected.price,
        quantity: 1,
        macros: selected.macros,
        in_stock: selected.in_stock ?? true,
      },
    ],
    total_price: selected.price,
    total_macros: selected.macros,
    checkout_url: String(cartResult.checkout_url ?? ""),
  };

  const pct = Math.round((selected.macros.protein / profile.remaining.protein) * 100);
  const messageOut = `Found ${selected.name} from ${selected.restaurant_name ?? "a top-rated spot"} — ${selected.macros.protein}g protein, ${selected.macros.calories} kcal. Covers ${pct}% of your remaining protein target. Added to cart!`;

  return { logs, cart, message: messageOut };
}

interface GroceryResult {
  product_id: string;
  name: string;
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

  const { result: searchResult, logs: searchLogs } = callMcp(INSTAMART_SERVER, "search_products", {
    address_id: addressId,
    query,
    min_protein: Math.min(minProtein, 10),
  });
  logs.push(...searchLogs);

  const results = (searchResult.results as GroceryResult[]) ?? [];
  if (results.length === 0) {
    return { logs, cart: null, message: "No Instamart products matched. Try a different query." };
  }

  const cartItems: CartSummary["items"] = [];
  const mcpCartItems: Array<{ product_id: string; quantity: number }> = [];
  let totalPrice = 0;
  const totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };

  for (let item of results.slice(0, 3)) {
    if (item.in_stock === false) {
      logs.push(
        makeLog("error", INSTAMART_SERVER, "search_products", `Product "${item.name}" OUT OF STOCK — seeking alternative`, {
          product_id: item.product_id,
        })
      );
      const alt = mcpServer.findGroceryAlternative(item.product_id, minProtein);
      if (alt) {
        logs.push(
          makeLog("executing", INSTAMART_SERVER, "search_products", `Auto-fallback → "${alt.name}"`, alt as unknown as Record<string, unknown>)
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
      price: item.price,
      quantity: 1,
      macros: item.macros,
      in_stock: item.in_stock ?? true,
    });
    mcpCartItems.push({ product_id: item.product_id, quantity: 1 });
    totalPrice += item.price;
    totalMacros.calories += item.macros.calories;
    totalMacros.protein += item.macros.protein;
    totalMacros.carbs += item.macros.carbs;
    totalMacros.fats += item.macros.fats;
  }

  if (cartItems.length === 0) {
    return { logs, cart: null, message: "All matching products were out of stock." };
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
  };

  const names = cartItems.map((c) => c.name).join(", ");
  const messageOut = `Added ${cartItems.length} Instamart items to cart: ${names}. Combined: ${Math.round(totalMacros.protein)}g protein, ${Math.round(totalMacros.calories)} kcal.`;

  return { logs, cart, message: messageOut };
}

export async function* runAgent(message: string): AsyncGenerator<Record<string, unknown>> {
  const profile = getFitnessProfile();

  yield { type: "profile", profile };
  yield {
    type: "log",
    log: makeLog(
      "info",
      "nutro.ai/orchestrator",
      "analyze_macros",
      `Remaining: ${profile.remaining.protein}g protein, ${profile.remaining.calories} kcal`,
      profile.remaining as unknown as Record<string, unknown>
    ),
  };

  let intent = detectIntent(message);
  if (intent === "auto") intent = profile.remaining.protein >= 30 ? "food" : "instamart";

  yield {
    type: "log",
    log: makeLog(
      "info",
      "nutro.ai/orchestrator",
      "route_intent",
      `Routing to Swiggy ${intent === "food" ? "Food" : "Instamart"} MCP server`,
      { intent }
    ),
  };

  const { logs, cart, message: responseMsg } =
    intent === "instamart" ? orchestrateInstamart(profile, message) : orchestrateFood(profile, message);

  for (const log of logs) yield { type: "log", log };

  if (cart) yield { type: "cart", cart };

  const words = responseMsg.split(" ");
  let chunk = "";
  for (let i = 0; i < words.length; i++) {
    chunk += (i > 0 ? " " : "") + words[i];
    yield { type: "text", content: chunk };
  }

  yield { type: "done" };
}
