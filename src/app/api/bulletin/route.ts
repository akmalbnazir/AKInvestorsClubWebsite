export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export async function GET() {
  const items = await prisma.bulletin.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return NextResponse.json(items);
}
