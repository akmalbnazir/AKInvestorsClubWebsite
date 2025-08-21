"use client";
import UltraCard from "components/ui/UltraCard";
import { useState } from "react";
function compound(P:number, r:number, n:number, t:number){ return P*Math.pow(1+r/n,n*t); }
export default function Calculators(){
  const [P,setP]=useState(1000); const [r,setR]=useState(0.08); const [n,setN]=useState(12); const [t,setT]=useState(10);
  const FV = compound(P,r,n,t);
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <UltraCard className="text-center">
        <h2 className="text-2xl font-bold mb-3">Compound Interest Calculator</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input className="rounded-lg bg-black/40 p-3" value={P} onChange={e=>setP(parseFloat(e.target.value))} placeholder="Principal"/>
          <input className="rounded-lg bg-black/40 p-3" value={r} onChange={e=>setR(parseFloat(e.target.value))} placeholder="Rate (0.08)"/>
          <input className="rounded-lg bg-black/40 p-3" value={n} onChange={e=>setN(parseFloat(e.target.value))} placeholder="Compounds/yr"/>
          <input className="rounded-lg bg-black/40 p-3" value={t} onChange={e=>setT(parseFloat(e.target.value))} placeholder="Years"/>
        </div>
        <div className="mt-4 text-lg">Future Value: <span className="font-semibold">${{value: FV.toFixed(2)}.value}</span></div>
      </UltraCard>
      <UltraCard className="text-center">
        <h2 className="text-2xl font-bold mb-3">Correlation & Beta</h2>
        <CorrelationTool/>
      </UltraCard>
    </div>
  );
}

function CorrelationTool(){
  const [a,setA]=useState("AAPL"); const [b,setB]=useState("MSFT"); const [corr,setCorr]=useState<number|null>(null);
  const [s,setS]=useState("AAPL"); const [beta,setBeta]=useState<number|null>(null);
  const go=async()=>{ const r=await fetch(`/api/tools/correlation?a=${a}&b=${b}`).then(r=>r.json()); setCorr(r.correlation); };
  const gob=async()=>{ const r=await fetch(`/api/tools/beta?symbol=${s}&market=SPY`).then(r=>r.json()); setBeta(r.beta); };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-ak-sub mb-1">Correlation (Pearson)</div>
        <div className="flex gap-2">
          <input className="rounded-lg bg-black/40 p-3 flex-1" value={a} onChange={e=>setA(e.target.value.toUpperCase())}/>
          <input className="rounded-lg bg-black/40 p-3 flex-1" value={b} onChange={e=>setB(e.target.value.toUpperCase())}/>
          <button onClick={go} className="px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">Compare</button>
        </div>
        {corr!==null && <div className="mt-2">Correlation: <b>{corr.toFixed(3)}</b></div>}
      </div>
      <div>
        <div className="text-sm text-ak-sub mb-1">Beta vs SPY</div>
        <div className="flex gap-2">
          <input className="rounded-lg bg-black/40 p-3 flex-1" value={s} onChange={e=>setS(e.target.value.toUpperCase())}/>
          <button onClick={gob} className="px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">Compute</button>
        </div>
        {beta!==null && <div className="mt-2">Beta: <b>{beta.toFixed(3)}</b></div>}
      </div>
    </div>
  );
}
