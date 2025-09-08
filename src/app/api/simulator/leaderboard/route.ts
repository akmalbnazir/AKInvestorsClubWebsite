import { NextResponse } from "next/server";
import { prisma } from "lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { account: true, holdings: true },
    });

    const leaderboard = users.map((u) => {
      const cash = u.account?.cash ?? 0;
      const holdingsValue = (u.holdings || []).reduce(
        (sum, h) => sum + h.quantity * h.avgPrice,
        0
      );
      return {
        name: u.name ?? u.email,
        value: cash + holdingsValue,
      };
    });

    leaderboard.sort((a, b) => b.value - a.value);

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error", err);
    return NextResponse.json({ leaderboard: [] });
  }
}
