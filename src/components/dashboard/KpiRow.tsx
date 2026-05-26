import { TrendingUp, TrendingDown } from "lucide-react";
import type { Kpi } from "./data";

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {kpis.map((k) => {
        const accent =
          k.color === "teal"
            ? "var(--chart-teal)"
            : k.color === "blue"
              ? "var(--chart-blue)"
              : k.color === "amber"
                ? "var(--chart-amber)"
                : "var(--chart-red)";
        return (
          <div
            key={k.label}
            className="panel relative overflow-hidden p-5"
            style={{ borderTop: `2px solid ${accent}` }}
          >
            <div className="kpi-label">{k.label}</div>
            <div className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
              {k.value}
            </div>
            <div
              className="mt-2 flex items-center gap-1 text-xs font-medium"
              style={{ color: k.up ? "var(--chart-teal)" : "var(--chart-red)" }}
            >
              {k.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {k.delta}
            </div>
          </div>
        );
      })}
    </div>
  );
}
