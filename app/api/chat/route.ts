import { createDataStreamResponse, formatDataStreamPart, type JSONValue } from "ai";
import { runAgent } from "@/lib/agent/orchestrator";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const messages: Array<{ role: string; content: string }> = body.messages ?? [];
  const userMessage = messages[messages.length - 1]?.content ?? "";

  if (!userMessage.trim()) {
    return new Response("Message required", { status: 400 });
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      let lastText = "";

      for await (const event of runAgent(userMessage)) {
        switch (event.type) {
          case "text":
            if (typeof event.content === "string" && event.content !== lastText) {
              const delta = event.content.slice(lastText.length);
              if (delta) dataStream.write(formatDataStreamPart("text", delta));
              lastText = event.content;
            }
            break;
          case "log":
            dataStream.writeData({ type: "log", log: event.log } as unknown as JSONValue);
            break;
          case "cart":
            dataStream.writeData({ type: "cart", cart: event.cart } as unknown as JSONValue);
            break;
          case "profile":
            dataStream.writeData({ type: "profile", profile: event.profile } as unknown as JSONValue);
            break;
        }
      }
    },
    onError: (error) => (error instanceof Error ? error.message : "Stream error"),
  });
}
