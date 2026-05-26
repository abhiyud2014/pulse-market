import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  CHART_COLORS,
  type MarketDashboardData,
} from "./data";

const tooltipStyle = {
  backgroundColor: "oklch(0.22 0.04 250)",
  border: "1px solid oklch(0.4 0.04 250)",
  borderRadius: 8,
  fontSize: 12,
  color: "#ffffff",
  boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
};
const tooltipItemStyle = { color: "#ffffff" };
const tooltipLabelStyle = { color: "#ffffff", fontWeight: 600, marginBottom: 4 };

function PanelHeader({ title }: { title: string }) {
  return (
    <h3 className="kpi-label mb-3" style={{ color: "var(--chart-teal)" }}>
      {title}
    </h3>
  );
}

/* ---------- Market Share ---------- */
export function MarketSharePanel({ data }: { data: MarketDashboardData }) {
  const { volumeShareTrend, volShareDonut, marketStats } = data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="panel p-5 lg:col-span-2">
        <PanelHeader title="Volume Share Trend — MAT (Senniel)" />
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={volumeShareTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="month" stroke={CHART_COLORS.axis} fontSize={11} />
              <YAxis stroke={CHART_COLORS.axis} fontSize={11} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Brand_A" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Brand_B" stroke={CHART_COLORS.blue} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Brand_C" stroke={CHART_COLORS.amber} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Others" stroke={CHART_COLORS.gray} strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel p-5">
        <PanelHeader title="Vol Share — Mar'25" />
        <div className="h-44">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={volShareDonut} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                {volShareDonut.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
          {volShareDonut.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-semibold text-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {marketStats.map((s) => (
            <div key={s.label} className="rounded-md bg-secondary/60 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="font-display text-lg font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Channel Sales ---------- */
export function ChannelSalesPanel({ data }: { data: MarketDashboardData }) {
  const { channelOfftake, channelGrowth, insight } = data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="panel p-5">
        <PanelHeader title="Retail Offtake by Channel — Mar'25 ('000 units)" />
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={channelOfftake} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis type="number" stroke={CHART_COLORS.axis} fontSize={11} />
              <YAxis type="category" dataKey="channel" stroke={CHART_COLORS.axis} fontSize={11} width={90} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
              <Bar dataKey="units" radius={[0, 6, 6, 0]}>
                {channelOfftake.map((c) => (
                  <Cell key={c.channel} fill={c.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel flex flex-col p-5">
        <PanelHeader title="Channel Growth vs YAG (%)" />
        <div className="h-56 flex-1">
          <ResponsiveContainer>
            <BarChart data={channelGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="channel" stroke={CHART_COLORS.axis} fontSize={10} />
              <YAxis stroke={CHART_COLORS.axis} fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="growth" radius={[6, 6, 0, 0]}>
                {channelGrowth.map((c, i) => (
                  <Cell key={i} fill={c.growth > 20 ? CHART_COLORS.teal : c.growth > 0 ? CHART_COLORS.blue : CHART_COLORS.amber} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 rounded-md border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold" style={{ color: "var(--chart-amber)" }}>💡 Insight:</span> {insight}
        </div>
      </div>
    </div>
  );
}

/* ---------- HH Panel ---------- */
export function HHPanelView({ data }: { data: MarketDashboardData }) {
  const { hhPenetration, buyingFrequency, funnel } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <PanelHeader title="HH Penetration — Brand A (Numerator / HH Panel)" />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={hhPenetration}>
                <defs>
                  <linearGradient id="penFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.teal} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" stroke={CHART_COLORS.axis} fontSize={11} />
                <YAxis stroke={CHART_COLORS.axis} fontSize={11} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `${v}%`} />
                <Area type="monotone" dataKey="pen" stroke={CHART_COLORS.teal} strokeWidth={2.5} fill="url(#penFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <PanelHeader title="Buying Frequency (trips/buyer/quarter)" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={buyingFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" stroke={CHART_COLORS.axis} fontSize={11} />
                <YAxis stroke={CHART_COLORS.axis} fontSize={11} domain={[2.5, 4.5]} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
                <Line type="monotone" dataKey="freq" stroke={CHART_COLORS.amber} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.amber }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="panel p-5">
        <PanelHeader title="Shopper Funnel — Brand A" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {funnel.map((f, i) => {
            const colors = [CHART_COLORS.teal, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.purple, CHART_COLORS.orange];
            return (
              <div key={f.label} className="rounded-lg bg-secondary/50 p-4" style={{ borderTop: `2px solid ${colors[i]}` }}>
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <div className="mt-1 font-display text-3xl font-bold">{f.value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{f.caption}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- SKU ---------- */
export function SKUPanel({ data }: { data: MarketDashboardData }) {
  const { skuRevenue, skuDistribution, skuTable } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <PanelHeader title="SKU Revenue Contribution (₹ Lakhs) — Mar'25" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={skuRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="sku" stroke={CHART_COLORS.axis} fontSize={10} />
                <YAxis stroke={CHART_COLORS.axis} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `₹${v}L`} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {skuRevenue.map((s, i) => (
                    <Cell key={i} fill={s.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <PanelHeader title="Numeric Distribution by SKU (%)" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={skuDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" stroke={CHART_COLORS.axis} fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="sku" stroke={CHART_COLORS.axis} fontSize={11} width={90} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="dist" fill={CHART_COLORS.amber} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="kpi-label" style={{ color: "var(--chart-teal)" }}>
            SKU Performance Table
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left font-medium">SKU</th>
              <th className="px-5 py-3 text-left font-medium">Revenue (₹L)</th>
              <th className="px-5 py-3 text-left font-medium">Vol Share %</th>
              <th className="px-5 py-3 text-left font-medium">Numeric Dist %</th>
              <th className="px-5 py-3 text-left font-medium">Gap to Leader</th>
            </tr>
          </thead>
          <tbody>
            {skuTable.map((r) => (
              <tr key={r.sku} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium">{r.sku}</td>
                <td className="px-5 py-3" style={{ color: CHART_COLORS.amber }}>{r.revenue}</td>
                <td className="px-5 py-3">{r.vol}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.dist}%`,
                          background: r.dist >= 85 ? CHART_COLORS.teal : CHART_COLORS.amber,
                        }}
                      />
                    </div>
                    <span className="tabular-nums text-muted-foreground">{r.dist}%</span>
                  </div>
                </td>
                <td className="px-5 py-3" style={{ color: r.gapNeg ? CHART_COLORS.red : CHART_COLORS.teal }}>
                  {r.gap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
