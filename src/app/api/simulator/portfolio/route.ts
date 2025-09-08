export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "lib/db";
import { getSession } from "lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Always use the userId from session
  const userId = session.userId || session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Session missing userId" }, { status: 400 });
  }

  // Ensure the account exists
  const account = await prisma.account.upsert({
    where: { userId },
    update: {},
    create: { userId, cash: 100000 },
  });

  const holdings = await prisma.holding.findMany({
    where: { userId },
  });

  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    account,
    holdings,
    trades,
  });
}
