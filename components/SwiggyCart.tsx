"use client";

import { useState } from "react";
import { ShoppingBag, MapPin, Plus, Minus, Trash2, ArrowUpRight, ShieldCheck, Clock, CheckCircle } from "lucide-react";
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
      <div className="coniq-card p-6 animate-pulse space-y-3">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-20 bg-slate-800/50 rounded" />
      </div>
    );
  }

  return (
    <div className="coniq-card p-6 border border-white/15 flex flex-col h-[520px]">
      {/* Toyota Coniq Pro Section Heading */}
      <div className="el_headingBlock">
        <div className="flex items-baseline gap-2">
          <span className="el_headingBlock_num">03-</span>
          <h2 className="el_headingBlock_title">SWIGGY MCP CART & CHECKOUT</h2>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <select
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
            className="bg-[#181818] border border-white/15 text-white text-xs font-mono px-2 py-1 outline-none cursor-pointer"
          >
            {ADDRESSES.map((a) => (
              <option key={a.address_id} value={a.address_id} className="bg-[#111111]">
                {a.label} ({a.line1.slice(0, 12)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cart Scrollable Items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12 font-mono">
            <ShoppingBag className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-xs font-bold uppercase ff_eng">CART PAYLOAD EMPTY</p>
            <p className="text-[11px] text-slate-600 mt-1">Ask Nutro AI to inject macro-verified items into your cart.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-[#161616] border border-white/15 flex items-center justify-between gap-3 group"
            >
              {/* Item Details */}
              <div className="flex items-center gap-3 min-w-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover border border-white/15 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#222] border border-white/15 flex items-center justify-center text-red-500 font-bold shrink-0">
                    🍱
                  </div>
                )}

                <div className="min-w-0 font-mono">
                  <h3 className="text-xs font-bold text-white uppercase truncate group-hover:text-red-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.restaurant ?? (item.source === "food" ? "Healthy Spot" : "Instamart")}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="text-emerald-400 font-bold">{item.macros.protein * item.quantity}g Protein</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.macros.calories * item.quantity} kcal</span>
                  </div>
                </div>
              </div>

              {/* Quantity Modifier */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center bg-[#0a0a0a] border border-white/15">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="text-xs font-mono font-bold text-white min-w-[50px] text-right">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Coniq Pro Masked Checkout Button */}
      {items.length > 0 && (
        <div className="pt-3 border-t border-white/15 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs bg-[#161616] p-2.5 border border-white/15">
            <span className="text-slate-400 uppercase">TOTAL MACROS:</span>
            <div className="flex items-center gap-3 font-bold">
              <span className="text-emerald-400">{Math.round(cart?.total_macros.protein ?? 0)}G PROTEIN</span>
              <span className="text-red-500">{Math.round(cart?.total_macros.calories ?? 0)} KCAL</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">TOTAL PAYABLE</p>
              <p className="text-lg font-black text-white font-mono">₹{cart?.total_price ?? 0}</p>
            </div>

            <button onClick={handleCheckout} className="bl_maskBtn flex-1 py-3 px-4 group">
              <div>
                <span className="text-xs font-black text-white ff_eng block">PROCEED TO CHECKOUT</span>
                <span className="text-[10px] text-slate-400 font-mono">SYNCHRONIZE SWIGGY SESSION</span>
              </div>
              <div className="arrow-box">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Coniq Pro Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111111] border border-white/20 w-full max-w-md p-6 space-y-5 font-mono">
            {checkoutComplete ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white ff_eng">SWIGGY ORDER CONFIRMED!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    DELIVERING TO <strong>{selectedAddr.label}</strong> IN ~22 MINS
                  </p>
                </div>
                <div className="p-3 bg-[#0a0a0a] border border-white/10 text-xs text-emerald-400">
                  SESSION ID: #SWIGGY-NUTRO-{Math.floor(Math.random() * 900000 + 100000)}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="text-sm font-black text-white ff_eng">SWIGGY EXPRESS CHECKOUT</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white ff_eng">VERIFIED</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>DELIVERY: <strong>{selectedAddr.label}</strong> ({selectedAddr.line1})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ESTIMATED DELIVERY: ~22 MINS</span>
                  </p>
                </div>

                <div className="bg-[#0a0a0a] p-3 border border-white/15 space-y-2 text-xs">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-300">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono text-white">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/15 pt-2 flex justify-between font-bold text-white">
                    <span>TOTAL AMOUNT</span>
                    <span className="text-red-500">₹{cart?.total_price}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-2.5 bg-[#222222] text-xs font-bold ff_eng text-slate-300 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={confirmCheckout}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-extrabold ff_eng text-white flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> PAY & ORDER
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
