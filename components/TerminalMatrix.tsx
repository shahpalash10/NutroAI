"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Circle, Code2, ChevronDown, ChevronUp, Cpu, Server, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TerminalLog, TerminalLogLevel } from "@/lib/types";

interface TerminalMatrixProps {
  logs: TerminalLog[];
  active?: boolean;
}

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
    <div className="coniq-card p-6 border border-white/15 flex flex-col h-[520px]">
      {/* Toyota Coniq Pro Section Heading */}
      <div className="el_headingBlock">
        <div className="flex items-baseline gap-2">
          <span className="el_headingBlock_num">04-</span>
          <h2 className="el_headingBlock_title">MCP SERVERS(TEST)</h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="el_headingBlock_sub uppercase hidden sm:inline">JSON-RPC 2.0 PROTOCOL STREAM</span>
          {active && <span className="px-2 py-0.5 bg-[#fc8019] text-white font-bold ff_eng rounded">EXECUTING</span>}
        </div>
      </div>

      {/* Topology Nodes Indicator Bar */}
      <div className="px-4 py-2.5 bg-[#141620] border border-white/15 flex items-center justify-between text-xs font-mono mb-4 rounded-lg">
        <div className="flex items-center gap-2 text-slate-300">
          <Cpu className="w-4 h-4 text-[#fc8019]" />
          <span className="font-bold text-white uppercase">NUTRO ORCHESTRATOR</span>
        </div>
        <div className="h-0.5 flex-1 mx-4 bg-gradient-to-r from-[#fc8019] via-[#60b246] to-[#fc8019]" />
        <div className="flex items-center gap-2 text-slate-300">
          <Server className="w-4 h-4 text-[#60b246]" />
          <span className="font-bold text-[#60b246] uppercase">SWIGGY MCP SERVERS</span>
        </div>
      </div>

      {/* Log Items Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
        {displayLogs.length === 0 && !active ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
            <Code2 className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-xs font-bold uppercase ff_eng">NO ACTIVE MCP PROTOCOL INVOCATIONS</p>
            <p className="text-[11px] text-slate-600 mt-1">Send a query to stream JSON-RPC 2.0 frames.</p>
          </div>
        ) : (
          displayLogs.map((log, index) => {
            const isSelected = selectedLogId === log.id;
            const hasJson = !!(log.jsonrpc_request || log.jsonrpc_response);
            const numLabel = `#0${index + 1}`;

            return (
              <div
                key={log.id}
                onClick={() => hasJson && setSelectedLogId(isSelected ? null : log.id)}
                className={cn(
                  "p-3.5 bg-[#141620] border border-white/15 transition-colors cursor-pointer rounded-lg",
                  isSelected ? "border-[#fc8019] bg-[#1d2130]" : "hover:border-white/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#fc8019] ff_eng">{numLabel}</span>
                    <LogIcon level={log.level} />
                    <span className="font-bold text-white font-sans text-xs">{getFriendlyMessage(log)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    {log.latency_ms && (
                      <span className="px-1.5 py-0.5 bg-[#60b246]/20 text-[#60b246] border border-[#60b246]/30 font-bold rounded">
                        {log.latency_ms}MS
                      </span>
                    )}
                    <span className="text-slate-400">{log.timestamp}</span>
                    {hasJson && (
                      <span className="text-slate-400">
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5 pl-10 text-[11px] text-slate-400">
                  <span className="text-[#60b246] font-bold">{log.server}</span>
                  <span className="text-slate-500 font-mono">::</span>
                  <span className="text-white">{log.tool}</span>
                </div>

                {/* Expanded JSON Inspector */}
                {isSelected && hasJson && (
                  <div className="mt-3 pt-3 border-t border-white/15 space-y-2 animate-in fade-in duration-150">
                    {log.jsonrpc_request && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#fc8019] ff_eng mb-1">JSON-RPC 2.0 REQUEST</p>
                        <pre className="p-3 bg-[#12141d] text-[10px] font-mono text-slate-300 overflow-x-auto border border-white/10 rounded">
                          {JSON.stringify(log.jsonrpc_request, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.jsonrpc_response && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#60b246] ff_eng mb-1">JSON-RPC 2.0 RESPONSE</p>
                        <pre className="p-3 bg-[#12141d] text-[10px] font-mono text-[#60b246]/90 overflow-x-auto border border-white/10 rounded">
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
  );
}

function LogIcon({ level }: { level: TerminalLogLevel }) {
  if (level === "success") {
    return (
      <div className="w-4 h-4 bg-[#60b246]/20 border border-[#60b246] flex items-center justify-center shrink-0 rounded">
        <Check className="w-2.5 h-2.5 text-[#60b246]" strokeWidth={3} />
      </div>
    );
  }
  if (level === "calling" || level === "parsing" || level === "executing") {
    return (
      <div className="w-4 h-4 bg-[#fc8019]/20 border border-[#fc8019] flex items-center justify-center shrink-0 rounded">
        <Loader2 className="w-2.5 h-2.5 text-[#fc8019] animate-spin" />
      </div>
    );
  }
  if (level === "error") {
    return (
      <div className="w-4 h-4 bg-[#fc8019] text-white flex items-center justify-center shrink-0 rounded">
        <ShieldAlert className="w-2.5 h-2.5" />
      </div>
    );
  }
  return (
    <div className="w-4 h-4 border border-slate-700 flex items-center justify-center shrink-0 rounded">
      <Circle className="w-1.5 h-1.5 text-slate-500 fill-slate-500" />
    </div>
  );
}

function getFriendlyMessage(log: TerminalLog): string {
  if (log.tool === "get_addresses") return "VALIDATING DELIVERY GEOFENCE";
  if (log.tool === "search_restaurants") {
    if (log.level === "executing") return "FILTERING HEALTHY RESTAURANTS BY MACROS";
    if (log.level === "error") return log.message;
    return "QUERYING SWIGGY FOOD MCP CATALOG";
  }
  if (log.tool === "search_products") {
    if (log.level === "executing") return "MATCHING INSTAMART GROCERY INVENTORY";
    if (log.level === "error") return log.message;
    return "QUERYING INSTAMART MCP CATALOG";
  }
  if (log.tool === "update_cart") return "SYNTHESIZING SWIGGY CHECKOUT PAYLOAD";
  if (log.tool === "analyze_macros") return "READING WEARABLE TELEMETRY BUDGET";
  if (log.tool === "route_intent") return log.message.includes("Instamart") ? "ROUTING INTENT → SWIGGY INSTAMART" : "ROUTING INTENT → SWIGGY FOOD";
  return log.message;
}
