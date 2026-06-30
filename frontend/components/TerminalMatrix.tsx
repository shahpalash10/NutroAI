"use client";

import { useEffect, useRef } from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TerminalLog, TerminalLogLevel } from "@/lib/types";

interface TerminalMatrixProps {
  logs: TerminalLog[];
  active?: boolean;
}

const LEVEL_ICON: Record<TerminalLogLevel, { icon: "done" | "loading" | "error" | "pending"; label: string }> = {
  calling: { icon: "loading", label: "Connecting" },
  parsing: { icon: "loading", label: "Processing" },
  executing: { icon: "loading", label: "Finding items" },
  success: { icon: "done", label: "Done" },
  error: { icon: "error", label: "Issue found" },
  info: { icon: "pending", label: "Checking" },
};

function StepIcon({ type }: { type: "done" | "loading" | "error" | "pending" }) {
  if (type === "done") {
    return (
      <div className="w-5 h-5 rounded-full bg-swiggy-green flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (type === "loading") {
    return (
      <div className="w-5 h-5 rounded-full bg-swiggy-orange-light flex items-center justify-center shrink-0">
        <Loader2 className="w-3 h-3 text-swiggy-orange animate-spin" />
      </div>
    );
  }
  if (type === "error") {
    return (
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <span className="text-red-500 text-xs font-bold">!</span>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-swiggy-border flex items-center justify-center shrink-0">
      <Circle className="w-2 h-2 text-swiggy-light-gray fill-swiggy-light-gray" />
    </div>
  );
}

export function TerminalMatrix({ logs, active }: TerminalMatrixProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const displayLogs = logs.filter((l) => l.level !== "info" || l.tool === "analyze_macros");

  return (
    <div className="mx-4">
      <div className="swiggy-card overflow-hidden">
        <div className="px-4 py-3 border-b border-swiggy-border">
          <h2 className="text-sm font-bold text-swiggy-dark">Order progress</h2>
          <p className="text-xs text-swiggy-gray mt-0.5">Live updates from Nutro AI</p>
        </div>

        <div ref={scrollRef} className="px-4 py-3 max-h-[200px] overflow-y-auto">
          {displayLogs.length === 0 && !active ? (
            <p className="text-xs text-swiggy-light-gray text-center py-4">
              Ask Nutro AI for a meal to see live progress here
            </p>
          ) : (
            <div className="space-y-0">
              {displayLogs.map((log, idx) => {
                const cfg = LEVEL_ICON[log.level];
                const isLast = idx === displayLogs.length - 1;
                const friendlyMessage = getFriendlyMessage(log);

                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <StepIcon type={isLast && active && cfg.icon === "loading" ? "loading" : cfg.icon === "loading" && !isLast ? "done" : cfg.icon} />
                      {idx < displayLogs.length - 1 && (
                        <div className="w-0.5 flex-1 min-h-[16px] bg-swiggy-border my-1" />
                      )}
                    </div>
                    <div className={cn("pb-3 flex-1 min-w-0", idx === displayLogs.length - 1 && "pb-0")}>
                      <p className="text-xs font-semibold text-swiggy-dark leading-snug">{friendlyMessage}</p>
                      <p className="text-[11px] text-swiggy-light-gray mt-0.5 truncate">
                        {log.server.replace("mcp.swiggy.com/", "")}
                        {log.tool ? ` · ${log.tool}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}

              {active && displayLogs.length > 0 && (
                <div className="flex gap-3">
                  <StepIcon type="loading" />
                  <p className="text-xs text-swiggy-orange font-medium pb-1">Working on it...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getFriendlyMessage(log: TerminalLog): string {
  if (log.tool === "get_addresses") return "Finding your delivery address";
  if (log.tool === "search_restaurants") {
    if (log.level === "executing") return "Found restaurants matching your macros";
    if (log.level === "error") return log.message;
    return "Searching top-rated healthy spots nearby";
  }
  if (log.tool === "search_products") {
    if (log.level === "executing") return "Found groceries for your meal plan";
    if (log.level === "error") return log.message;
    return "Browsing Instamart for macro-friendly items";
  }
  if (log.tool === "update_cart") return "Added items to your cart";
  if (log.tool === "analyze_macros") return "Checked your remaining daily macros";
  if (log.tool === "route_intent") return log.message.includes("Instamart") ? "Opening Instamart" : "Opening Food delivery";
  if (log.level === "error") return log.message;
  return log.message;
}
