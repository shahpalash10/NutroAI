import { createDataStreamResponse, formatDataStreamPart, type JSONValue } from "ai";
import type { TerminalLog, CartSummary, FitnessProfile } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

interface StreamEvent {
  type: string;
  content?: string;
  log?: TerminalLog;
  cart?: CartSummary;
  profile?: FitnessProfile;
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const messages: Array<{ role: string; content: string }> = body.messages ?? [];
  const userMessage = messages[messages.length - 1]?.content ?? "";

  if (!userMessage.trim()) {
    return new Response("Message required", { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
  } catch {
    return new Response("Backend unavailable. Start the Python server on port 8000.", {
      status: 503,
    });
  }

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response("Backend error", { status: 502 });
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const reader = backendResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let lastText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }

          switch (event.type) {
            case "text":
              if (event.content && event.content !== lastText) {
                const delta = event.content.slice(lastText.length);
                if (delta) {
                  dataStream.write(formatDataStreamPart("text", delta));
                }
                lastText = event.content;
              }
              break;
            case "log":
              if (event.log) {
                dataStream.writeData({ type: "log", log: event.log } as unknown as JSONValue);
              }
              break;
            case "cart":
              if (event.cart) {
                dataStream.writeData({ type: "cart", cart: event.cart } as unknown as JSONValue);
              }
              break;
            case "profile":
              if (event.profile) {
                dataStream.writeData({ type: "profile", profile: event.profile } as unknown as JSONValue);
              }
              break;
            case "done":
              break;
          }
        }
      }
    },
    onError: (error) => {
      return error instanceof Error ? error.message : "Stream error";
    },
  });
}
