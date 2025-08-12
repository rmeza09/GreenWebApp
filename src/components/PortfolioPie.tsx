import "../styles/globals.css";
"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

// let TypeScript accept the injected env at build time
declare const process: { env: { API_BASE?: string } };

const API_BASE = (process.env.API_BASE || "http://localhost:5000").replace(/\/+$/, "");
const CUSTOM_PORTFOLIO_URL = `${API_BASE}/api/custom_portfolio`;

// Keep colors consistent with StockChart
import type { ChartConfig } from "./ui/chart";   // same place you import ChartContainer

const myAssets = ["SPY", "AMZN", "META", "GOOGL", "AMD", "NKE", "UBER", "COST", "JPM", "CRM", "TXRH"];

// make sure hexes have '#'
const COLORS = [
  "#000000",  // SPY
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#fa8072", "#b0e0e6", "#ffbb28"
];

// build the ChartConfig for ChartContainer
const chartConfig: ChartConfig = myAssets.reduce((acc, sym, i) => {
  acc[sym] = { label: sym, color: COLORS[i % COLORS.length] };
  return acc;
}, {} as ChartConfig);

type DistributionItem = { Symbol: string; Value: number };
type AnyDist = { Symbol?: string; symbol?: string; Value?: number; value?: number };
type CustomPortfolioResponse = {
  distribution?: DistributionItem[];
  // timeseries?: ...  // (not needed here)
};

type Props = {
  symbols?: string[];
  weights?: number[];
  includeSpy?: boolean; // default false = hide SPY in the pie
};

export default function PortfolioPie({ symbols, weights, includeSpy = false }: Props) {
  const [dist, setDist] = useState<DistributionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Build fetch inputs like StockChart does (with resilient defaults)
  const { symbolsToFetch, weightsToFetch } = useMemo(() => {
    let s = symbols;
    let w = weights;

    if (Array.isArray(symbols) && symbols.length === 0) {
      // Clear button → default to SPY only
      s = ["SPY"];
      w = [1];
    } else if (!symbols) {
      // Initial render fallback
      s = myAssets;
      w = Array(myAssets.length).fill(1);
    }
    // If weights missing/mismatched, default to 1s
    if (!w || w.length !== s!.length) w = Array(s!.length).fill(1);
    return { symbolsToFetch: s!, weightsToFetch: w! };
  }, [symbols, weights]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(CUSTOM_PORTFOLIO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: symbolsToFetch, shares: weightsToFetch })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json: { distribution?: AnyDist[] } = await res.json();

        let distr: DistributionItem[] | undefined;

        if (Array.isArray(json.distribution) && json.distribution.length) {
          // Use backend's value = shares * price
          distr = json.distribution
            .map(d => ({
              Symbol: (d.Symbol ?? d.symbol ?? "").toUpperCase(),
              Value: Number(d.Value ?? d.value ?? 0)
            }))
            .filter(d => (includeSpy ? true : d.Symbol !== "SPY"));
        }

        // Fallback: if backend didn't send distribution, use weights only
        if (!distr || distr.length === 0) {
          distr = symbolsToFetch
            .map((sym, i) => ({ Symbol: sym, Value: Number(weightsToFetch[i] ?? 1) }))
            .filter(d => (includeSpy ? true : d.Symbol !== "SPY"));
        }

        if (!cancelled) setDist(distr);

      } catch (err) {
        console.error("PortfolioPie fetch error:", err);
        // Even on error, render a pie from the latest weights so UI stays responsive
        const fallback = symbolsToFetch
          .map((sym, i) => ({ Symbol: sym, Value: Number(weightsToFetch[i] ?? 1) }))
          .filter(d => includeSpy ? true : d.Symbol !== "SPY");

        if (!cancelled) setDist(fallback);

      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [symbolsToFetch, weightsToFetch, includeSpy]);

  const total = useMemo(() => dist.reduce((s, d) => s + (Number(d.Value) || 0), 0), [dist]);

  

  return (
    <div className="flex justify-center w-full">
      <Card className="flex flex-col w-[600px] font-['Roboto']">
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-['Roboto']">Portfolio Distribution</CardTitle>
          <CardDescription className="font-['Roboto']">
            {loading ? "Loading..." : "Based on current selection"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          <ChartContainer config={chartConfig}
            className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
          >
            <PieChart width={750} height={300}>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as DistributionItem;
                  const pct = total > 0 ? ((Number(p.Value) / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div className="bg-white p-2 rounded shadow-md text-black">
                      <div><strong>{p.Symbol}</strong></div>
                      <div>Share: {pct}%</div>
                    </div>
                  );
                }}
              />
              <Pie
                data={dist}
                dataKey="Value"
                nameKey="Symbol"
                outerRadius={150}
                cx="50%"
                cy="50%"
                label={({ cx, cy, midAngle, outerRadius, index }) => {
                  const item = dist[index];
                  if (!item) return null;
                  const RAD = Math.PI / 180;
                  const r = outerRadius + 20;
                  const x = cx + r * Math.cos(-midAngle * RAD);
                  const y = cy + r * Math.sin(-midAngle * RAD);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#222"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontWeight="bold"
                      fontFamily="Roboto, sans-serif"
                      fontSize={14}
                    >
                      {item.Symbol}
                    </text>
                  );
                }}
              >
                {dist.map((d, i) => {
                  const fill =
                    d.Symbol === "SPY"
                      ? COLORS[0]                          // keep SPY black
                      : COLORS[1 + (i % (COLORS.length - 1))]; // cycle from the 2nd color onward
                  return <Cell key={d.Symbol} fill={fill} />;
                })}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
