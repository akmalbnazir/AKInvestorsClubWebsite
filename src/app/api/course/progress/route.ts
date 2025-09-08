export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { getSession } from "lib/auth";

export async function GET(){
  const s = await getSession();
  if(!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.progress.findMany({ where: { userId: s.userId } });
  return NextResponse.json({ progress: items });
}

export async function POST(req: NextRequest){
  const s = await getSession();
  if(!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { key, status, score } = await req.json();
  if(!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const rec = await prisma.progress.upsert({
    where: { userId_key: { userId: s.userId, key } } as any,
    create: { userId: s.userId, key, status: status||"completed", score: score ?? null },
    update: { status: status||"completed", score: score ?? null }
  });
  return NextResponse.json({ ok: true, progress: rec });
}
