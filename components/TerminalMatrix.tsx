"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Circle, Code2, ChevronDown, ChevronUp, Cpu, Server, Network, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TerminalLog, TerminalLogLevel } from "@/lib/types";

interface TerminalMatrixProps {
  logs: TerminalLog[];
  active?: boolean;
}

const LEVEL_CONFIG: Record<TerminalLogLevel, { icon: "done" | "loading" | "error" | "pending"; color: string }> = {
  calling: { icon: "loading", color: "text-amber-400" },
  parsing: { icon: "loading", color: "text-orange-400" },
  executing: { icon: "loading", color: "text-blue-400" },
  success: { icon: "done", color: "text-emerald-400" },
  error: { icon: "error", color: "text-rose-400" },
  info: { icon: "pending", color: "text-slate-400" },
};

export function TerminalMatrix({ logs, active }: TerminalMatrixProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const displayLogs = logs.filter((l) => l.level !== "info" || l.tool === "analyze_macros" || l.tool === "route_intent");

  return (
    <div className="glass-card overflow-hidden border border-white/10 flex flex-col h-[480px]">
      {/* Header & Topology Graph Bar */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              MCP Protocol & Debug Matrix
              {active && <span className="text-[10px] font-mono font-semibold text-orange-400 animate-pulse">● EXECUTING</span>}
            </h2>
            <p className="text-[11px] text-slate-400">JSON-RPC 2.0 packet streams & tool dispatches</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
            {displayLogs.length} events logged
          </span>
        </div>
      </div>

      {/* Network Nodes Visualizer Bar */}
      <div className="px-5 py-3 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-semibold text-white">Nutro Orchestrator</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-gradient-to-r from-orange-500/40 via-teal-500/40 to-emerald-500/40 rounded-full" />
        <div className="flex items-center gap-1.5 text-slate-300">
          <Server className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-teal-300">Swiggy MCP Servers</span>
        </div>
      </div>

      {/* Main Content Area: Log Stream + Inspector Drawer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left / Top: Interactive Step Timeline */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayLogs.length === 0 && !active ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
              <Code2 className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-xs">No active MCP invocations.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Send a prompt in Copilot Chat to view live JSON-RPC telemetry.</p>
            </div>
          ) : (
            displayLogs.map((log) => {
              const cfg = LEVEL_CONFIG[log.level];
              const isSelected = selectedLogId === log.id;
              const hasJson = !!(log.jsonrpc_request || log.jsonrpc_response);

              return (
                <div
                  key={log.id}
                  onClick={() => hasJson && setSelectedLogId(isSelected ? null : log.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-xs cursor-pointer",
                    isSelected
                      ? "bg-slate-800 border-orange-500/50 shadow-md"
                      : "bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LogIcon level={log.level} />
                      <span className="font-bold text-white font-heading">{getFriendlyMessage(log)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.latency_ms && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {log.latency_ms}ms
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                      {hasJson && (
                        <span className="text-slate-400">
                          {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 pl-6 text-[11px] text-slate-400">
                    <span className="font-mono text-teal-400/90">{log.server}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{log.tool}</span>
                  </div>

                  {/* Inline Expanded JSON Inspector */}
                  {isSelected && hasJson && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-150">
                      {log.jsonrpc_request && (
                        <div>
                          <p className="text-[10px] font-mono uppercase text-orange-400 font-semibold mb-1">JSON-RPC 2.0 Request</p>
                          <pre className="p-2.5 rounded-lg bg-slate-950 text-[10px] font-mono text-slate-300 overflow-x-auto border border-white/5">
                            {JSON.stringify(log.jsonrpc_request, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.jsonrpc_response && (
                        <div>
                          <p className="text-[10px] font-mono uppercase text-emerald-400 font-semibold mb-1">JSON-RPC 2.0 Response</p>
                          <pre className="p-2.5 rounded-lg bg-slate-950 text-[10px] font-mono text-emerald-300/90 overflow-x-auto border border-white/5">
                            {JSON.stringify(log.jsonrpc_response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function LogIcon({ level }: { level: TerminalLogLevel }) {
  if (level === "success") {
    return (
      <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
      </div>
    );
  }
  if (level === "calling" || level === "parsing" || level === "executing") {
    return (
      <div className="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
        <Loader2 className="w-2.5 h-2.5 text-orange-400 animate-spin" />
      </div>
    );
  }
  if (level === "error") {
    return (
      <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
      </div>
    );
  }
  return (
    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
      <Circle className="w-1.5 h-1.5 text-slate-500 fill-slate-500" />
    </div>
  );
}

function getFriendlyMessage(log: TerminalLog): string {
  if (log.tool === "get_addresses") return "Validating Delivery Geofence";
  if (log.tool === "search_restaurants") {
    if (log.level === "executing") return "Filtering Healthy Restaurants by Macro Budget";
    if (log.level === "error") return log.message;
    return "Querying Swiggy Food MCP Catalog";
  }
  if (log.tool === "search_products") {
    if (log.level === "executing") return "Matching Instamart Grocery Inventory";
    if (log.level === "error") return log.message;
    return "Querying Instamart MCP Catalog";
  }
  if (log.tool === "update_cart") return "Synthesizing Swiggy Checkout Payload";
  if (log.tool === "analyze_macros") return "Reading Active Wearable Telemetry";
  if (log.tool === "route_intent") return log.message.includes("Instamart") ? "Intent Router → Swiggy Instamart" : "Intent Router → Swiggy Food";
  return log.message;
}
