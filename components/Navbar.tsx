"use client";

import { ArrowUpRight, Sliders, Smartphone, LayoutDashboard, Activity } from "lucide-react";
import type { ViewMode, FitnessProfile } from "@/lib/types";

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenSettings: () => void;
  profile: FitnessProfile | null;
}

export function Navbar({
  viewMode,
  onViewModeChange,
  onOpenSettings,
  profile,
}: NavbarProps) {
  const providerLabel = profile?.wearable_provider
    ? profile.wearable_provider.replace("_", " ").toUpperCase()
    : "APPLE HEALTH";

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Toyota Coniq Pro Style Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 flex items-center justify-center font-extrabold font-mono text-white text-sm tracking-wider">
            N/AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-widest text-white ff_eng">
                NUTRO <span className="text-red-600">AI</span>
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-red-600/20 text-red-500 border border-red-600/40 ff_eng">
                MCP ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block tracking-wider uppercase">
              SWIGGY MACRO COPILOT & MCP TELEMETRY
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-[#141414] p-1 border border-white/15">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs ff_eng transition-all ${
              viewMode === "desktop"
                ? "bg-red-600 text-white font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DESKTOP DASHBOARD</span>
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs ff_eng transition-all ${
              viewMode === "mobile"
                ? "bg-red-600 text-white font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SWIGGY MOBILE APP</span>
          </button>
        </div>

        {/* Right Action & Coniq Pro Entry Button */}
        <div className="flex items-center gap-3">
          {/* Wearable Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-white/15 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-200 uppercase font-bold">{providerLabel}</span>
          </div>

          {/* Goals Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] hover:bg-slate-800 border border-white/15 text-xs ff_eng text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">GOALS</span>
          </button>

          {/* Coniq Pro Style ENTRY / ACTION Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs ff_eng transition-all group"
          >
            <span>ENTRY</span>
            <div className="w-5 h-5 bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-red-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
