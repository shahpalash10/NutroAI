import type { MacroInfo } from "@/lib/types";
import { generateId } from "@/lib/utils";

export const FOOD_SERVER = "mcp.swiggy.com/food";
export const INSTAMART_SERVER = "mcp.swiggy.com/instamart";

interface FoodItem {
  item_id: string;
  name: string;
  restaurant_id: string;
  restaurant_name: string;
  price: number;
  rating: number;
  cuisine: string;
  macros: MacroInfo;
  in_stock: boolean;
  tags: string[];
}

interface GroceryProduct {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  macros: MacroInfo;
  in_stock: boolean;
  category: string;
}

interface JsonRpcResponse {
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

class SwiggyMCPServer {
  private addresses = [
    { address_id: "addr_home_001", label: "Home", line1: "42 Koramangala 5th Block", city: "Bangalore", pincode: "560095", lat: 12.9352, lng: 77.6245 },
    { address_id: "addr_gym_098", label: "Gym", line1: "Cult Fit, Indiranagar", city: "Bangalore", pincode: "560038", lat: 12.9784, lng: 77.6408 },
  ];

  private restaurants: FoodItem[] = [
    { item_id: "food_001", name: "Keto Grilled Chicken Bowl", restaurant_id: "rest_healthy_bites", restaurant_name: "Healthy Bites", price: 349, rating: 4.6, cuisine: "healthy", macros: { calories: 420, protein: 45, carbs: 12, fats: 18 }, in_stock: true, tags: ["keto", "high-protein", "low-carb"] },
    { item_id: "food_002", name: "Protein Power Paneer Tikka", restaurant_id: "rest_fit_kitchen", restaurant_name: "Fit Kitchen", price: 299, rating: 4.8, cuisine: "healthy", macros: { calories: 380, protein: 42, carbs: 15, fats: 14 }, in_stock: true, tags: ["high-protein", "vegetarian"] },
    { item_id: "food_003", name: "Lean Muscle Salmon Plate", restaurant_id: "rest_ocean_grill", restaurant_name: "Ocean Grill", price: 549, rating: 4.7, cuisine: "seafood", macros: { calories: 460, protein: 48, carbs: 8, fats: 22 }, in_stock: true, tags: ["high-protein", "omega-3"] },
    { item_id: "food_004", name: "Post-Workout Egg White Omelette", restaurant_id: "rest_muscle_meals", restaurant_name: "Muscle Meals", price: 249, rating: 4.5, cuisine: "healthy", macros: { calories: 310, protein: 38, carbs: 6, fats: 12 }, in_stock: false, tags: ["post-workout", "high-protein"] },
    { item_id: "food_005", name: "Quinoa Buddha Bowl", restaurant_id: "rest_green_spoon", restaurant_name: "Green Spoon", price: 279, rating: 4.4, cuisine: "healthy", macros: { calories: 390, protein: 18, carbs: 52, fats: 12 }, in_stock: true, tags: ["balanced", "vegetarian"] },
    { item_id: "food_006", name: "Double Chicken Breast Meal", restaurant_id: "rest_protein_lab", restaurant_name: "Protein Lab", price: 399, rating: 4.9, cuisine: "healthy", macros: { calories: 520, protein: 55, carbs: 20, fats: 16 }, in_stock: true, tags: ["high-protein", "bulking"] },
  ];

  private groceries: GroceryProduct[] = [
    { product_id: "groc_001", name: "Greek Yogurt (500g)", brand: "Epigamia", price: 149, unit: "500g", macros: { calories: 120, protein: 15, carbs: 8, fats: 3 }, in_stock: true, category: "dairy" },
    { product_id: "groc_002", name: "Whey Protein Isolate (1kg)", brand: "MuscleBlaze", price: 2499, unit: "1kg", macros: { calories: 120, protein: 25, carbs: 2, fats: 1 }, in_stock: true, category: "supplements" },
    { product_id: "groc_003", name: "Chicken Breast (500g)", brand: "Licious", price: 199, unit: "500g", macros: { calories: 165, protein: 31, carbs: 0, fats: 4 }, in_stock: true, category: "meat" },
    { product_id: "groc_004", name: "Brown Rice (1kg)", brand: "India Gate", price: 89, unit: "1kg", macros: { calories: 112, protein: 3, carbs: 24, fats: 1 }, in_stock: true, category: "grains" },
    { product_id: "groc_005", name: "Avocado (2 pcs)", brand: "Fresho", price: 129, unit: "2 pcs", macros: { calories: 160, protein: 2, carbs: 9, fats: 15 }, in_stock: true, category: "produce" },
    { product_id: "groc_006", name: "Almond Butter (200g)", brand: "Pintola", price: 349, unit: "200g", macros: { calories: 98, protein: 3, carbs: 3, fats: 9 }, in_stock: false, category: "spreads" },
    { product_id: "groc_007", name: "Egg Whites (500ml)", brand: "Eggoz", price: 119, unit: "500ml", macros: { calories: 52, protein: 11, carbs: 1, fats: 0 }, in_stock: true, category: "dairy" },
  ];

  dispatch(_server: string, method: string, params: Record<string, unknown> = {}): JsonRpcResponse {
    try {
      switch (method) {
        case "get_addresses":
          return { result: { addresses: this.addresses, default_address_id: this.addresses[0].address_id } };
        case "search_restaurants":
          return { result: this.searchRestaurants(params) };
        case "search_products":
          return { result: this.searchProducts(params) };
        case "update_cart":
          return { result: this.updateCart(params) };
        default:
          return { error: { code: -32601, message: `Method not found: ${method}` } };
      }
    } catch (e) {
      return { error: { code: -32000, message: e instanceof Error ? e.message : "Unknown error" } };
    }
  }

  private searchRestaurants(params: Record<string, unknown>) {
    const cuisine = String(params.cuisine ?? "").toLowerCase();
    const minProtein = Number(params.min_protein ?? 0);
    const maxCalories = params.max_calories != null ? Number(params.max_calories) : null;
    const sortBy = String(params.sort_by ?? "rating");

    let filtered = [...this.restaurants];
    if (cuisine) {
      filtered = filtered.filter((r) => r.cuisine.includes(cuisine) || r.tags.some((t) => t.includes(cuisine)));
    }
    if (minProtein > 0) filtered = filtered.filter((r) => r.macros.protein >= minProtein);
    if (maxCalories != null) filtered = filtered.filter((r) => r.macros.calories <= maxCalories);

    if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "protein") filtered.sort((a, b) => b.macros.protein - a.macros.protein);

    return { address_id: params.address_id ?? this.addresses[0].address_id, results: filtered, total: filtered.length };
  }

  private searchProducts(params: Record<string, unknown>) {
    const query = String(params.query ?? "").toLowerCase();
    const minProtein = Number(params.min_protein ?? 0);

    let filtered = [...this.groceries];
    if (query) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }
    if (minProtein > 0) filtered = filtered.filter((p) => p.macros.protein >= minProtein);

    return { address_id: params.address_id ?? this.addresses[0].address_id, results: filtered, total: filtered.length };
  }

  private updateCart(params: Record<string, unknown>) {
    const items = params.items as unknown[] ?? [];
    const token = generateId().replace(/-/g, "") + generateId().replace(/-/g, "");
    return {
      cart_id: generateId(),
      checkout_url: `https://swiggy.com/checkout/${token}`,
      checkout_token: token,
      item_count: items.length,
      address_id: params.address_id ?? this.addresses[0].address_id,
    };
  }

  findFoodAlternative(excludeId: string, minProtein: number): FoodItem | undefined {
    return this.restaurants
      .filter((r) => r.item_id !== excludeId && r.in_stock && r.macros.protein >= minProtein)
      .sort((a, b) => b.rating - a.rating)[0];
  }

  findGroceryAlternative(excludeId: string, minProtein: number): GroceryProduct | undefined {
    return this.groceries.find((p) => p.product_id !== excludeId && p.in_stock && p.macros.protein >= minProtein);
  }
}

export const mcpServer = new SwiggyMCPServer();
