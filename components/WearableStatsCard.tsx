"use client";

import { useState } from "react";
import { Flame, Dumbbell, RefreshCw, Zap } from "lucide-react";
import { macroPercent } from "@/lib/utils";
import type { FitnessProfile } from "@/lib/types";

interface WearableStatsCardProps {
  profile: FitnessProfile | null;
  loading?: boolean;
  onOpenSettings?: () => void;
}

export function WearableStatsCard({ profile, loading, onOpenSettings }: WearableStatsCardProps) {
  const [syncing, setSyncing] = useState(false);

  const consumed = profile?.consumed ?? { calories: 1780, protein: 118, carbs: 175, fats: 52 };
  const targets = profile?.targets ?? { calories: 2500, protein: 160, carbs: 250, fats: 80 };
  const remaining = profile?.remaining ?? {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fats: Math.max(0, targets.fats - consumed.fats),
  };

  const caloriesPct = macroPercent(consumed.calories, targets.calories);
  const proteinPct = macroPercent(consumed.protein, targets.protein);
  const carbsPct = macroPercent(consumed.carbs, targets.carbs);
  const fatsPct = macroPercent(consumed.fats, targets.fats);

  const handleSyncRefresh = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 900);
  };

  if (loading) {
    return (
      <div className="coniq-card p-6 animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-32 bg-slate-800/50 rounded" />
      </div>
    );
  }

  const goalLabel = profile?.goal_type ? profile.goal_type.toUpperCase() : "BULKING";
  const wearableLabel = profile?.wearable_provider ? profile.wearable_provider.replace("_", " ").toUpperCase() : "APPLE HEALTH";

  return (
    <div className="coniq-card p-6 border border-white/15">
      {/* Toyota Coniq Pro Section Heading */}
      <div className="el_headingBlock">
        <div className="flex items-baseline gap-2">
          <span className="el_headingBlock_num">01-</span>
          <h2 className="el_headingBlock_title">OUR BUSINESS & TELEMETRY</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="el_headingBlock_sub uppercase hidden sm:inline">リアルタイムマクロ統合 // WEARABLE SYNC</span>
          <span className="px-2 py-0.5 bg-red-600/20 text-red-500 border border-red-600/40 text-xs font-mono font-bold">
            {goalLabel}
          </span>
        </div>
      </div>

      {/* Main Metric Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
        {/* Left: Concentric Progress Rings with Hanken Grotesk Numbers */}
        <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/15 pb-6 md:pb-0 md:pr-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Calories */}
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#eb0a1e"
                strokeWidth="7"
                fill="none"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * caloriesPct) / 100}
                strokeLinecap="square"
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Ring: Protein */}
              <circle cx="50" cy="50" r="31" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="31"
                stroke="#10b981"
                strokeWidth="6"
                fill="none"
                strokeDasharray="194.78"
                strokeDashoffset={194.78 - (194.78 * proteinPct) / 100}
                strokeLinecap="square"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: Carbs */}
              <circle cx="50" cy="50" r="21" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="21"
                stroke="#fbbf24"
                strokeWidth="5"
                fill="none"
                strokeDasharray="131.95"
                strokeDashoffset={131.95 - (131.95 * carbsPct) / 100}
                strokeLinecap="square"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Ring Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white ff_eng leading-none">
                {Math.round(remaining.protein)}G
              </span>
              <span className="text-[10px] font-bold text-emerald-400 ff_eng tracking-widest mt-1">
                PROTEIN LEFT
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-300 font-mono">
              <span className="text-red-500 font-bold">{Math.round(remaining.calories)} KCAL</span> REMAINING TODAY
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-center gap-1">
              <span>SYNCED FROM {wearableLabel}</span>
              <button onClick={handleSyncRefresh} className="hover:text-white transition-colors" title="Sync">
                <RefreshCw className={`w-3 h-3 text-red-500 ${syncing ? "animate-spin" : ""}`} />
              </button>
            </p>
          </div>
        </div>

        {/* Right: Editorial Macro Metric Progress Bars */}
        <div className="md:col-span-7 space-y-4">
          {/* Calories Row */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5 ff_eng">
                <Flame className="w-3.5 h-3.5 text-red-500" /> CALORIES BUDGET
              </span>
              <span className="text-slate-300">
                {Math.round(consumed.calories)} / <strong className="text-white">{Math.round(targets.calories)}</strong> KCAL
                <span className="text-red-500 ml-2 font-bold">({Math.round(remaining.calories)} REMAINING)</span>
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-none border border-white/10 p-0.5">
              <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${caloriesPct}%` }} />
            </div>
          </div>

          {/* Protein Row */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5 ff_eng">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> PROTEIN TARGET
              </span>
              <span className="text-slate-300">
                {Math.round(consumed.protein)} / <strong className="text-white">{Math.round(targets.protein)}</strong> G
                <span className="text-emerald-400 ml-2 font-bold">({Math.round(remaining.protein)}G REMAINING)</span>
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-none border border-white/10 p-0.5">
              <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Carbs & Fats Dual Grid */}
          <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-white uppercase ff_eng">CARBS</span>
                <span className="text-amber-400">{Math.round(remaining.carbs)}g left</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] border border-white/10">
                <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${carbsPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-white uppercase ff_eng">FATS</span>
                <span className="text-rose-400">{Math.round(remaining.fats)}g left</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] border border-white/10">
                <div className="h-full bg-rose-400 transition-all duration-700" style={{ width: `${fatsPct}%` }} />
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          {profile?.last_workout && (
            <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <Dumbbell className="w-4 h-4 text-red-500" />
                <span>{profile.last_workout}</span>
              </div>
              <span className="text-emerald-400 font-bold ff_eng">
                STREAK // {profile.streak_days ?? 14} DAYS 🔥
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
