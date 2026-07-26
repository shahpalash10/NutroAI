"use client";

import { useState } from "react";
import { X, Check, Flame, Activity, ShieldCheck, ArrowUpRight } from "lucide-react";
import type { FitnessProfile, FitnessGoalType, WearableProvider } from "@/lib/types";

interface MacroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FitnessProfile | null;
  onSave: (updated: Partial<FitnessProfile>) => void;
}

const GOALS: { id: FitnessGoalType; label: string; desc: string; calories: number; protein: number; carbs: number; fats: number }[] = [
  { id: "bulking", label: "MUSCLE BULKING", desc: "High protein & carbs for hyper muscle growth", calories: 2800, protein: 180, carbs: 320, fats: 80 },
  { id: "cutting", label: "FAT CUTTING", desc: "Calorie deficit with high protein retention", calories: 2000, protein: 175, carbs: 140, fats: 60 },
  { id: "recomp", label: "BODY RECOMP", desc: "Balanced macros for lean mass & fat loss", calories: 2500, protein: 160, carbs: 250, fats: 75 },
  { id: "keto", label: "STRICT KETO", desc: "Ultra low-carb, high healthy fats & protein", calories: 2200, protein: 150, carbs: 30, fats: 160 },
  { id: "endurance", label: "ENDURANCE FUEL", desc: "High carb & electrolyte balance for stamina", calories: 2700, protein: 140, carbs: 360, fats: 70 },
];

const WEARABLES: { id: WearableProvider; label: string; icon: string }[] = [
  { id: "apple_health", label: "APPLE HEALTH", icon: "🍎" },
  { id: "garmin", label: "GARMIN CONNECT", icon: "⌚" },
  { id: "whoop", label: "WHOOP 4.0", icon: "⚡" },
  { id: "oura", label: "OURA RING", icon: "💍" },
  { id: "fitbit", label: "FITBIT PREMIUM", icon: "🏃" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1b1e2b] border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Toyota Coniq Pro Header */}
        <div className="px-6 py-5 border-b border-white/15 bg-[#12141d] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="el_headingBlock_num">00-</span>
            <h2 className="el_headingBlock_title">GOALS & TELEMETRY CONFIG</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
          {/* Section 1: Diet & Fitness Goal Presets */}
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block ff_eng">
              01 // SELECT DIET & FITNESS GOAL
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => selectPreset(g)}
                    className={`bl_maskBtn text-left transition-all group ${
                      isSelected
                        ? "!bg-[#fc8019] !border-[#fc8019] text-white shadow-lg shadow-orange-500/20"
                        : "bg-[#12141d] border-white/15 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm ff_eng">{g.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <p className="text-[11px] font-sans opacity-90 mt-1 line-clamp-1">{g.desc}</p>
                    </div>
                    <div className="arrow-box">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Wearable Source */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block ff_eng">
              02 // WEARABLE TELEMETRY SOURCE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WEARABLES.map((w) => {
                const isSelected = wearable === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWearable(w.id)}
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? "bg-[#60b246]/20 border-[#60b246] text-[#60b246] ff_eng"
                        : "bg-[#12141d] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{w.icon}</span>
                    <span className="truncate">{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Target Customizers */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block ff_eng">
              03 // CUSTOMIZE DAILY TARGET VALUES
            </label>

            {/* Calories Target Slider */}
            <div className="bg-[#12141d] p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#fc8019] flex items-center gap-1.5 ff_eng">
                  <Flame className="w-4 h-4" /> CALORIES TARGET
                </span>
                <span className="font-mono text-white font-extrabold text-sm px-2 py-0.5 bg-[#1b1e2b] border border-white/10 rounded">
                  {calories} KCAL
                </span>
              </div>
              <input
                type="range"
                min={1200}
                max={4500}
                step={50}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full accent-[#fc8019] cursor-pointer"
              />
            </div>

            {/* Protein Target Slider */}
            <div className="bg-[#12141d] p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#60b246] flex items-center gap-1.5 ff_eng">
                  <Activity className="w-4 h-4" /> PROTEIN TARGET
                </span>
                <span className="font-mono text-white font-extrabold text-sm px-2 py-0.5 bg-[#1b1e2b] border border-white/10 rounded">
                  {protein} G
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={300}
                step={5}
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full accent-[#60b246] cursor-pointer"
              />
            </div>

            {/* Carbs & Fats Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#12141d] p-3.5 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400 ff_eng">CARBS</span>
                  <span className="font-mono text-white font-bold">{carbs}g</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={5}
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="bg-[#12141d] p-3.5 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-rose-400 ff_eng">FATS</span>
                  <span className="font-mono text-white font-bold">{fats}g</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg bg-[#12141d] hover:bg-[#252a3b] border border-white/15 text-xs font-bold ff_eng text-slate-300 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-[#fc8019] hover:bg-[#e67316] text-white text-xs font-extrabold ff_eng shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> SAVE GOALS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
