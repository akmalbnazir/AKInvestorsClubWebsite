export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { requireAdmin } from "lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true, email: true, role: true } } }
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content: body.trim(),
      postId: params.id,
      authorId: admin.id
    }
  });
  return NextResponse.json(comment);
}
