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
  targets: MacroTargets;
  consumed: MacroConsumed;
  remaining: MacroTargets;
  activity_level: string;
  last_workout: string;
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
  price: number;
  quantity: number;
  macros: MacroInfo;
  in_stock: boolean;
}

export interface CartSummary {
  items: CartItem[];
  total_price: number;
  total_macros: MacroInfo;
  checkout_url: string | null;
}

export type TerminalLogLevel = "calling" | "parsing" | "executing" | "success" | "error" | "info";

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: TerminalLogLevel;
  server: string;
  tool: string;
  message: string;
  payload?: Record<string, unknown>;
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
