export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export async function GET() {
  const now = new Date();
  const items = await prisma.event.findMany({
    where: { date: { gte: new Date(now.getTime() - 24*3600*1000) } }, // include 1-day grace
    orderBy: { date: "asc" }
  });
  return NextResponse.json(items);
}
