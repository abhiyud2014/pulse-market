import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Database } from "lucide-react";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { MARKETS, getMarketData, type Market } from "@/components/dashboard/data";
import { DatasetDialog } from "@/components/dashboard/DatasetDialog";
import { ChatbotWidget } from "@/components/dashboard/ChatbotWidget";
import {
  MarketSharePanel,
  ChannelSalesPanel,
  HHPanelView,
  SKUPanel,
} from "@/components/dashboard/panels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FMCG Beverage — Market Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Interactive Market Intelligence dashboard for FMCG beverages: market share, channel sales, household panel and SKU performance.",
      },
    ],
  }),
  component: Dashboard,
});

const TABS = ["Market Share", "Channel Sales", "HH Panel", "SKU Performance"] as const;
type Tab = (typeof TABS)[number];

function Dashboard() {
  const [tab, setTab] = useState<Tab>("Market Share");
  const [market, setMarket] = useState<Market>(MARKETS[0]);
  const reportData = getMarketData(market);


  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <header className="panel sticky top-0 z-50 flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--chart-teal), var(--chart-blue))",
              }}
            >
              <BarChart3 className="size-6 text-background" />
            </div>
            <div>
              <h1 className="text-base font-bold md:text-lg">
                FMCG Beverage — Market Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">
                {reportData.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DatasetDialog
              trigger={
                <button
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary cursor-pointer"
                  style={{ borderColor: "var(--chart-teal)", color: "var(--chart-teal)" }}
                >
                  <Database className="size-3.5" />
                  Show Dataset
                </button>
              }
            />
            <Select value={market} onValueChange={(value) => setMarket(value as Market)}>
              <SelectTrigger className="h-8 w-[230px] border-border bg-secondary/60 text-xs font-medium hover:bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKETS.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* KPI Row */}
        <KpiRow kpis={reportData.kpis} />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: active ? "var(--chart-blue)" : "oklch(0.26 0.035 250 / 0.6)",
                  color: active ? "white" : "var(--muted-foreground)",
                  border: `1px solid ${active ? "var(--chart-blue)" : "var(--border)"}`,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Panel content */}
        <section>
          {tab === "Market Share" && <MarketSharePanel data={reportData} />}
          {tab === "Channel Sales" && <ChannelSalesPanel data={reportData} />}
          {tab === "HH Panel" && <HHPanelView data={reportData} />}
          {tab === "SKU Performance" && <SKUPanel data={reportData} />}
        </section>

        <footer className="pt-2 text-center text-xs text-muted-foreground">
          Demo dashboard built with React + Vite + Tailwind + Recharts. Data shown is illustrative.
        </footer>
      </div>
      <ChatbotWidget />
    </main>
  );
}
