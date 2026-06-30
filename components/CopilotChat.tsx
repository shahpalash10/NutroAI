"use client";

import { useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
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
}

const SUGGESTIONS = [
  "High-protein dinner after leg day",
  "Low-carb Instamart groceries",
  "Keto lunch under 500 cal",
];

export function CopilotChat({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: CopilotChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSuggestion = (text: string) => {
    onInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-4">
      <div className="swiggy-card flex flex-col overflow-hidden" style={{ minHeight: 360 }}>
        <div className="px-4 py-3 border-b border-swiggy-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-swiggy-orange-light flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-swiggy-orange" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-swiggy-dark">Nutro AI</h2>
            <p className="text-xs text-swiggy-gray">Tell me what you want to eat — I&apos;ll handle the rest</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[220px] max-h-[320px]">
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-swiggy-orange flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-swiggy-page rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                  <p className="text-sm text-swiggy-dark leading-relaxed">
                    Hi! I know your remaining macros. Ask me for a meal or groceries and I&apos;ll add them to your Swiggy cart.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pl-10">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="text-xs font-medium text-swiggy-orange bg-swiggy-orange-light border border-swiggy-orange/20 rounded-full px-3 py-1.5 hover:bg-swiggy-orange/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-swiggy-orange flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%]",
                  msg.role === "user"
                    ? "bg-swiggy-orange text-white rounded-tr-sm"
                    : "bg-swiggy-page text-swiggy-dark rounded-tl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-swiggy-orange flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-swiggy-page rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-swiggy-gray/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-swiggy-gray/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-swiggy-gray/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-3 border-t border-swiggy-border bg-white">
          <div className="flex items-end gap-2 bg-swiggy-page rounded-xl px-3 py-2">
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
              placeholder="Search for meals, groceries..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-swiggy-dark placeholder:text-swiggy-light-gray resize-none outline-none py-1 max-h-20"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-full bg-swiggy-orange flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
