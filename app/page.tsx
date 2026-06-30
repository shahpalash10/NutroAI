"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { SwiggyHeader } from "@/components/SwiggyHeader";
import { WearableStatsCard } from "@/components/WearableStatsCard";
import { CopilotChat } from "@/components/CopilotChat";
import { TerminalMatrix } from "@/components/TerminalMatrix";
import { SwiggyCart } from "@/components/SwiggyCart";
import type { CartSummary, FitnessProfile, TerminalLog } from "@/lib/types";

interface StreamDataItem {
  type: string;
  log?: TerminalLog;
  cart?: CartSummary;
  profile?: FitnessProfile;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [terminalActive, setTerminalActive] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
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
        // defaults shown in WearableStatsCard
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    setTerminalActive(isLoading);
  }, [isLoading]);

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

  const chatMessages = useMemo(
    () =>
      messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    [messages]
  );

  const hasCart = (cart?.items?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-swiggy-page pb-6">
      <div className="max-w-md mx-auto bg-swiggy-page min-h-screen relative">
        <SwiggyHeader />

        <main className="space-y-4 pt-4">
          <WearableStatsCard profile={profile} loading={profileLoading} />

          <CopilotChat
            messages={chatMessages}
            input={input}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={onSubmit}
          />

          {(logs.length > 0 || terminalActive) && (
            <TerminalMatrix logs={logs} active={terminalActive} />
          )}

          <SwiggyCart cart={cart} loading={isLoading && !hasCart} />
        </main>
      </div>
    </div>
  );
}
