export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { getSession, requireAdmin } from "lib/auth";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true } },
      comments: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true, email: true, role: true } } }
      }
    }
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, body } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const p = await prisma.post.create({
    data: {
      title: title.trim(),
      content: body.trim(),
      authorId: s.user.id
    }
  });
  return NextResponse.json(p);
}
