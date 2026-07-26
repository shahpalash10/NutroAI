"use client";

import { useState } from "react";
import { X, Check, Dumbbell, Activity, Flame, ShieldCheck } from "lucide-react";
import type { FitnessProfile, FitnessGoalType, WearableProvider } from "@/lib/types";

interface MacroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FitnessProfile | null;
  onSave: (updated: Partial<FitnessProfile>) => void;
}

const GOALS: { id: FitnessGoalType; label: string; desc: string; calories: number; protein: number; carbs: number; fats: number }[] = [
  { id: "bulking", label: "Muscle Bulking", desc: "High protein & carbs for hyper muscle growth", calories: 2800, protein: 180, carbs: 320, fats: 80 },
  { id: "cutting", label: "Fat Cutting", desc: "Calorie deficit with high protein retention", calories: 2000, protein: 175, carbs: 140, fats: 60 },
  { id: "recomp", label: "Body Recomp", desc: "Balanced macros for lean mass & fat loss", calories: 2500, protein: 160, carbs: 250, fats: 75 },
  { id: "keto", label: "Strict Keto", desc: "Ultra low-carb, high healthy fats & protein", calories: 2200, protein: 150, carbs: 30, fats: 160 },
  { id: "endurance", label: "Endurance Fuel", desc: "High carb & electrolyte balance for stamina", calories: 2700, protein: 140, carbs: 360, fats: 70 },
];

const WEARABLES: { id: WearableProvider; label: string; icon: string }[] = [
  { id: "apple_health", label: "Apple Health", icon: "🍎" },
  { id: "garmin", label: "Garmin Connect", icon: "⌚" },
  { id: "whoop", label: "WHOOP 4.0", icon: "⚡" },
  { id: "oura", label: "Oura Ring", icon: "💍" },
  { id: "fitbit", label: "Fitbit Premium", icon: "🏃" },
];

export function MacroSettingsModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: MacroSettingsModalProps) {
  const [goal, setGoal] = useState<FitnessGoalType>(profile?.goal_type ?? "bulking");
  const [wearable, setWearable] = useState<WearableProvider>(profile?.wearable_provider ?? "apple_health");
  const [calories, setCalories] = useState<number>(profile?.targets.calories ?? 2500);
  const [protein, setProtein] = useState<number>(profile?.targets.protein ?? 160);
  const [carbs, setCarbs] = useState<number>(profile?.targets.carbs ?? 250);
  const [fats, setFats] = useState<number>(profile?.targets.fats ?? 80);

  if (!isOpen) return null;

  const selectPreset = (g: typeof GOALS[0]) => {
    setGoal(g.id);
    setCalories(g.calories);
    setProtein(g.protein);
    setCarbs(g.carbs);
    setFats(g.fats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      goal_type: goal,
      wearable_provider: wearable,
      targets: { calories, protein, carbs, fats },
      wearable_synced_at: "Just now",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">Fitness & Macro Targets</h2>
              <p className="text-xs text-slate-400">Configure daily goals for AI meal recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Goal Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              1. Select Diet & Fitness Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOALS.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => selectPreset(g)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500 text-white shadow-md shadow-orange-500/10"
                        : "bg-slate-800/40 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-heading">{g.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wearable Source */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              2. Wearable Telemetry Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WEARABLES.map((w) => {
                const isSelected = wearable === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWearable(w.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                        : "bg-slate-800/40 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{w.icon}</span>
                    <span className="truncate">{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Sliders */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              3. Customize Daily Target Values
            </label>

            {/* Calories */}
            <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-orange-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Calories Target
                </span>
                <span className="font-mono text-white font-bold">{calories} kcal</span>
              </div>
              <input
                type="range"
                min={1200}
                max={4500}
                step={50}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Protein */}
            <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Protein Target
                </span>
                <span className="font-mono text-white font-bold">{protein} g</span>
              </div>
              <input
                type="range"
                min={60}
                max={300}
                step={5}
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Carbs & Fats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-400">Carbs</span>
                  <span className="font-mono text-white">{carbs}g</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={5}
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-400">Fats</span>
                  <span className="font-mono text-white">{fats}g</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Save Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
