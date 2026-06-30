"use client";

import { Star, Plus, Minus } from "lucide-react";
import { cn, formatCurrency, formatMacro } from "@/lib/utils";
import type { CartSummary, CartItem } from "@/lib/types";

interface SwiggyCartProps {
  cart: CartSummary | null;
  loading?: boolean;
}

const FOOD_GRADIENTS = [
  "from-orange-100 to-orange-50",
  "from-amber-100 to-yellow-50",
  "from-red-100 to-orange-50",
  "from-green-100 to-emerald-50",
];

export function SwiggyCart({ cart, loading }: SwiggyCartProps) {
  const items = cart?.items ?? [];
  const totalPrice = cart?.total_price ?? 0;
  const totalMacros = cart?.total_macros ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };

  if (loading && items.length === 0) {
    return (
      <div className="mx-4">
        <div className="swiggy-card p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-swiggy-orange/30 border-t-swiggy-orange rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mx-4 mb-24">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-swiggy-dark">
            {items[0]?.source === "instamart" ? "Instamart picks" : "Recommended for you"}
          </h2>
          <span className="text-xs text-swiggy-gray">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <FoodCard key={item.id} item={item} index={idx} />
          ))}
        </div>

        <div className="swiggy-card mt-4 p-4">
          <p className="text-xs font-semibold text-swiggy-gray uppercase tracking-wide mb-3">Macro summary</p>
          <div className="grid grid-cols-4 gap-2">
            <MacroPill label="Protein" value={`${Math.round(totalMacros.protein)}g`} />
            <MacroPill label="Carbs" value={`${Math.round(totalMacros.carbs)}g`} />
            <MacroPill label="Fats" value={`${Math.round(totalMacros.fats)}g`} />
            <MacroPill label="Cal" value={`${Math.round(totalMacros.calories)}`} highlight />
          </div>
        </div>
      </div>

      <StickyCartBar
        itemCount={items.length}
        totalPrice={totalPrice}
        checkoutUrl={cart?.checkout_url}
        restaurantName={items[0]?.restaurant}
      />
    </>
  );
}

function FoodCard({ item, index }: { item: CartItem; index: number }) {
  const gradient = FOOD_GRADIENTS[index % FOOD_GRADIENTS.length];
  const isInstamart = item.source === "instamart";

  return (
    <div className="swiggy-card overflow-hidden flex">
      <div className={cn("w-28 shrink-0 bg-gradient-to-br flex items-center justify-center", gradient)}>
        <span className="text-3xl">{isInstamart ? "🛒" : "🍽️"}</span>
      </div>
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {!isInstamart && item.restaurant && (
              <p className="text-[11px] font-bold text-swiggy-dark uppercase tracking-wide truncate">
                {item.restaurant}
              </p>
            )}
            <p className="text-sm font-semibold text-swiggy-dark leading-snug mt-0.5 line-clamp-2">
              {item.name}
            </p>
            {isInstamart && (
              <p className="text-[11px] text-swiggy-instamart font-semibold mt-0.5">Instamart</p>
            )}
          </div>
          {!isInstamart && (
            <div className="flex items-center gap-0.5 shrink-0 bg-swiggy-green/10 text-swiggy-rating rounded px-1.5 py-0.5">
              <Star className="w-3 h-3 fill-swiggy-rating text-swiggy-rating" />
              <span className="text-xs font-bold">4.8</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-medium text-swiggy-gray bg-swiggy-page rounded px-1.5 py-0.5">
            {formatMacro(item.macros.protein)} protein
          </span>
          <span className="text-[10px] font-medium text-swiggy-gray bg-swiggy-page rounded px-1.5 py-0.5">
            {Math.round(item.macros.calories)} cal
          </span>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-sm font-bold text-swiggy-dark">{formatCurrency(item.price)}</span>
          <div className="flex items-center border-2 border-swiggy-green rounded-lg overflow-hidden">
            <button type="button" className="px-2 py-1 text-swiggy-green hover:bg-swiggy-green/5">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-sm font-bold text-swiggy-green min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button type="button" className="px-2 py-1 text-swiggy-green hover:bg-swiggy-green/5">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!item.in_stock && (
          <p className="text-[11px] text-red-500 font-medium mt-1.5">Out of stock — replaced with similar item</p>
        )}
      </div>
    </div>
  );
}

function MacroPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl p-2 text-center", highlight ? "bg-swiggy-orange-light" : "bg-swiggy-page")}>
      <p className="text-[10px] text-swiggy-gray font-medium">{label}</p>
      <p className={cn("text-sm font-bold mt-0.5", highlight ? "text-swiggy-orange" : "text-swiggy-dark")}>
        {value}
      </p>
    </div>
  );
}

function StickyCartBar({
  itemCount,
  totalPrice,
  checkoutUrl,
  restaurantName,
}: {
  itemCount: number;
  totalPrice: number;
  checkoutUrl: string | null | undefined;
  restaurantName?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto">
        <div className="mx-4 mb-4">
          <a
            href={checkoutUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-swiggy-green text-white rounded-xl px-4 py-3.5 swiggy-shadow-lg hover:bg-[#529934] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg px-2.5 py-1 text-sm font-bold">
                {itemCount}
              </div>
              <div>
                <p className="text-sm font-bold">View Cart</p>
                {restaurantName && (
                  <p className="text-xs text-white/80 truncate max-w-[160px]">{restaurantName}</p>
                )}
              </div>
            </div>
            <p className="text-sm font-bold">{formatCurrency(totalPrice)}</p>
          </a>
        </div>
      </div>
    </div>
  );
}
