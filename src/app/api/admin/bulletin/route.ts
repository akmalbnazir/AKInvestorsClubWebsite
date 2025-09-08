export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { requireAdmin } from "lib/auth";


export async function GET() {
  const items = await prisma.bulletin.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });
  const item = await prisma.bulletin.create({ data: { message: message.trim(), authorId: admin.id } });
  return NextResponse.json(item);
}
