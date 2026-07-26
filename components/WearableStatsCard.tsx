"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Dumbbell, RefreshCw, Zap, Check } from "lucide-react";
import { macroPercent } from "@/lib/utils";
import type { FitnessProfile, FitnessGoalType } from "@/lib/types";

interface WearableStatsCardProps {
  profile: FitnessProfile | null;
  loading?: boolean;
  onOpenSettings?: () => void;
}

const GOALS: { id: FitnessGoalType; label: string; calories: number; protein: number }[] = [
  { id: "bulking", label: "MUSCLE BULKING", calories: 2800, protein: 180 },
  { id: "cutting", label: "FAT CUTTING", calories: 2000, protein: 175 },
  { id: "recomp", label: "BODY RECOMP", calories: 2500, protein: 160 },
  { id: "keto", label: "STRICT KETO", calories: 2200, protein: 150 },
];

export function WearableStatsCard({ profile, loading }: WearableStatsCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoalType>(profile?.goal_type ?? "bulking");

  const consumed = profile?.consumed ?? { calories: 1780, protein: 118, carbs: 175, fats: 52 };
  const baseTarget = GOALS.find((g) => g.id === selectedGoal) ?? GOALS[0];
  const targets = profile?.targets ?? { calories: baseTarget.calories, protein: baseTarget.protein, carbs: 250, fats: 80 };
  const remaining = {
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
      <div className="cinematic-card p-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-36 bg-slate-800/50 rounded" />
      </div>
    );
  }

  const wearableLabel = profile?.wearable_provider ? profile.wearable_provider.replace("_", " ").toUpperCase() : "APPLE HEALTH";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="cinematic-card p-6 sm:p-8"
    >
      {/* Toyota Coniq Pro Section Heading */}
      <div className="el_headingBlock">
        <div className="flex items-baseline gap-2">
          <span className="el_headingBlock_num">01-</span>
          <h2 className="el_headingBlock_title">OUR BUSINESS & TELEMETRY</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="el_headingBlock_sub uppercase hidden sm:inline">WEARABLE SYNC</span>
          <span className="px-2.5 py-0.5 bg-[#fc8019]/20 text-[#fc8019] border border-[#fc8019]/40 text-xs font-mono font-bold rounded">
            {selectedGoal.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Goal Selector Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs">
        <span className="text-slate-400 text-[11px] mr-2">DIET PRESET:</span>
        {GOALS.map((g) => {
          const isSelected = selectedGoal === g.id;
          return (
            <motion.button
              key={g.id}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGoal(g.id)}
              className={`px-3 py-1.5 border transition-all text-[11px] flex items-center gap-1.5 rounded ${
                isSelected
                  ? "bg-[#fc8019] text-white border-[#fc8019] font-bold ff_eng shadow-lg shadow-orange-500/20"
                  : "bg-[#141620] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              <span>{g.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Metric Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
        {/* Left: Concentric Progress Rings */}
        <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Calories */}
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="#fc8019"
                strokeWidth="7"
                fill="none"
                strokeDasharray="263.89"
                initial={{ strokeDashoffset: 263.89 }}
                animate={{ strokeDashoffset: 263.89 - (263.89 * caloriesPct) / 100 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                strokeLinecap="round"
              />

              {/* Middle Ring: Protein */}
              <circle cx="50" cy="50" r="31" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="31"
                stroke="#60b246"
                strokeWidth="6"
                fill="none"
                strokeDasharray="194.78"
                initial={{ strokeDashoffset: 194.78 }}
                animate={{ strokeDashoffset: 194.78 - (194.78 * proteinPct) / 100 }}
                transition={{ duration: 1.2, delay: 0.1, ease: "easeInOut" }}
                strokeLinecap="round"
              />

              {/* Inner Ring: Carbs */}
              <circle cx="50" cy="50" r="21" stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="21"
                stroke="#fbbf24"
                strokeWidth="5"
                fill="none"
                strokeDasharray="131.95"
                initial={{ strokeDashoffset: 131.95 }}
                animate={{ strokeDashoffset: 131.95 - (131.95 * carbsPct) / 100 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Ring Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white ff_eng leading-none">
                {Math.round(remaining.protein)}G
              </span>
              <span className="text-[10px] font-extrabold text-[#60b246] ff_eng tracking-widest mt-1">
                PROTEIN LEFT
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-300 font-mono">
              <span className="text-[#fc8019] font-bold">{Math.round(remaining.calories)} KCAL</span> REMAINING TODAY
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-center gap-1">
              <span>SYNCED FROM {wearableLabel}</span>
              <button onClick={handleSyncRefresh} className="hover:text-white transition-colors" title="Sync">
                <RefreshCw className={`w-3 h-3 text-[#fc8019] ${syncing ? "animate-spin" : ""}`} />
              </button>
            </p>
          </div>
        </div>

        {/* Right: Macro Progress Bars Grid */}
        <div className="md:col-span-7 space-y-4">
          {/* Calories Row */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5 ff_eng">
                <Flame className="w-3.5 h-3.5 text-[#fc8019]" /> CALORIES BUDGET
              </span>
              <span className="text-slate-300">
                {Math.round(consumed.calories)} / <strong className="text-white">{Math.round(targets.calories)}</strong> KCAL
                <span className="text-[#fc8019] ml-2 font-bold">({Math.round(remaining.calories)} REMAINING)</span>
              </span>
            </div>
            <div className="h-2 bg-[#141620] border border-white/10 p-0.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#fc8019] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${caloriesPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Protein Row */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase flex items-center gap-1.5 ff_eng">
                <Zap className="w-3.5 h-3.5 text-[#60b246]" /> PROTEIN TARGET
              </span>
              <span className="text-slate-300">
                {Math.round(consumed.protein)} / <strong className="text-white">{Math.round(targets.protein)}</strong> G
                <span className="text-[#60b246] ml-2 font-bold">({Math.round(remaining.protein)}G REMAINING)</span>
              </span>
            </div>
            <div className="h-2 bg-[#141620] border border-white/10 p-0.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#60b246] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${proteinPct}%` }}
                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Carbs & Fats Dual Grid */}
          <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-white uppercase ff_eng">CARBS</span>
                <span className="text-amber-400">{Math.round(remaining.carbs)}g left</span>
              </div>
              <div className="h-1.5 bg-[#141620] border border-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${carbsPct}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-white uppercase ff_eng">FATS</span>
                <span className="text-rose-400">{Math.round(remaining.fats)}g left</span>
              </div>
              <div className="h-1.5 bg-[#141620] border border-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${fatsPct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Workout History */}
          {profile?.last_workout && (
            <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <Dumbbell className="w-4 h-4 text-[#fc8019]" />
                <span>{profile.last_workout}</span>
              </div>
              <span className="text-[#60b246] font-bold ff_eng">
                STREAK // {profile.streak_days ?? 14} DAYS 🔥
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
