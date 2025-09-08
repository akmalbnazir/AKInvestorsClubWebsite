export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { requireAdmin } from "lib/auth";

export async function GET() {
  const items = await prisma.event.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, date, location, details } = await req.json();
  if (!title || !date || !location || !details) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const item = await prisma.event.create({
    data: { title: String(title), date: new Date(date), location: String(location), details: String(details) }
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = (new URL(req.url)).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
