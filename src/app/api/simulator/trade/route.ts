export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { getSession } from "lib/auth";
import { fetchDaily } from "lib/finance";

export async function POST(req: NextRequest){
  const s = await getSession();
  if(!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { symbol, quantity, side } = await req.json();
  const sym = String(symbol||"").toUpperCase().trim();
  const qty = Math.max(1, Math.floor(Number(quantity)||0));
  const sd = String(side||"BUY").toUpperCase() === "SELL" ? "SELL":"BUY";
  if(!sym) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  // price = last close from daily series
  const series = await fetchDaily(sym);
  if(!series.length) return NextResponse.json({ error: "No price data" }, { status: 400 });
  const last = series[series.length-1].close;
  let acct = await prisma.account.findUnique({ where: { userId: s.userId } as any });
  if(!acct){ acct = await prisma.account.create({ data: { userId: s.userId, cash: 100000 } }); }

  if(sd==="BUY"){
    const cost = last * qty;
    if(acct.cash < cost) return NextResponse.json({ error: "insufficient cash" }, { status: 400 });
    // upsert holding
    const existing = await prisma.holding.findUnique({ where: { userId_symbol: { userId: s.userId, symbol: sym } } as any });
    if(existing){
      const newQty = existing.quantity + qty;
      const newAvg = (existing.avgPrice*existing.quantity + last*qty) / newQty;
      await prisma.holding.update({ where: { id: existing.id }, data: { quantity: newQty, avgPrice: newAvg } });
    }else{
      await prisma.holding.create({ data: { userId: s.userId, symbol: sym, quantity: qty, avgPrice: last } });
    }
    await prisma.account.update({ where: { userId: s.userId } as any, data: { cash: acct.cash - last*qty } });
    await prisma.trade.create({ data: { userId: s.userId, symbol: sym, quantity: qty, price: last, side: "BUY" } });
  }else{
    const existing = await prisma.holding.findUnique({ where: { userId_symbol: { userId: s.userId, symbol: sym } } as any });
    if(!existing || existing.quantity < qty) return NextResponse.json({ error: "insufficient shares" }, { status: 400 });
    const newQty = existing.quantity - qty;
    if(newQty===0){
      await prisma.holding.delete({ where: { id: existing.id } });
    }else{
      await prisma.holding.update({ where: { id: existing.id }, data: { quantity: newQty } });
    }
    await prisma.account.update({ where: { userId: s.userId } as any, data: { cash: acct.cash + last*qty } });
    await prisma.trade.create({ data: { userId: s.userId, symbol: sym, quantity: qty, price: last, side: "SELL" } });
  }

  const holdings = await prisma.holding.findMany({ where: { userId: s.userId } });
  const trades = await prisma.trade.findMany({ where: { userId: s.userId }, orderBy: { createdAt: "desc" } });
  const account = await prisma.account.findUnique({ where: { userId: s.userId } as any });
  return NextResponse.json({ ok: true, account, holdings, trades, price: last });
}
