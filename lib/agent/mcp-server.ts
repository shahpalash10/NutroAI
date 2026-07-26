import type { MacroInfo, DeliveryAddress, JSONRPCFrame } from "@/lib/types";
import { generateId } from "@/lib/utils";

export const FOOD_SERVER = "mcp.swiggy.com/food";
export const INSTAMART_SERVER = "mcp.swiggy.com/instamart";

export interface FoodItem {
  item_id: string;
  name: string;
  restaurant_id: string;
  restaurant_name: string;
  image_url: string;
  price: number;
  rating: number;
  prep_time_mins: number;
  cuisine: string;
  macros: MacroInfo;
  in_stock: boolean;
  tags: string[];
}

export interface GroceryProduct {
  product_id: string;
  name: string;
  brand: string;
  image_url: string;
  price: number;
  unit: string;
  macros: MacroInfo;
  in_stock: boolean;
  category: string;
}

export interface DispatchResult {
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
  jsonrpc_request: JSONRPCFrame;
  jsonrpc_response: JSONRPCFrame;
  latency_ms: number;
}

class SwiggyMCPServer {
  private addresses: DeliveryAddress[] = [
    { address_id: "addr_home_001", label: "Home", line1: "42 Koramangala 5th Block", city: "Bangalore", pincode: "560095", is_default: true },
    { address_id: "addr_gym_098", label: "Gym (Cult Fit)", line1: "Indiranagar 100ft Road", city: "Bangalore", pincode: "560038" },
    { address_id: "addr_office_102", label: "Work", line1: "WeWork Embassy GolfLinks", city: "Bangalore", pincode: "560071" },
  ];

  private restaurants: FoodItem[] = [
    {
      item_id: "food_001",
      name: "Keto Grilled Chicken & Avocado Bowl",
      restaurant_id: "rest_healthy_bites",
      restaurant_name: "Healthy Bites",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      price: 349,
      rating: 4.9,
      prep_time_mins: 22,
      cuisine: "healthy",
      macros: { calories: 420, protein: 45, carbs: 12, fats: 18 },
      in_stock: true,
      tags: ["keto", "high-protein", "low-carb", "bestseller"],
    },
    {
      item_id: "food_002",
      name: "Protein Power Paneer Tikka Bowl",
      restaurant_id: "rest_fit_kitchen",
      restaurant_name: "Fit Kitchen",
      image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
      price: 299,
      rating: 4.8,
      prep_time_mins: 18,
      cuisine: "healthy",
      macros: { calories: 380, protein: 42, carbs: 15, fats: 14 },
      in_stock: true,
      tags: ["high-protein", "vegetarian", "gluten-free"],
    },
    {
      item_id: "food_003",
      name: "Double Chicken Breast Feast",
      restaurant_id: "rest_protein_lab",
      restaurant_name: "Protein Lab",
      image_url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
      price: 399,
      rating: 4.9,
      prep_time_mins: 25,
      cuisine: "healthy",
      macros: { calories: 520, protein: 58, carbs: 18, fats: 16 },
      in_stock: true,
      tags: ["high-protein", "bulking", "muscle-fuel"],
    },
    {
      item_id: "food_004",
      name: "Post-Workout Egg White Omelette",
      restaurant_id: "rest_muscle_meals",
      restaurant_name: "Muscle Meals",
      image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
      price: 249,
      rating: 4.6,
      prep_time_mins: 15,
      cuisine: "healthy",
      macros: { calories: 310, protein: 38, carbs: 6, fats: 12 },
      in_stock: false, // simulated out of stock for fallback testing
      tags: ["post-workout", "high-protein", "low-cal"],
    },
    {
      item_id: "food_005",
      name: "Lean Salmon Teriyaki & Broccoli",
      restaurant_id: "rest_ocean_grill",
      restaurant_name: "Ocean Grill",
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
      price: 549,
      rating: 4.7,
      prep_time_mins: 28,
      cuisine: "seafood",
      macros: { calories: 460, protein: 48, carbs: 8, fats: 22 },
      in_stock: true,
      tags: ["high-protein", "omega-3", "clean"],
    },
    {
      item_id: "food_006",
      name: "Quinoa & Roasted Tofu Buddha Bowl",
      restaurant_id: "rest_green_spoon",
      restaurant_name: "Green Spoon",
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      price: 279,
      rating: 4.5,
      prep_time_mins: 20,
      cuisine: "healthy",
      macros: { calories: 390, protein: 24, carbs: 52, fats: 12 },
      in_stock: true,
      tags: ["vegan", "high-fiber", "balanced"],
    },
  ];

  private groceries: GroceryProduct[] = [
    {
      product_id: "groc_001",
      name: "Greek Yogurt Natural (500g)",
      brand: "Epigamia",
      image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
      price: 149,
      unit: "500g",
      macros: { calories: 120, protein: 18, carbs: 8, fats: 3 },
      in_stock: true,
      category: "dairy",
    },
    {
      product_id: "groc_002",
      name: "Whey Protein Isolate (1kg)",
      brand: "MuscleBlaze",
      image_url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80",
      price: 2499,
      unit: "1kg",
      macros: { calories: 120, protein: 25, carbs: 2, fats: 1 },
      in_stock: true,
      category: "supplements",
    },
    {
      product_id: "groc_003",
      name: "Boneless Chicken Breast (500g)",
      brand: "Licious",
      image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
      price: 199,
      unit: "500g",
      macros: { calories: 165, protein: 31, carbs: 0, fats: 4 },
      in_stock: true,
      category: "meat",
    },
    {
      product_id: "groc_004",
      name: "Pasteurized Egg Whites (500ml)",
      brand: "Eggoz",
      image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
      price: 119,
      unit: "500ml",
      macros: { calories: 52, protein: 12, carbs: 1, fats: 0 },
      in_stock: true,
      category: "dairy",
    },
    {
      product_id: "groc_005",
      name: "High Protein Tofu Block (250g)",
      brand: "Disano",
      image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80",
      price: 99,
      unit: "250g",
      macros: { calories: 140, protein: 18, carbs: 3, fats: 7 },
      in_stock: true,
      category: "vegan",
    },
    {
      product_id: "groc_006",
      name: "Fresh Avocados (2 pcs)",
      brand: "Fresho",
      image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
      price: 129,
      unit: "2 pcs",
      macros: { calories: 160, protein: 2, carbs: 9, fats: 15 },
      in_stock: true,
      category: "produce",
    },
  ];

  dispatch(server: string, method: string, params: Record<string, unknown> = {}): DispatchResult {
    const id = generateId().slice(0, 8);
    const jsonrpc_request: JSONRPCFrame = {
      jsonrpc: "2.0",
      id,
      method: `${server}/${method}`,
      params,
    };
    const startTime = Date.now();

    try {
      let result: Record<string, unknown>;
      switch (method) {
        case "get_addresses":
          result = { addresses: this.addresses, default_address: this.addresses[0] };
          break;
        case "search_restaurants":
          result = this.searchRestaurants(params);
          break;
        case "search_products":
          result = this.searchProducts(params);
          break;
        case "update_cart":
          result = this.updateCart(params);
          break;
        default:
          throw new Error(`Method not found: ${method}`);
      }

      const latency_ms = Math.floor(Math.random() * 45) + 35;
      const jsonrpc_response: JSONRPCFrame = {
        jsonrpc: "2.0",
        id,
        method: `${server}/${method}`,
        result,
      };

      return {
        result,
        jsonrpc_request,
        jsonrpc_response,
        latency_ms: Date.now() - startTime + latency_ms,
      };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Unknown error";
      const jsonrpc_response: JSONRPCFrame = {
        jsonrpc: "2.0",
        id,
        method: `${server}/${method}`,
        error: { code: -32601, message: errMsg },
      };
      return {
        error: { code: -32601, message: errMsg },
        jsonrpc_request,
        jsonrpc_response,
        latency_ms: 25,
      };
    }
  }

  private searchRestaurants(params: Record<string, unknown>) {
    const cuisine = String(params.cuisine ?? "").toLowerCase();
    const minProtein = Number(params.min_protein ?? 0);
    const maxCalories = params.max_calories != null ? Number(params.max_calories) : null;
    const sortBy = String(params.sort_by ?? "rating");

    let filtered = [...this.restaurants];
    if (cuisine) {
      filtered = filtered.filter(
        (r) => r.cuisine.includes(cuisine) || r.tags.some((t) => t.includes(cuisine))
      );
    }
    if (minProtein > 0) filtered = filtered.filter((r) => r.macros.protein >= minProtein);
    if (maxCalories != null) filtered = filtered.filter((r) => r.macros.calories <= maxCalories);

    if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "protein") filtered.sort((a, b) => b.macros.protein - a.macros.protein);

    return {
      address_id: params.address_id ?? this.addresses[0].address_id,
      results: filtered,
      total: filtered.length,
      estimated_delivery_mins: 24,
    };
  }

  private searchProducts(params: Record<string, unknown>) {
    const query = String(params.query ?? "").toLowerCase();
    const minProtein = Number(params.min_protein ?? 0);

    let filtered = [...this.groceries];
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    if (minProtein > 0) filtered = filtered.filter((p) => p.macros.protein >= minProtein);

    return {
      address_id: params.address_id ?? this.addresses[0].address_id,
      results: filtered,
      total: filtered.length,
      estimated_delivery_mins: 12,
    };
  }

  private updateCart(params: Record<string, unknown>) {
    const items = (params.items as unknown[]) ?? [];
    const token = generateId().replace(/-/g, "").slice(0, 24);
    const selectedAddress = this.addresses.find((a) => a.address_id === params.address_id) ?? this.addresses[0];

    return {
      cart_id: generateId(),
      checkout_url: `https://swiggy.com/checkout/${token}`,
      checkout_token: token,
      item_count: items.length,
      address: selectedAddress,
      estimated_delivery_mins: params.source === "instamart" ? 12 : 24,
    };
  }

  findFoodAlternative(excludeId: string, minProtein: number): FoodItem | undefined {
    return this.restaurants
      .filter((r) => r.item_id !== excludeId && r.in_stock && r.macros.protein >= minProtein)
      .sort((a, b) => b.rating - a.rating)[0];
  }

  findGroceryAlternative(excludeId: string, minProtein: number): GroceryProduct | undefined {
    return this.groceries.find(
      (p) => p.product_id !== excludeId && p.in_stock && p.macros.protein >= minProtein
    );
  }

  getAddresses(): DeliveryAddress[] {
    return this.addresses;
  }
}

export const mcpServer = new SwiggyMCPServer();
