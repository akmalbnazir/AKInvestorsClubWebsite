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
