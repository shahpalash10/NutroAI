"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CinematicHero } from "@/components/CinematicHero";
import { Navbar } from "@/components/Navbar";
import { WearableStatsCard } from "@/components/WearableStatsCard";
import { CopilotChat } from "@/components/CopilotChat";
import { TerminalMatrix } from "@/components/TerminalMatrix";
import { SwiggyCart } from "@/components/SwiggyCart";
import { MacroSettingsModal } from "@/components/MacroSettingsModal";
import type { CartSummary, FitnessProfile, TerminalLog, ViewMode } from "@/lib/types";
import { updateFitnessProfile } from "@/lib/agent/orchestrator";

interface StreamDataItem {
  type: string;
  log?: TerminalLog;
  cart?: CartSummary;
  profile?: FitnessProfile;
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setMessages } = useChat({
    api: "/api/chat",
    id: "nutro-copilot",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = (await res.json()) as FitnessProfile;
          setProfile(data);
        }
      } catch {
        // Fallback profile managed locally
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const newLogs: TerminalLog[] = [];
    let latestCart: CartSummary | null = null;
    let latestProfile: FitnessProfile | null = null;

    for (const item of data as unknown as StreamDataItem[]) {
      if (item.type === "log" && item.log) newLogs.push(item.log);
      if (item.type === "cart" && item.cart) latestCart = item.cart;
      if (item.type === "profile" && item.profile) latestProfile = item.profile;
    }

    if (newLogs.length > 0) {
      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const unique = newLogs.filter((l) => !existingIds.has(l.id));
        return unique.length > 0 ? [...prev, ...unique] : prev;
      });
    }
    if (latestCart) setCart(latestCart);
    if (latestProfile) setProfile(latestProfile);
  }, [data]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      handleSubmit(e);
    },
    [input, isLoading, handleSubmit]
  );

  const handleSaveProfile = (updated: Partial<FitnessProfile>) => {
    const newProfile = updateFitnessProfile(updated);
    setProfile(newProfile);
  };

  const chatMessages = useMemo(
    () =>
      messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    [messages]
  );

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#07080a] text-white flex flex-col font-sans relative overflow-x-hidden">
        {/* Toyota Coniq Pro Style Infinite Scrolling Ticker Background */}
        <div className="fixed inset-x-0 top-28 pointer-events-none opacity-5 z-0 select-none overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-[130px] font-black ff_eng tracking-widest text-white">
            <span>NUTRO AI — SWIGGY MACRO COPILOT & MCP ENGINE // WEARABLE TELEMETRY // </span>
            <span>NUTRO AI — SWIGGY MACRO COPILOT & MCP ENGINE // WEARABLE TELEMETRY // </span>
          </div>
        </div>

        {/* Minimalist Floating Glass Navbar */}
        <Navbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          profile={profile}
        />

        {/* Cinematic Section 01: Fullscreen Narrative Hero Reveal */}
        {viewMode === "desktop" && <CinematicHero />}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12">
          {viewMode === "desktop" ? (
            /* DESKTOP CINEMATIC DASHBOARD MODE */
            <div className="space-y-12 animate-in fade-in duration-300">
              {/* 01- OUR BUSINESS & TELEMETRY */}
              <WearableStatsCard
                profile={profile}
                loading={profileLoading}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              {/* 02- COPILOT CHAT & 03- SWIGGY CART */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <CopilotChat
                    messages={chatMessages}
                    input={input}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onSubmit={onSubmit}
                    onClearChat={() => setMessages([])}
                  />
                </div>

                <div className="lg:col-span-5">
                  <SwiggyCart
                    cart={cart}
                    loading={isLoading && !cart}
                    onUpdateCart={setCart}
                  />
                </div>
              </div>

              {/* 04- SPECIAL MCP DEBUG MATRIX */}
              <TerminalMatrix logs={logs} active={isLoading} />
            </div>
          ) : (
            /* SWIGGY MOBILE APP VIEW MODE */
            <div className="flex justify-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full max-w-md bg-[#0f1117] border border-white/20 rounded-[2.5rem] p-4 shadow-2xl space-y-4 ring-1 ring-white/10">
                {/* Mobile Status Bar Simulation */}
                <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b border-white/15 text-xs text-slate-400 font-mono">
                  <span className="font-bold text-white">9:41</span>
                  <div className="w-16 h-4 bg-[#07080a] rounded-full border border-white/15 mx-auto" />
                  <span>5G 100%</span>
                </div>

                <WearableStatsCard
                  profile={profile}
                  loading={profileLoading}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />

                <CopilotChat
                  messages={chatMessages}
                  input={input}
                  isLoading={isLoading}
                  onInputChange={handleInputChange}
                  onSubmit={onSubmit}
                  onClearChat={() => setMessages([])}
                />

                <SwiggyCart
                  cart={cart}
                  loading={isLoading && !cart}
                  onUpdateCart={setCart}
                />

                <TerminalMatrix logs={logs} active={isLoading} />
              </div>
            </div>
          )}
        </main>

        {/* Target & Fitness Goals Config Modal */}
        <MacroSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />
      </div>
    </SmoothScroll>
  );
}
