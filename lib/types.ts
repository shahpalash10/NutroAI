export type WearableProvider = "apple_health" | "garmin" | "whoop" | "oura" | "fitbit";
export type FitnessGoalType = "bulking" | "cutting" | "recomp" | "keto" | "endurance";
export type ViewMode = "desktop" | "mobile";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MacroConsumed {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FitnessProfile {
  user_id: string;
  name: string;
  avatar_url?: string;
  goal_type: FitnessGoalType;
  wearable_provider: WearableProvider;
  wearable_synced_at: string;
  targets: MacroTargets;
  consumed: MacroConsumed;
  remaining: MacroTargets;
  activity_level: string;
  last_workout: string;
  streak_days: number;
}

export interface MacroInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface CartItem {
  id: string;
  name: string;
  source: "food" | "instamart";
  restaurant?: string;
  image_url?: string;
  price: number;
  quantity: number;
  macros: MacroInfo;
  in_stock: boolean;
  rating?: number;
  prep_time_mins?: number;
  tags?: string[];
}

export interface CartSummary {
  items: CartItem[];
  total_price: number;
  total_macros: MacroInfo;
  checkout_url: string | null;
  address_id?: string;
  address_label?: string;
  estimated_delivery_mins?: number;
}

export type TerminalLogLevel = "calling" | "parsing" | "executing" | "success" | "error" | "info";

export interface JSONRPCFrame {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id?: string | number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: TerminalLogLevel;
  server: string;
  tool: string;
  message: string;
  payload?: Record<string, unknown>;
  jsonrpc_request?: JSONRPCFrame;
  jsonrpc_response?: JSONRPCFrame;
  latency_ms?: number;
}

export interface DeliveryAddress {
  address_id: string;
  label: string;
  line1: string;
  city: string;
  pincode: string;
  is_default?: boolean;
}

export interface AgentResponse {
  message: string;
  logs: TerminalLog[];
  cart: CartSummary | null;
  profile: FitnessProfile | null;
}

export interface ChatStreamEvent {
  type: "text" | "log" | "cart" | "profile" | "done";
  content?: string;
  log?: TerminalLog;
  cart?: CartSummary;
  profile?: FitnessProfile;
}
