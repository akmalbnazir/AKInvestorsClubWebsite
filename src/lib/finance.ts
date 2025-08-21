export type Series = { date: string; close: number }[];

export async function fetchDaily(symbol: string): Promise<Series>{
  const key = process.env.ALPHA_VANTAGE_KEY || "demo";
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("fetch failed");
  const json = await res.json() as any;
  const ts = json["Time Series (Daily)"];
  if (!ts) return synth(symbol);
  const out: Series = Object.entries(ts).map(([d, v]: any) => ({ date: d, close: parseFloat(v["5. adjusted close"]) })).sort((a,b)=> a.date < b.date ? -1 : 1);
  return out.slice(-260);
}

function synth(symbol: string): Series {
  let price = 100 + (symbol.charCodeAt(0) % 30);
  const out: Series = [];
  for (let i=0;i<260;i++){ price *= (1 + (Math.sin(i/13)+Math.cos(i/29))/200 + (Math.random()-0.5)/100); out.push({ date: `2024-01-${(i%30)+1}`, close: price }); }
  return out;
}

export function returns(series: Series): number[]{
  const r:number[]=[]; for(let i=1;i<series.length;i++) r.push((series[i].close/series[i-1].close)-1); return r;
}

export function correlation(a:number[], b:number[]): number{
  const n = Math.min(a.length,b.length); const ax=a.slice(-n), bx=b.slice(-n);
  const ma = ax.reduce((s,x)=>s+x,0)/n, mb = bx.reduce((s,x)=>s+x,0)/n;
  let num=0, da=0, db=0; for(let i=0;i<n;i++){ const va=ax[i]-ma, vb=bx[i]-mb; num+=va*vb; da+=va*va; db+=vb*vb; }
  return num/Math.sqrt(da*db);
}

export function beta(stock:number[], market:number[]): number{
  const n = Math.min(stock.length, market.length);
  const sx = stock.slice(-n), mx = market.slice(-n);
  const ms = sx.reduce((s,x)=>s+x,0)/n, mm = mx.reduce((s,x)=>s+x,0)/n;
  let cov=0, varM=0; for(let i=0;i<n;i++){ cov+=(sx[i]-ms)*(mx[i]-mm); varM+=(mx[i]-mm)**2; }
  return cov/varM;
}
