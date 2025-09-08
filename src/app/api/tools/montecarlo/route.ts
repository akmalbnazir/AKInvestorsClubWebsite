export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth";

export async function POST(req: NextRequest){
  const s = await getSession();
  if(!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { start, mu=0.07, sigma=0.15, years=10, trials=1000, rebal=12 } = await req.json();
  const startVal = Math.max(1, Number(start||10000));
  const dt = 1/12;
  const T = Math.max(1, Math.floor(years*12));
  const out:number[] = [];
  for(let k=0;k<trials;k++){
    let v = startVal;
    for(let t=0;t<T;t++){
      const z = (Math.random()*2-1) + (Math.random()*2-1); // approx N(0,1)
      v *= Math.exp((mu - 0.5*sigma*sigma)*dt + sigma*Math.sqrt(dt)*z);
    }
    out.push(v);
  }
  out.sort((a,b)=>a-b);
  const p50 = out[Math.floor(0.5*out.length)];
  const p10 = out[Math.floor(0.1*out.length)];
  const p90 = out[Math.floor(0.9*out.length)];
  return NextResponse.json({ p10, p50, p90, final: out.slice(0,200) });
}
