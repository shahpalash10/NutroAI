"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Sparkles, Mic, Trash2, Bot, User, ArrowUpRight } from "lucide-react";
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
  { label: "POST-WORKOUT MEAL", desc: "Post-Leg Day 50g Protein Dinner", icon: "🍗" },
  { label: "INSTAMART PREP", desc: "Greek Yogurt & Egg Whites Stock Up", icon: "🛒" },
  { label: "KETO LUNCH", desc: "Keto Bowl Under 500 kcal", icon: "🥑" },
  { label: "LATE NIGHT SNACK", desc: "High-Protein Dessert Option", icon: "🍨" },
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
    <div className="coniq-card p-6 border border-white/15 flex flex-col h-[520px]">
      {/* Section Heading */}
      <div className="el_headingBlock">
        <div className="flex items-baseline gap-2">
          <span className="el_headingBlock_num">02-</span>
          <h2 className="el_headingBlock_title">INTERVIEW & COPILOT CHAT</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="el_headingBlock_sub uppercase hidden sm:inline">AI COPILOT</span>
          {messages.length > 0 && onClearChat && (
            <button
              type="button"
              onClick={onClearChat}
              className="text-slate-400 hover:text-[#fc8019] transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-xs">
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#fc8019] flex items-center justify-center text-white font-bold shrink-0 rounded">
                AI
              </div>
              <div className="bg-[#141620] border border-white/15 p-4 max-w-[85%] leading-relaxed text-slate-200 rounded-lg">
                <p className="font-bold text-white mb-1 ff_eng text-sm">
                  WELCOME // NUTRO COPILOT ENGAGED
                </p>
                <p>
                  Synced wearable budget: <span className="text-[#60b246] font-bold">42g Protein</span> &{" "}
                  <span className="text-[#fc8019] font-bold">720 kcal</span> left today.
                </p>
                <p className="mt-2 text-slate-400 text-[11px]">
                  State your meal or grocery query to query Swiggy Food & Instamart MCP servers.
                </p>
              </div>
            </div>

            {/* Prompt Cards */}
            <div className="pl-11 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ff_eng">
                RECOMMENDED ACTION PROMPTS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSuggestion(p.desc)}
                    className="bl_maskBtn text-left group"
                  >
                    <div>
                      <span className="text-[10px] text-[#fc8019] font-bold ff_eng block">{p.label}</span>
                      <span className="text-xs text-white font-sans font-medium line-clamp-1">{p.desc}</span>
                    </div>
                    <div className="arrow-box">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
            >
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0 border border-white/15 rounded",
                  isUser ? "bg-[#222636] text-white" : "bg-[#fc8019] text-white"
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={cn(
                  "p-3.5 text-xs leading-relaxed max-w-[85%] rounded-lg",
                  isUser
                    ? "bg-[#fc8019] text-white font-sans font-medium shadow-md shadow-orange-500/10"
                    : "bg-[#141620] border border-white/15 text-slate-200 font-sans"
                )}
              >
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.content.split("\n").map((line, idx) => {
                    if (line.startsWith("• ")) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 pl-1">
                          <span className="text-[#fc8019] font-bold">•</span>
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

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[#fc8019] flex items-center justify-center text-white shrink-0 rounded">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#141620] border border-white/15 p-3 flex items-center gap-2 text-xs text-[#fc8019] font-mono rounded-lg">
              <span className="ff_eng">EXECUTING MCP TOOL DISPATCH...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field Bar */}
      <form onSubmit={onSubmit} className="pt-3 border-t border-white/15">
        {isRecording && (
          <div className="mb-2 p-2 bg-[#fc8019]/20 border border-[#fc8019] text-[#fc8019] text-xs font-mono flex items-center gap-2 animate-pulse rounded">
            <Mic className="w-3.5 h-3.5" />
            <span className="ff_eng">LISTENING... SPEAK YOUR QUERY</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-[#141620] border border-white/15 p-2 focus-within:border-[#fc8019] transition-colors rounded-lg">
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
            placeholder="Search meals or groceries matching remaining macros..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 resize-none outline-none py-1.5 max-h-20 font-sans"
          />

          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={cn("p-2 text-slate-400 hover:text-white transition-colors", isRecording && "text-[#fc8019]")}
            title="Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-[#fc8019] hover:bg-[#e67316] disabled:opacity-40 text-white font-extrabold ff_eng text-xs flex items-center gap-1.5 transition-colors rounded"
          >
            <span>SEND</span>
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
      return <em key={i} className="italic text-[#fc8019]">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
