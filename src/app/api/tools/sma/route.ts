export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { fetchDaily } from "lib/finance";
import { getSession } from "lib/auth";

function sma(arr:number[], n:number){
  const out:number[]=[]; let s=0;
  for(let i=0;i<arr.length;i++){ s+=arr[i]; if(i>=n) s-=arr[i-n]; out.push(i>=n-1? s/n : NaN); }
  return out;
}

export async function POST(req: NextRequest){
  const s = await getSession();
  if(!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { symbol="SPY", fast=50, slow=200 } = await req.json();
  const series = await fetchDaily(symbol);
  const prices = series.map(p=>p.close);
  const f = sma(prices, fast), sl = sma(prices, slow);
  let pos = 0; let cash=10000; let shares=0;
  for(let i=0;i<prices.length;i++){
    if(isFinite(f[i]) && isFinite(sl[i])){
      if(pos===0 && f[i]>sl[i]){ // buy
        shares = cash / prices[i]; cash = 0; pos=1;
      } else if(pos===1 && f[i]<sl[i]){ // sell
        cash = shares * prices[i]; shares=0; pos=0;
      }
    }
  }
  const final = cash + shares*prices[prices.length-1];
  const buyhold = 10000 * (prices[prices.length-1]/prices[0]);
  return NextResponse.json({ final, buyhold, prices, fast:f, slow:sl });
}
