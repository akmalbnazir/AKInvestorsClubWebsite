export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchDaily, returns, correlation } from "lib/finance";

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a")||"AAPL";
  const b = searchParams.get("b")||"MSFT";
  const [sa, sb] = await Promise.all([fetchDaily(a), fetchDaily(b)]);
  const corr = correlation(returns(sa), returns(sb));
  return NextResponse.json({ a, b, correlation: corr });
}

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>({}));
  const symbols = (body.symbols||["AAPL","MSFT","GOOGL","AMZN","SPY"]).map((s:string)=>s.toUpperCase());
  const series = await Promise.all(symbols.map((s:string)=>fetchDaily(s)));
  const rets = series.map(returns);
  const n = symbols.length;
  const matrix = Array.from({length:n},()=>Array(n).fill(1));
  for(let i=0;i<n;i++){
    for(let j=i;j<n;j++){
      const c = correlation(rets[i], rets[j]);
      matrix[i][j]=matrix[j][i]=c;
    }
  }
  return NextResponse.json({ symbols, matrix });
}
