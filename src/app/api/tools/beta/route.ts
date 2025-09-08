export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchDaily, returns, beta } from "lib/finance";
export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")||"AAPL";
  const market = searchParams.get("market")||"SPY";
  const [s, m] = await Promise.all([fetchDaily(symbol), fetchDaily(market)]);
  const b = beta(returns(s), returns(m));
  return NextResponse.json({ symbol, market, beta: b });
}
