"use client";
const sample = ["AAPL 212.34 +0.56%","NVDA 128.44 -0.12%","MSFT 431.10 +0.43%","AMZN 184.27 +0.04%","META 498.21 -0.09%","GOOGL 177.33 +0.06%"];
export default function TickerBar(){
  return (
    <div className="fixed top-0 left-0 right-0 z-20">
      <div className="h-7 overflow-hidden bg-black/50 backdrop-blur border-b border-emerald-400/20">
        <div className="whitespace-nowrap animate-scrollX will-change-transform">
          <span className="px-6 text-emerald-300/90">•</span>
          {sample.concat(sample).map((t,i)=>(
            <span key={i} className="px-6 text-xs">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
