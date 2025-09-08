"use client";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Tooltip, Legend, CategoryScale } from "chart.js";
ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, Legend, CategoryScale);

type Series = { date: string; close: number }[];

export default function ToolsClient(){
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Pro Tools (AI & Quant)</h1>
      <p className="text-white/70">Correlation heatmaps, SMA backtests, and Monte Carlo forecasts. No keys needed—uses public/demo data or synthetic fallback.</p>

      <CorrelationTool />
      <SMABacktest />
      <MonteCarlo />
    </div>
  );
}

function CorrelationTool(){
  const [symbols, setSymbols] = useState("AAPL,MSFT,GOOGL,AMZN,SPY");
  const [matrix, setMatrix] = useState<number[][]|null>(null);
  const [syms, setSyms] = useState<string[]>([]);

  async function run(){
    const body = { symbols: symbols.split(",").map(s=>s.trim().toUpperCase()).filter(Boolean) };
    const res = await fetch("/api/tools/correlation", { method: "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    setMatrix(json.matrix); setSyms(json.symbols);
  }

  return (
    <div className="p-4 rounded-xl bg-ak-panel">
      <h2 className="font-semibold mb-2">Correlation Matrix</h2>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 rounded bg-black/40 border border-white/10" value={symbols} onChange={e=>setSymbols(e.target.value)} />
        <button onClick={run} className="px-3 py-2 rounded bg-ak-neon text-black">Compute</button>
      </div>
      {matrix && (
        <div className="mt-3 overflow-auto">
          <table className="text-sm">
            <thead><tr><th></th>{syms.map((s,i)=><th key={i} className="px-2 text-right">{s}</th>)}</tr></thead>
            <tbody>
              {matrix.map((row,r)=>(
                <tr key={r}>
                  <td className="pr-2">{syms[r]}</td>
                  {row.map((v,c)=>(<td key={c} className="px-2 text-right">{v.toFixed(2)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SMABacktest(){
  const [symbol, setSymbol] = useState("SPY");
  const [fast, setFast] = useState(50);
  const [slow, setSlow] = useState(200);
  const [data, setData] = useState<any>(null);

  async function run(){
    const res = await fetch("/api/tools/sma", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ symbol, fast, slow }) });
    const json = await res.json(); setData(json);
  }

  const chartData = useMemo(()=>{
    if(!data) return null;
    return {
      labels: data.prices.map((_:any,i:number)=>String(i)),
      datasets: [
        { label: `${symbol} Price`, data: data.prices },
        { label: `SMA ${fast}`, data: data.fast },
        { label: `SMA ${slow}`, data: data.slow },
      ]
    };
  }, [data, fast, slow, symbol]);

  return (
    <div className="p-4 rounded-xl bg-ak-panel">
      <h2 className="font-semibold mb-2">SMA Crossover Backtest</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} className="px-3 py-2 rounded bg-black/40 border border-white/10" />
        <input type="number" value={fast} onChange={e=>setFast(parseInt(e.target.value)||50)} className="w-28 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <input type="number" value={slow} onChange={e=>setSlow(parseInt(e.target.value)||200)} className="w-28 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <button onClick={run} className="px-3 py-2 rounded bg-ak-neon text-black">Run</button>
        {data && <div className="ml-auto text-sm text-white/80">
          Final: ${data.final?.toFixed?.(2)} | Buy&Hold: ${data.buyhold?.toFixed?.(2)}
        </div>}
      </div>
      {chartData && <div className="mt-3"><Line data={chartData} /></div>}
    </div>
  );
}

function MonteCarlo(){
  const [start, setStart] = useState(10000);
  const [mu, setMu] = useState(0.07);
  const [sigma, setSigma] = useState(0.15);
  const [years, setYears] = useState(10);
  const [out, setOut] = useState<any>(null);

  async function run(){
    const res = await fetch("/api/tools/montecarlo", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ start, mu, sigma, years }) });
    const json = await res.json(); setOut(json);
  }

  return (
    <div className="p-4 rounded-xl bg-ak-panel">
      <h2 className="font-semibold mb-2">Monte Carlo Forecast</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <input type="number" value={start} onChange={e=>setStart(parseFloat(e.target.value)||10000)} className="w-32 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <input type="number" step="0.01" value={mu} onChange={e=>setMu(parseFloat(e.target.value)||0.07)} className="w-24 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <input type="number" step="0.01" value={sigma} onChange={e=>setSigma(parseFloat(e.target.value)||0.15)} className="w-24 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <input type="number" value={years} onChange={e=>setYears(parseInt(e.target.value)||10)} className="w-24 px-3 py-2 rounded bg-black/40 border border-white/10" />
        <button onClick={run} className="px-3 py-2 rounded bg-ak-neon text-black">Simulate</button>
        {out && <div className="ml-auto text-sm text-white/80">
          P10: ${out.p10?.toFixed?.(0)} | Median: ${out.p50?.toFixed?.(0)} | P90: ${out.p90?.toFixed?.(0)}
        </div>}
      </div>
      <p className="text-xs text-white/60 mt-2">Assumes lognormal GBM with drift μ and volatility σ. Educational use only.</p>
    </div>
  );
}
