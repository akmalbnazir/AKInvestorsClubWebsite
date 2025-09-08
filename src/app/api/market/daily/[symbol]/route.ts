import { NextRequest, NextResponse } from "next/server";
import { fetchDaily } from "lib/finance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { symbol: string }}){
  try{
    const sym = decodeURIComponent(params.symbol).toUpperCase();
    const data = await fetchDaily(sym);
    return NextResponse.json({ symbol: sym, data });
  }catch(e:any){
    return NextResponse.json({ error: e.message || "failed" }, { status: 500 });
  }
}
