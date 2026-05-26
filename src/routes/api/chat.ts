import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { GoogleGenAI } from "@google/genai";
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

async function createGoogleResponse(contents: Array<{ parts: Array<{ text: string }> }>) {
  const response = await googleClient.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: {
      thinkingConfig: {
        thinkingLevel: "HIGH",
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
        if (!lovableKey && !googleKey) {
          return new Response("Missing LOVABLE_API_KEY or GOOGLE_API_KEY", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        try {
          const dataset = buildDatasetContext();
          const system = `You are the embedded analytics assistant for an FMCG Beverage Market Intelligence dashboard.
Answer questions strictly about the dashboard, its tabs (Market Share, Channel Sales, HH Panel, SKU Performance), and the dataset provided below. The dataset spans 5 markets, monthly trend (Aug'24 - Mar'25), brand shares (Brand A/B/C/Others), channel offtake & growth, HH penetration & buying frequency, buyer funnel, and SKU revenue/distribution.

Rules:
- Be concise. Use markdown, short bullets, and tables when comparing markets/SKUs.
- Cite exact numbers from the dataset; never invent values.
- If a question is outside the dataset/dashboard, say so briefly and suggest a related question you CAN answer.
- All currency is INR (Cr = crores, L = lakhs). Shares are %.

DATASET (JSON):
${dataset}`;

          if (lovableKey) {
            const gateway = createLovableAiGatewayProvider(lovableKey);
            const model = gateway("google/gemini-3-flash-preview");

            const result = streamText({
              model,
              system,
              messages: await convertToModelMessages(messages),
            });

            return result.toUIMessageStreamResponse({ originalMessages: messages });
          }

          const contents = buildGoogleContents(system, messages);
          return await createGoogleResponse(contents);
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
