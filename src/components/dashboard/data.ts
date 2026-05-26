export const CHART_COLORS = {
  teal: "oklch(0.78 0.17 175)",
  blue: "oklch(0.65 0.2 245)",
  amber: "oklch(0.82 0.18 80)",
  purple: "oklch(0.7 0.17 320)",
  orange: "oklch(0.72 0.2 45)",
  gray: "oklch(0.55 0.03 250)",
  red: "oklch(0.65 0.22 25)",
  grid: "oklch(0.35 0.03 250 / 0.4)",
  axis: "oklch(0.7 0.02 250)",
};

export const MARKETS = [
  "India Urban | All Channels",
  "India Urban | Modern Trade",
  "India Urban | E-Commerce",
  "India Rural | All Channels",
  "All India | All Channels",
] as const;

export type Market = (typeof MARKETS)[number];
export type KpiColor = "teal" | "blue" | "amber" | "red";
export type Kpi = { label: string; value: string; delta: string; up: boolean; color: KpiColor };

type Channel = "Modern Trade" | "General Trade" | "E-Commerce" | "HoReCa" | "CSD";

type MarketProfile = {
  subtitle: string;
  valueScale: number;
  categoryGrowth: number;
  brandAOffset: number;
  brandAMomentum: number;
  brandBOffset: number;
  brandCOffset: number;
  distributionOffset: number;
  penetrationOffset: number;
  frequencyOffset: number;
  channelFactors: Record<Channel, number>;
  channelGrowthAdjust: Record<Channel, number>;
  skuScale: number;
  skuMix: number[];
  skuDistOffset: number;
  priceIndex: number;
  weightedDist: number;
  shelf: number;
  promo: number;
  insight: string;
};

export const months = ["Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24", "Jan'25", "Feb'25", "Mar'25"];

const baseBrandA = [42.1, 43.2, 41.8, 43.5, 44.6, 45.2, 46.9, 48.4];
const baseBrandB = [28.4, 28.1, 28.7, 28.0, 27.6, 27.3, 26.9, 26.5];
const baseBrandC = [17.2, 17.6, 17.4, 17.5, 17.8, 17.6, 17.7, 17.8];
const basePenetration = [38.2, 39.4, 40.1, 41.3, 42.5, 43.4, 44.6, 45.7];
const baseFrequency = [3.1, 3.3, 3.2, 3.5, 3.8, 3.6, 3.7, 4.0];

const channelBase: Array<{ channel: Channel; units: number; color: string; growth: number }> = [
  { channel: "Modern Trade", units: 3850, color: CHART_COLORS.teal, growth: 12.4 },
  { channel: "General Trade", units: 6540, color: CHART_COLORS.blue, growth: 4.1 },
  { channel: "E-Commerce", units: 1280, color: CHART_COLORS.amber, growth: 38.7 },
  { channel: "HoReCa", units: 720, color: CHART_COLORS.purple, growth: 7.2 },
  { channel: "CSD", units: 290, color: CHART_COLORS.orange, growth: -3.4 },
];

const skuBase = [
  { sku: "Bev A 500ml", revenue: 2840, dist: 87, vol: 22.1, fill: CHART_COLORS.teal },
  { sku: "Bev A 1L", revenue: 2210, dist: 74, vol: 17.2, fill: CHART_COLORS.blue },
  { sku: "Bev B 330ml", revenue: 1780, dist: 81, vol: 13.9, fill: CHART_COLORS.gray },
  { sku: "Bev A 250ml", revenue: 1640, dist: 93, vol: 12.8, fill: CHART_COLORS.gray },
  { sku: "Bev C 750ml", revenue: 1320, dist: 62, vol: 10.3, fill: CHART_COLORS.gray },
];

const marketProfiles: Record<Market, MarketProfile> = {
  "India Urban | All Channels": {
    subtitle: "Senniel + Numerator + HH Panel · MAT Mar'25 · India Urban",
    valueScale: 1,
    categoryGrowth: 8.3,
    brandAOffset: 0,
    brandAMomentum: 0,
    brandBOffset: 0,
    brandCOffset: 0,
    distributionOffset: 0,
    penetrationOffset: 0,
    frequencyOffset: 0,
    channelFactors: { "Modern Trade": 1, "General Trade": 1, "E-Commerce": 1, HoReCa: 1, CSD: 1 },
    channelGrowthAdjust: { "Modern Trade": 0, "General Trade": 0, "E-Commerce": 0, HoReCa: 0, CSD: 0 },
    skuScale: 1,
    skuMix: [1, 1, 1, 1, 1],
    skuDistOffset: 0,
    priceIndex: 108,
    weightedDist: 94,
    shelf: 39,
    promo: 22,
    insight: "E-Commerce is the fastest growing channel at +38.7% YoY, but contributes only 9.7% of total offtake. Modern Trade continues to show strong double-digit growth driven by urban premiumisation.",
  },
  "India Urban | Modern Trade": {
    subtitle: "Senniel + Numerator + HH Panel · MAT Mar'25 · Urban Modern Trade",
    valueScale: 0.36,
    categoryGrowth: 12.1,
    brandAOffset: 3.2,
    brandAMomentum: 0.12,
    brandBOffset: -1.4,
    brandCOffset: 0.8,
    distributionOffset: 5,
    penetrationOffset: 3.6,
    frequencyOffset: 0.3,
    channelFactors: { "Modern Trade": 1.75, "General Trade": 0.28, "E-Commerce": 0.85, HoReCa: 0.58, CSD: 0.18 },
    channelGrowthAdjust: { "Modern Trade": 4.2, "General Trade": -1.8, "E-Commerce": -4.1, HoReCa: 1.4, CSD: -2.2 },
    skuScale: 0.42,
    skuMix: [1.12, 1.2, 0.78, 0.92, 1.06],
    skuDistOffset: 4,
    priceIndex: 116,
    weightedDist: 97,
    shelf: 46,
    promo: 28,
    insight: "Modern Trade over-indexes on premium packs: Brand A share and distribution improve together, with higher shelf presence supporting a stronger repeat-buy story.",
  },
  "India Urban | E-Commerce": {
    subtitle: "Senniel + Numerator + HH Panel · MAT Mar'25 · Urban E-Commerce",
    valueScale: 0.14,
    categoryGrowth: 36.8,
    brandAOffset: 5.4,
    brandAMomentum: 0.2,
    brandBOffset: -2.1,
    brandCOffset: -0.4,
    distributionOffset: -8,
    penetrationOffset: 5.2,
    frequencyOffset: 0.55,
    channelFactors: { "Modern Trade": 0.22, "General Trade": 0.08, "E-Commerce": 4.6, HoReCa: 0.05, CSD: 0.02 },
    channelGrowthAdjust: { "Modern Trade": -3.4, "General Trade": -2.1, "E-Commerce": 12.4, HoReCa: -4.8, CSD: -3.1 },
    skuScale: 0.2,
    skuMix: [0.9, 1.35, 0.62, 1.16, 0.72],
    skuDistOffset: -10,
    priceIndex: 112,
    weightedDist: 79,
    shelf: 34,
    promo: 41,
    insight: "E-Commerce is a high-growth, promotion-sensitive pocket. Larger packs and higher buying frequency lift Brand A, despite lower numeric distribution than offline channels.",
  },
  "India Rural | All Channels": {
    subtitle: "Retail Audit + HH Panel · MAT Mar'25 · India Rural",
    valueScale: 0.72,
    categoryGrowth: 5.4,
    brandAOffset: -4.6,
    brandAMomentum: -0.05,
    brandBOffset: 2.8,
    brandCOffset: 1.6,
    distributionOffset: -13,
    penetrationOffset: -7.8,
    frequencyOffset: -0.5,
    channelFactors: { "Modern Trade": 0.18, "General Trade": 1.42, "E-Commerce": 0.12, HoReCa: 0.34, CSD: 0.58 },
    channelGrowthAdjust: { "Modern Trade": -5.2, "General Trade": 2.3, "E-Commerce": -10.4, HoReCa: -1.6, CSD: 1.2 },
    skuScale: 0.58,
    skuMix: [0.95, 0.72, 1.18, 1.1, 1.08],
    skuDistOffset: -12,
    priceIndex: 96,
    weightedDist: 71,
    shelf: 26,
    promo: 14,
    insight: "Rural performance is distribution-led. Brand B is more resilient here, while Brand A needs broader reach before share gains become sustainable.",
  },
  "All India | All Channels": {
    subtitle: "Retail Audit + HH Panel + Shipment Validation · MAT Mar'25 · All India",
    valueScale: 1.68,
    categoryGrowth: 7.1,
    brandAOffset: -1.8,
    brandAMomentum: -0.02,
    brandBOffset: 1.2,
    brandCOffset: 0.9,
    distributionOffset: -5,
    penetrationOffset: -3.2,
    frequencyOffset: -0.15,
    channelFactors: { "Modern Trade": 0.86, "General Trade": 1.22, "E-Commerce": 0.72, HoReCa: 0.82, CSD: 1.08 },
    channelGrowthAdjust: { "Modern Trade": -1.1, "General Trade": 1.2, "E-Commerce": -3.8, HoReCa: 0.3, CSD: 1.6 },
    skuScale: 1.54,
    skuMix: [1.02, 0.94, 1.08, 1.04, 1.02],
    skuDistOffset: -4,
    priceIndex: 103,
    weightedDist: 86,
    shelf: 34,
    promo: 19,
    insight: "All India normalises the urban spike: General Trade carries more volume, so Brand A share is lower than Urban but still ahead when penetration and frequency move together.",
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round1 = (value: number) => Math.round(value * 10) / 10;
const formatPercent = (value: number) => `${round1(value).toFixed(1)}%`;
const formatDelta = (value: number, suffix: string) => `${value >= 0 ? "+" : "−"}${Math.abs(round1(value)).toFixed(1)}${suffix}`;
const formatWholePercent = (value: number) => `${Math.round(value)}%`;
const formatCurrencyCr = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}Cr`;
const formatCurrencyL = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}L`;

export function getMarketData(market: Market) {
  const profile = marketProfiles[market];
  const volumeShareTrend = months.map((month, index) => {
    const Brand_A = clamp(baseBrandA[index] + profile.brandAOffset + index * profile.brandAMomentum, 5, 70);
    const Brand_B = clamp(baseBrandB[index] + profile.brandBOffset - index * profile.brandAMomentum * 0.35, 5, 55);
    const Brand_C = clamp(baseBrandC[index] + profile.brandCOffset, 5, 35);

    return {
      month,
      Brand_A: round1(Brand_A),
      Brand_B: round1(Brand_B),
      Brand_C: round1(Brand_C),
      Others: round1(clamp(100 - Brand_A - Brand_B - Brand_C, 1, 55)),
    };
  });

  const latestShare = volumeShareTrend[volumeShareTrend.length - 1];
  const brandADelta = latestShare.Brand_A - (baseBrandA[baseBrandA.length - 1] - 6.3);
  const brandBDelta = latestShare.Brand_B - (baseBrandB[baseBrandB.length - 1] + 1.9);
  const distribution = clamp(87 + profile.distributionOffset, 35, 99);
  const penetration = clamp(basePenetration[basePenetration.length - 1] + profile.penetrationOffset, 10, 80);

  const channelOfftake = channelBase.map((item) => ({
    channel: item.channel,
    units: Math.round(item.units * profile.channelFactors[item.channel]),
    color: item.color,
  }));

  const channelGrowth = channelBase.map((item) => ({
    channel: item.channel,
    growth: round1(item.growth + profile.channelGrowthAdjust[item.channel]),
    color: item.color,
  }));

  const hhPenetration = months.map((month, index) => ({
    month,
    pen: round1(clamp(basePenetration[index] + profile.penetrationOffset + index * 0.03, 5, 80)),
  }));

  const buyingFrequency = months.map((month, index) => ({
    month,
    freq: round1(clamp(baseFrequency[index] + profile.frequencyOffset, 1.5, 7)),
  }));

  const skuRevenue = skuBase.map((item, index) => ({
    sku: item.sku,
    revenue: Math.round(item.revenue * profile.skuScale * profile.skuMix[index]),
    fill: item.fill,
  }));

  const skuDistribution = skuBase.map((item, index) => ({
    sku: item.sku,
    dist: Math.round(clamp(item.dist + profile.skuDistOffset + (profile.skuMix[index] - 1) * 10, 25, 99)),
  }));

  const leaderDist = Math.max(...skuDistribution.map((item) => item.dist));
  const skuTable = skuBase.map((item, index) => {
    const dist = skuDistribution[index].dist;
    const gap = dist === leaderDist ? "Leader" : `−${leaderDist - dist}pts`;

    return {
      sku: item.sku,
      revenue: formatCurrencyL(skuRevenue[index].revenue),
      vol: formatPercent(clamp(item.vol + profile.brandAOffset * 0.2 + (profile.skuMix[index] - 1) * 4, 2, 45)),
      dist,
      gap,
      gapNeg: gap !== "Leader",
    };
  });

  return {
    market,
    subtitle: profile.subtitle,
    kpis: [
      { label: "Category Value", value: formatCurrencyCr(12840 * profile.valueScale), delta: formatDelta(profile.categoryGrowth, "% YoY"), up: profile.categoryGrowth >= 0, color: "teal" },
      { label: "Brand A Vol Share", value: formatPercent(latestShare.Brand_A), delta: formatDelta(brandADelta, "pts vs YAG"), up: brandADelta >= 0, color: "teal" },
      { label: "Numeric Distribution", value: formatWholePercent(distribution), delta: formatDelta(profile.distributionOffset + 4, "pts vs YAG"), up: profile.distributionOffset + 4 >= 0, color: "amber" },
      { label: "HH Penetration", value: formatPercent(penetration), delta: formatDelta(profile.penetrationOffset + 7.5, "pts vs YAG"), up: profile.penetrationOffset + 7.5 >= 0, color: "blue" },
      { label: "Brand B Vol Share", value: formatPercent(latestShare.Brand_B), delta: formatDelta(brandBDelta, "pts vs YAG"), up: brandBDelta >= 0, color: brandBDelta >= 0 ? "blue" : "red" },
    ] satisfies Kpi[],
    volumeShareTrend,
    volShareDonut: [
      { name: "Brand A", value: latestShare.Brand_A, color: CHART_COLORS.teal },
      { name: "Brand B", value: latestShare.Brand_B, color: CHART_COLORS.blue },
      { name: "Brand C", value: latestShare.Brand_C, color: CHART_COLORS.amber },
      { name: "Others", value: latestShare.Others, color: CHART_COLORS.gray },
    ],
    marketStats: [
      { label: "Price Index vs Cat", value: `${profile.priceIndex}` },
      { label: "Weighted Dist.", value: `${profile.weightedDist}%` },
      { label: "Share of Shelf", value: `${profile.shelf}%` },
      { label: "Promo Offtake %", value: `${profile.promo}%` },
    ],
    channelOfftake,
    channelGrowth,
    hhPenetration,
    buyingFrequency,
    funnel: [
      { label: "Category Buyers", value: formatPercent(clamp(78.2 + profile.penetrationOffset * 0.4, 20, 95)), caption: "Buy any beverage" },
      { label: "Brand A Aware", value: formatPercent(clamp(71.4 + profile.brandAOffset, 20, 95)), caption: "Unaided brand awareness" },
      { label: "Ever Tried", value: formatPercent(clamp(63.9 + profile.penetrationOffset * 0.75, 15, 90)), caption: "Trial penetration" },
      { label: "Past 3M Buyers", value: formatPercent(penetration), caption: "Active buyers" },
      { label: "Loyalists (>60% SOW)", value: formatPercent(clamp(28.3 + profile.brandAOffset * 0.8 + profile.frequencyOffset * 3, 5, 65)), caption: "Share of wallet" },
    ],
    skuRevenue,
    skuDistribution,
    skuTable,
    insight: profile.insight,
  };
}

export type MarketDashboardData = ReturnType<typeof getMarketData>;
