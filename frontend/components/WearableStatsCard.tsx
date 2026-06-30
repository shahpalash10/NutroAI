"use client";

import { macroPercent } from "@/lib/utils";
import type { FitnessProfile } from "@/lib/types";

interface WearableStatsCardProps {
  profile: FitnessProfile | null;
  loading?: boolean;
}

const MACROS = [
  { key: "calories" as const, label: "Calories", unit: "kcal", color: "bg-swiggy-orange" },
  { key: "protein" as const, label: "Protein", unit: "g", color: "bg-swiggy-green" },
  { key: "carbs" as const, label: "Carbs", unit: "g", color: "bg-amber-400" },
  { key: "fats" as const, label: "Fats", unit: "g", color: "bg-rose-400" },
];

export function WearableStatsCard({ profile, loading }: WearableStatsCardProps) {
  const consumed = profile?.consumed ?? { calories: 1800, protein: 120, carbs: 180, fats: 55 };
  const targets = profile?.targets ?? { calories: 2500, protein: 160, carbs: 250, fats: 80 };
  const remaining = profile?.remaining ?? {
    calories: targets.calories - consumed.calories,
    protein: targets.protein - consumed.protein,
    carbs: targets.carbs - consumed.carbs,
    fats: targets.fats - consumed.fats,
  };

  if (loading) {
    return (
      <div className="swiggy-card mx-4 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <div className="swiggy-card overflow-hidden">
        <div className="bg-gradient-to-r from-swiggy-orange to-swiggy-orange-dark px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-medium">Today&apos;s macros</p>
            <p className="text-white text-sm font-bold mt-0.5">
              {Math.round(remaining.calories)} kcal left to hit your goal
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
            <p className="text-white text-lg font-bold leading-none">{Math.round(remaining.protein)}g</p>
            <p className="text-white/80 text-[10px] font-medium">protein left</p>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {MACROS.map(({ key, label, unit, color }) => {
            const pct = macroPercent(consumed[key], targets[key]);
            const rem = remaining[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-swiggy-dark">{label}</span>
                  <span className="text-xs text-swiggy-gray">
                    {Math.round(consumed[key])}/{Math.round(targets[key])}
                    {unit === "kcal" ? " kcal" : "g"}
                    <span className="text-swiggy-orange font-semibold ml-1.5">
                      · {Math.round(rem)}{unit === "kcal" ? "" : "g"} left
                    </span>
                  </span>
                </div>
                <div className="h-1.5 bg-swiggy-page rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {profile?.last_workout && (
          <div className="px-4 py-2.5 bg-swiggy-page border-t border-swiggy-border flex items-center gap-2">
            <span className="text-base">💪</span>
            <p className="text-xs text-swiggy-gray">
              <span className="font-semibold text-swiggy-dark">{profile.last_workout}</span>
              {" · synced from wearable"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
