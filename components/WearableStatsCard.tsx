"use client";

import { useState } from "react";
import { Activity, Flame, Dumbbell, RefreshCw, SlidersHorizontal, Zap } from "lucide-react";
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
      <div className="glass-card p-5 animate-pulse space-y-4">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-32 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  const goalLabel = profile?.goal_type ? profile.goal_type.toUpperCase() : "BULKING";
  const wearableLabel = profile?.wearable_provider ? profile.wearable_provider.replace("_", " ").toUpperCase() : "APPLE HEALTH";

  return (
    <div className="glass-card overflow-hidden border border-white/10 relative group">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-heading">Wearable Macro Telemetry</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {goalLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Synced from {wearableLabel}</span>
              <button
                onClick={handleSyncRefresh}
                className="text-orange-400 hover:text-orange-300 transition-colors"
                title="Refresh Wearable Data"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
              </button>
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all text-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Goals</span>
          </button>
        )}
      </div>

      {/* Main Rings + Macro Metrics Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Concentric Progress Rings */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Calories */}
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#fc8019"
                strokeWidth="8"
                fill="none"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * caloriesPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Ring: Protein */}
              <circle cx="50" cy="50" r="31" stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="31"
                stroke="#22c55e"
                strokeWidth="7"
                fill="none"
                strokeDasharray="194.78"
                strokeDashoffset={194.78 - (194.78 * proteinPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: Carbs */}
              <circle cx="50" cy="50" r="21" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="21"
                stroke="#fbbf24"
                strokeWidth="6"
                fill="none"
                strokeDasharray="131.95"
                strokeDashoffset={131.95 - (131.95 * carbsPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-white font-heading leading-none">
                {Math.round(remaining.protein)}g
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">
                Protein Left
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            <span className="text-orange-400 font-bold">{Math.round(remaining.calories)} kcal</span> left to hit target
          </p>
        </div>

        {/* Right: Macro Progress Bars Grid */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Calories */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
              </span>
              <span className="text-slate-400 font-mono">
                {Math.round(consumed.calories)} / <span className="text-white font-bold">{Math.round(targets.calories)}</span> kcal
                <span className="text-orange-400 ml-2 font-bold">({Math.round(remaining.calories)} left)</span>
              </span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${caloriesPct}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Protein
              </span>
              <span className="text-slate-400 font-mono">
                {Math.round(consumed.protein)} / <span className="text-white font-bold">{Math.round(targets.protein)}</span> g
                <span className="text-emerald-400 ml-2 font-bold">({Math.round(remaining.protein)}g left)</span>
              </span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs & Fats Dual Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-300">Carbs</span>
                <span className="text-amber-400 font-semibold">{Math.round(remaining.carbs)}g left</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${carbsPct}%` }} />
              </div>
            </div>

            {/* Fats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-slate-300">Fats</span>
                <span className="text-rose-400 font-semibold">{Math.round(remaining.fats)}g left</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full transition-all duration-700" style={{ width: `${fatsPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Context Footer */}
      {profile?.last_workout && (
        <div className="px-5 py-2.5 bg-slate-900/80 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300 font-medium">{profile.last_workout}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {profile.streak_days ?? 14} Day Streak 🔥
          </span>
        </div>
      )}
    </div>
  );
}
