"use client";

import { useState } from "react";
import { ShoppingBag, MapPin, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import type { CartSummary, CartItem, DeliveryAddress } from "@/lib/types";

interface SwiggyCartProps {
  cart: CartSummary | null;
  loading?: boolean;
  onUpdateCart?: (updatedCart: CartSummary) => void;
}

const ADDRESSES: DeliveryAddress[] = [
  { address_id: "addr_home_001", label: "Home", line1: "42 Koramangala 5th Block", city: "Bangalore", pincode: "560095" },
  { address_id: "addr_gym_098", label: "Gym (Cult Fit)", line1: "Indiranagar 100ft Road", city: "Bangalore", pincode: "560038" },
  { address_id: "addr_office_102", label: "Work", line1: "WeWork Embassy GolfLinks", city: "Bangalore", pincode: "560071" },
];

export function SwiggyCart({ cart, loading, onUpdateCart }: SwiggyCartProps) {
  const [selectedAddressId, setSelectedAddressId] = useState("addr_home_001");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const items = cart?.items ?? [];
  const selectedAddr = ADDRESSES.find((a) => a.address_id === selectedAddressId) ?? ADDRESSES[0];

  const updateQuantity = (itemId: string, delta: number) => {
    if (!cart) return;
    const newItems = cart.items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.quantity + delta);
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    let totalPrice = 0;
    const totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    for (const it of newItems) {
      totalPrice += it.price * it.quantity;
      totalMacros.calories += it.macros.calories * it.quantity;
      totalMacros.protein += it.macros.protein * it.quantity;
      totalMacros.carbs += it.macros.carbs * it.quantity;
      totalMacros.fats += it.macros.fats * it.quantity;
    }

    onUpdateCart?.({
      ...cart,
      items: newItems,
      total_price: totalPrice,
      total_macros: totalMacros,
    });
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
    setCheckoutComplete(false);
  };

  const confirmCheckout = () => {
    setCheckoutComplete(true);
    setTimeout(() => {
      setShowCheckoutModal(false);
      setCheckoutComplete(false);
    }, 2800);
  };

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse space-y-3">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-20 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border border-white/10 flex flex-col h-[480px]">
      {/* Cart Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              Swiggy Cart Engine
              {items.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Injected macro-verified payload</p>
          </div>
        </div>

        {/* Delivery Address Dropdown */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <select
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
            className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer pr-1"
          >
            {ADDRESSES.map((a) => (
              <option key={a.address_id} value={a.address_id} className="bg-slate-900 text-white">
                {a.label} ({a.line1.slice(0, 15)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cart Items Scroll List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
            <ShoppingBag className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-xs">Your Swiggy Cart is empty.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Use Nutro AI Copilot to find meals and inject them into cart.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
            >
              {/* Item Info */}
              <div className="flex items-center gap-3 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-orange-400 font-bold text-xs">
                    {item.source === "food" ? "🍱" : "🛒"}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white font-heading truncate group-hover:text-orange-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.restaurant ?? (item.source === "food" ? "Healthy Spot" : "Instamart")}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="font-semibold text-emerald-400">{item.macros.protein * item.quantity}g protein</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.macros.calories * item.quantity} cal</span>
                  </div>
                </div>
              </div>

              {/* Controls & Price */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Quantity Buttons */}
                <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[50px]">
                  <span className="text-xs font-mono font-bold text-white">₹{item.price * item.quantity}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Bar */}
      {items.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-slate-900/90 space-y-3">
          {/* Macro Breakdown Summary Bar */}
          <div className="flex items-center justify-between text-xs bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400">Cart Macros:</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-emerald-400 font-bold">⚡ {Math.round(cart?.total_macros.protein ?? 0)}g Protein</span>
              <span className="text-orange-400 font-bold">🔥 {Math.round(cart?.total_macros.calories ?? 0)} kcal</span>
            </div>
          </div>

          {/* Price & Checkout Action */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Payable</p>
              <p className="text-base font-black text-white font-mono">₹{cart?.total_price ?? 0}</p>
            </div>

            <button
              onClick={handleCheckout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all group"
            >
              <span>Proceed to Swiggy Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Swiggy Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {checkoutComplete ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Swiggy Order Confirmed!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Delivering to <strong className="text-white">{selectedAddr.label}</strong> in ~22 mins
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-emerald-400 font-mono">
                  Order ID: #SWIGGY-NUTRO-{Math.floor(Math.random() * 900000 + 100000)}
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🟧</span>
                    <h3 className="text-base font-bold text-white font-heading">Swiggy Express Checkout</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Macro-Verified
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>Delivering to <strong>{selectedAddr.label}</strong> ({selectedAddr.line1})</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ETA: ~22 minutes</span>
                  </p>
                </div>

                {/* Receipt List */}
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-300">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono text-white">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                    <span>Total Amount</span>
                    <span className="font-mono text-orange-400">₹{cart?.total_price}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheckout}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Pay & Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
