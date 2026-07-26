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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#12141d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Swiggy Themed Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#fc8019] flex items-center justify-center font-black font-mono text-white text-base tracking-wider rounded-lg shadow-lg shadow-orange-500/20">
            N/AI
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-white ff_eng">
              NUTRO <span className="text-[#fc8019]">AI</span>
            </h1>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-[#1b1e2b] p-1 border border-white/10 rounded-lg">
          <button
            onClick={() => onViewModeChange("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs ff_eng transition-all rounded ${
              viewMode === "desktop"
                ? "bg-[#fc8019] text-white font-extrabold shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DESKTOP DASHBOARD</span>
          </button>
          <button
            onClick={() => onViewModeChange("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs ff_eng transition-all rounded ${
              viewMode === "mobile"
                ? "bg-[#fc8019] text-white font-extrabold shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SWIGGY MOBILE APP</span>
          </button>
        </div>

        {/* Right Action & Swiggy Entry Button */}
        <div className="flex items-center gap-3">
          {/* Wearable Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1b1e2b] border border-white/10 text-xs font-mono rounded-lg">
            <Activity className="w-3.5 h-3.5 text-[#60b246] animate-pulse" />
            <span className="text-slate-200 uppercase font-bold">{providerLabel}</span>
          </div>

          {/* Goals Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1b1e2b] hover:bg-[#242838] border border-white/10 text-xs ff_eng text-white transition-colors rounded-lg"
          >
            <Sliders className="w-3.5 h-3.5 text-[#fc8019]" />
            <span className="hidden sm:inline">GOALS</span>
          </button>

          {/* Swiggy Styled ENTRY Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 px-4 py-2 bg-[#fc8019] hover:bg-[#e67316] text-white text-xs ff_eng transition-all rounded-lg shadow-lg shadow-orange-500/20 group"
          >
            <span>ENTRY</span>
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:bg-white group-hover:text-[#fc8019] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
