import { useMemo, useState } from "react";
import { Database, Download, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MARKETS, getMarketData, type Market } from "./data";

type Row = Record<string, string | number>;

function toCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

function filterRows(rows: Row[], query: string): Row[] {
  if (!query) return rows;
  const q = query.toLowerCase();
  return rows.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(q))
  );
}

function DataTable({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No matching rows.
      </p>
    );
  }
  const headers = Object.keys(rows[0]);
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur">
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h} className="text-xs font-semibold uppercase tracking-wide">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              {headers.map((h) => (
                <TableCell key={h} className="text-xs tabular-nums">
                  {String(r[h])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const DATASETS = [
  { key: "volumeShareTrend", label: "Volume Share Trend" },
  { key: "volShareDonut", label: "Volume Share Mix" },
  { key: "channelOfftake", label: "Channel Offtake" },
  { key: "channelGrowth", label: "Channel YoY Growth" },
  { key: "hhPenetration", label: "HH Penetration" },
  { key: "buyingFrequency", label: "Buying Frequency" },
  { key: "funnel", label: "Buyer Funnel" },
  { key: "skuTable", label: "SKU Performance" },
  { key: "kpis", label: "KPI Summary" },
  { key: "marketStats", label: "Market Stats" },
] as const;

type DatasetKey = (typeof DATASETS)[number]["key"];

export function DatasetDialog({ trigger }: { trigger: React.ReactNode }) {
  const [market, setMarket] = useState<Market | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DatasetKey>("volumeShareTrend");

  const allRows = useMemo(() => {
    const out: Record<DatasetKey, Row[]> = {
      volumeShareTrend: [],
      volShareDonut: [],
      channelOfftake: [],
      channelGrowth: [],
      hhPenetration: [],
      buyingFrequency: [],
      funnel: [],
      skuTable: [],
      kpis: [],
      marketStats: [],
    };
    const targets = market === "ALL" ? MARKETS : [market];
    for (const m of targets) {
      const d = getMarketData(m);
      d.volumeShareTrend.forEach((r) => out.volumeShareTrend.push({ Market: m, ...r }));
      d.volShareDonut.forEach((r) =>
        out.volShareDonut.push({ Market: m, Brand: r.name, Share: r.value })
      );
      d.channelOfftake.forEach((r) =>
        out.channelOfftake.push({ Market: m, Channel: r.channel, "Units (000s)": r.units })
      );
      d.channelGrowth.forEach((r) =>
        out.channelGrowth.push({ Market: m, Channel: r.channel, "Growth %": r.growth })
      );
      d.hhPenetration.forEach((r) =>
        out.hhPenetration.push({ Market: m, Month: r.month, "Penetration %": r.pen })
      );
      d.buyingFrequency.forEach((r) =>
        out.buyingFrequency.push({ Market: m, Month: r.month, "Freq (x/yr)": r.freq })
      );
      d.funnel.forEach((r) =>
        out.funnel.push({ Market: m, Stage: r.label, Value: r.value, Caption: r.caption })
      );
      d.skuTable.forEach((r) =>
        out.skuTable.push({
          Market: m,
          SKU: r.sku,
          Revenue: r.revenue,
          "Vol Share": r.vol,
          "Distribution %": r.dist,
          "Gap vs Leader": r.gap,
        })
      );
      d.kpis.forEach((r) =>
        out.kpis.push({ Market: m, KPI: r.label, Value: r.value, Delta: r.delta })
      );
      d.marketStats.forEach((r) =>
        out.marketStats.push({ Market: m, Metric: r.label, Value: r.value })
      );
    }
    return out;
  }, [market]);

  const visible = filterRows(allRows[tab], query);

  const downloadCsv = () => {
    const csv = toCsv(visible);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}_${market === "ALL" ? "all-markets" : market.replace(/\W+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-6xl flex-col gap-4 p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Dataset Explorer
          </DialogTitle>
          <DialogDescription>
            Every data point powering the dashboard. Filter by market, search across rows, and export to CSV.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={market} onValueChange={(v) => setMarket(v as Market | "ALL")}>
            <SelectTrigger className="h-9 w-[240px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Markets</SelectItem>
              {MARKETS.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rows…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" onClick={downloadCsv} className="h-9 gap-1.5">
            <Download className="size-4" />
            Export CSV
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {visible.length} rows
          </span>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as DatasetKey)} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/40 p-1">
            {DATASETS.map((d) => (
              <TabsTrigger key={d.key} value={d.key} className="text-xs">
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DATASETS.map((d) => (
            <TabsContent
              key={d.key}
              value={d.key}
              className="mt-3 min-h-0 flex-1 overflow-auto"
            >
              <DataTable rows={tab === d.key ? visible : []} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
