"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Sparkles, Mic, Trash2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CopilotChatProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearChat?: () => void;
}

const CATEGORY_PROMPTS = [
  { icon: "🍗", text: "Post-Leg Day 50g Protein Dinner" },
  { icon: "🛒", text: "Stock up Instamart with Greek Yogurt & Egg Whites" },
  { icon: "🥑", text: "Keto Lunch under 500 kcal" },
  { icon: "🍨", text: "Late night high-protein guilt-free snack" },
];

export function CopilotChat({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onClearChat,
}: CopilotChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSuggestion = (text: string) => {
    onInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    inputRef.current?.focus();
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        onInputChange({
          target: { value: "Get me a 45g protein dinner for post workout under 600 calories" },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }, 2000);
    }
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col border border-white/10 h-[480px] shadow-2xl relative">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-900/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              Nutro AI Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-[11px] text-slate-400">Ask for meals or groceries matching your exact macro budget</p>
          </div>
        </div>

        {messages.length > 0 && onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            {/* Welcome Greeting */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-orange-400" />
              </div>
              <div className="bg-slate-800/60 border border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-[85%] text-xs text-slate-200 leading-relaxed shadow-sm">
                <p className="font-semibold text-white mb-1 font-heading text-sm">
                  Welcome back, Palash! 👋
                </p>
                <p>
                  I&apos;ve synced your <strong>Apple Health</strong> macro budget. You have{" "}
                  <span className="text-emerald-400 font-bold">42g protein</span> and{" "}
                  <span className="text-orange-400 font-bold">720 kcal</span> left today.
                </p>
                <p className="mt-2 text-slate-400">
                  Tell me what you want to eat or stock up on, and I&apos;ll query Swiggy Food or Instamart MCP servers for you!
                </p>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="pl-11 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recommended Prompts</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    type="button"
                    onClick={() => handleSuggestion(p.text)}
                    className="text-left text-xs text-slate-300 hover:text-white bg-slate-800/40 hover:bg-orange-500/15 border border-white/5 hover:border-orange-500/40 rounded-xl p-2.5 transition-all flex items-start gap-2 group"
                  >
                    <span className="text-sm">{p.icon}</span>
                    <span className="line-clamp-2 leading-snug group-hover:text-orange-300">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md",
                  isUser
                    ? "bg-slate-800 text-slate-200 border border-white/10"
                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] shadow-sm",
                  isUser
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-sm"
                    : "bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-sm"
                )}
              >
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.content.split("\n").map((line, idx) => {
                    if (line.startsWith("• ")) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 pl-1">
                          <span className="text-orange-400 font-bold">•</span>
                          <span>{parseBold(line.slice(2))}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{parseBold(line)}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-orange-400 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <span className="text-xs text-orange-400 font-medium">Orchestrating MCP tools</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={onSubmit} className="p-3 border-t border-white/10 bg-slate-900/80">
        {isRecording && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-pulse">
            <Mic className="w-3.5 h-3.5" />
            <span>Listening... Speak your meal query</span>
          </div>
        )}
        <div className="flex items-end gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 focus-within:border-orange-500/50 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder="E.g., High-protein dinner after leg day or Instamart groceries..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 resize-none outline-none py-1.5 max-h-20"
          />

          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={cn(
              "p-2 rounded-lg transition-colors shrink-0 text-slate-400 hover:text-white",
              isRecording && "text-rose-400 bg-rose-500/20"
            )}
            title="Simulate Voice Command"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center disabled:opacity-40 shrink-0 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-orange-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
