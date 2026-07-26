"use client";

import { Sparkles, Sliders, Smartphone, LayoutDashboard, Activity, CheckCircle2 } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-heading">
                Nutro<span className="text-gradient-orange">AI</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                MCP v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Swiggy Macro Copilot & MCP Engine
            </p>
          </div>
        </div>

        {/* Center Controls: View Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "desktop"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop View</span>
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "mobile"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swiggy Mobile App</span>
          </button>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Wearable Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{providerLabel}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Goals Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            title="Configure Macro Goals"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Edit Goals</span>
          </button>
        </div>
      </div>
    </header>
  );
}
