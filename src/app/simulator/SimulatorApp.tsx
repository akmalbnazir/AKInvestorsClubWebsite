"use client";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, CategoryScale);

type Series = { date: string; close: number }[];

export default function SimulatorApp() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [symbol, setSymbol] = useState("AAPL");
  const [qty, setQty] = useState(1);
  const [series, setSeries] = useState<Series>([]);
  const [leader, setLeader] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // ---- Helpers to safely fetch JSON ----
  async function safeFetch(url: string, options?: RequestInit) {
    try {
      const res = await fetch(url, { cache: "no-store", ...options });
      if (!res.ok) {
        console.error(`Fetch failed: ${url}`, res.status);
        return {};
      }
      return await res.json().catch(() => ({}));
    } catch (err) {
      console.error(`Fetch error: ${url}`, err);
      return {};
    }
  }

  // ---- Loaders ----
  async function load() {
    const p = await safeFetch("/api/simulator/portfolio");
    setPortfolio(p);
  }

  async function loadChart(sym: string) {
    const d = await safeFetch(`/api/market/daily/${encodeURIComponent(sym)}`);
    setSeries(d.data || []);
  }

  async function loadLB() {
    const d = await safeFetch("/api/simulator/leaderboard");
    setLeader(d.leaderboard || []);
  }

  useEffect(() => {
    load();
    loadChart(symbol);
    loadLB();
    const id = setInterval(loadLB, 10000); // refresh every 10s
    return () => clearInterval(id);
  }, []);

  // ---- Trading ----
  async function trade(side: "BUY" | "SELL") {
    setBusy(true);
    try {
      const res = await fetch("/api/simulator/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, quantity: qty, side }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Trade failed");
        return;
      }

      setPortfolio(json);
      await loadChart(symbol);
      await loadLB();
    } catch (err) {
      console.error("Trade error", err);
      alert("Trade failed due to network error");
    } finally {
      setBusy(false);
    }
  }

  // ---- Chart Data ----
  const chartData = useMemo(
    () => ({
      labels: series.map((p) => p.date),
      datasets: [
        {
          label: symbol,
          data: series.map((p) => p.close),
          borderColor: "#22c55e", // Tailwind green-500
          backgroundColor: "rgba(34,197,94,0.2)",
        },
      ],
    }),
    [series, symbol]
  );

  // ---- Render ----
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Investment Simulator</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart + Controls */}
        <div className="md:col-span-2 p-4 rounded-xl bg-ak-panel">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="px-3 py-2 rounded bg-black/40 border border-white/10"
              placeholder="Symbol e.g. AAPL"
            />
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              className="px-3 py-2 w-24 rounded bg-black/40 border border-white/10"
            />
            <button
              disabled={busy}
              onClick={() => trade("BUY")}
              className="px-3 py-2 bg-green-500/80 text-black rounded disabled:opacity-50"
            >
              Buy
            </button>
            <button
              disabled={busy}
              onClick={() => trade("SELL")}
              className="px-3 py-2 bg-red-500/80 text-black rounded disabled:opacity-50"
            >
              Sell
            </button>
            <button
              onClick={() => loadChart(symbol)}
              className="ml-auto px-3 py-2 rounded bg-ak-neon text-black"
            >
              Load Chart
            </button>
          </div>
          <Line data={chartData} />
        </div>

        {/* Account Panel */}
        <div className="p-4 rounded-xl bg-ak-panel">
          <h2 className="font-semibold mb-2">Account</h2>
          <div>
            Cash: $
            {portfolio?.account?.cash != null
              ? portfolio.account.cash.toFixed(2)
              : "—"}
          </div>
          <h3 className="mt-4 font-semibold">Holdings</h3>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Symbol</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Avg</th>
                </tr>
              </thead>
              <tbody>
                {(portfolio?.holdings || []).map((h: any) => (
                  <tr key={h.id} className="border-t border-white/10">
                    <td className="py-1">{h.symbol}</td>
                    <td className="text-right">{h.quantity}</td>
                    <td className="text-right">
                      ${h.avgPrice?.toFixed?.(2) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trades + Leaderboard */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trades */}
        <div className="p-4 rounded-xl bg-ak-panel">
          <h2 className="font-semibold mb-2">Recent Trades</h2>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Time</th>
                  <th>Side</th>
                  <th>Symbol</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {(portfolio?.trades || []).map((t: any) => (
                  <tr key={t.id} className="border-t border-white/10">
                    <td className="py-1">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>{t.side}</td>
                    <td>{t.symbol}</td>
                    <td className="text-right">{t.quantity}</td>
                    <td className="text-right">
                      ${t.price?.toFixed?.(2) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="p-4 rounded-xl bg-ak-panel">
          <h2 className="font-semibold mb-2">Leaderboard (Top 20)</h2>
          <ol className="space-y-1 list-decimal list-inside">
            {leader.map((r: any, i: number) => (
              <li key={i} className="flex justify-between">
                <span>{r.name ?? r.email ?? `User ${i + 1}`}</span>
                <span>${r.value?.toFixed?.(2) ?? "0.00"}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
