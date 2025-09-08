export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "lib/db";
export async function GET(){ const items = await prisma.joinRequest.findMany({ orderBy: { createdAt: "desc" } }); return NextResponse.json(items); }
