import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import Groq from "groq-sdk";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { MARKETS, getMarketData } from "@/components/dashboard/data";

function buildDatasetContext() {
  const snapshots = MARKETS.map((m) => {
    const d = getMarketData(m);
    return {
      market: m,
      subtitle: d.subtitle,
      kpis: d.kpis.map((k) => ({ label: k.label, value: k.value, delta: k.delta })),
      volumeShareTrend: d.volumeShareTrend,
      volShareLatest: d.volShareDonut,
      marketStats: d.marketStats,
      channelOfftake: d.channelOfftake.map((c) => ({ channel: c.channel, units: c.units })),
      channelGrowth: d.channelGrowth.map((c) => ({ channel: c.channel, growthPct: c.growth })),
      hhPenetration: d.hhPenetration,
      buyingFrequency: d.buyingFrequency,
      funnel: d.funnel.map((f) => ({ stage: f.label, value: f.value, note: f.caption })),
      skuTable: d.skuTable,
      insight: d.insight,
    };
  });
  return JSON.stringify(snapshots);
}

function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

function buildGoogleContents(system: string, messages: UIMessage[]) {
  return [
    { parts: [{ text: system }] },
    ...messages.map((message) => ({
      parts: [
        {
          text: `${message.role === "user" ? "User" : "Assistant"}: ${getMessageText(
            message,
          )}`,
        },
      ],
    })),
  ];
}

const googleClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

async function createGoogleResponse(contents: Array<{ parts: Array<{ text: string }> }>) {
  const response = await googleClient.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Google GenAI returned no text.");
  }

  const stream = createUIMessageStream({
    async execute({ writer }) {
      const id = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `assistant-${Date.now()}`;

      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

async function createGroqResponse(system: string, messages: UIMessage[]) {
  const groqMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: system },
    ...messages.map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: getMessageText(m),
    })),
  ];

  const stream = createUIMessageStream({
    async execute({ writer }) {
      const id = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `assistant-${Date.now()}`;

      writer.write({ type: "text-start", id });

      const completion = await groqClient.chat.completions.create({
        messages: groqMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: true,
        stop: null,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          writer.write({ type: "text-delta", id, delta: content });
        }
      }

      writer.write({ type: "text-end", id });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function buildSystemPrompt(dataset: string) {
  return `You are the embedded analytics assistant for an FMCG Beverage Market Intelligence dashboard.
Answer questions strictly about the dashboard, its tabs (Market Share, Channel Sales, HH Panel, SKU Performance), and the dataset provided below. The dataset spans 5 markets, monthly trend (Aug'24 - Mar'25), brand shares (Brand A/B/C/Others), channel offtake & growth, HH penetration & buying frequency, buyer funnel, and SKU revenue/distribution.

Rules:
- Be concise. Use markdown, short bullets, and tables when comparing markets/SKUs.
- Cite exact numbers from the dataset; never invent values.
- If a question is outside the dataset/dashboard, say so briefly and suggest a related question you CAN answer.
- All currency is INR (Cr = crores, L = lakhs). Shares are %.
- At the very end of your response, suggest 3 relevant follow-up questions the user might want to ask next. Format them as a JSON array on a new line like this:
__FOLLOW_UPS__: ["question 1", "question 2", "question 3"]

DATASET (JSON):
${dataset}`;
}

enum Provider {
  Lovable = "lovable",
  Google = "google",
  Groq = "groq",
}

async function tryPrimaryProvider(
  provider: Provider,
  system: string,
  messages: UIMessage[],
): Promise<Response | null> {
  try {
    switch (provider) {
      case Provider.Lovable: {
        const key = process.env.LOVABLE_API_KEY!;
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      }
      case Provider.Google: {
        const contents = buildGoogleContents(system, messages);
        return await createGoogleResponse(contents);
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`${provider} provider failed:`, error);
    return null;
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }

        const lovableKey = process.env.LOVABLE_API_KEY;
        const googleKey = process.env.GOOGLE_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        if (!lovableKey && !googleKey && !groqKey) {
          return new Response("Missing any API key (LOVABLE_API_KEY, GOOGLE_API_KEY, or GROQ_API_KEY)", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        try {
          const dataset = buildDatasetContext();
          const system = buildSystemPrompt(dataset);

          const providers: Provider[] = [];
          if (lovableKey) providers.push(Provider.Lovable);
          if (googleKey) providers.push(Provider.Google);

          // Try primary providers in order
          for (const p of providers) {
            const result = await tryPrimaryProvider(p, system, messages);
            if (result) return result;
          }

          // Fallback to Groq if available
          if (groqKey) {
            console.info("Falling back to Groq LLM");
            return await createGroqResponse(system, messages);
          }

          return new Response("All providers exhausted. Set GROQ_API_KEY for fallback.", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        } catch (error) {
          const message = error instanceof Error ? error.stack ?? error.message : String(error);
          console.error("/api/chat error:", message);
          return new Response(message, {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

      },
    },
  },
});
