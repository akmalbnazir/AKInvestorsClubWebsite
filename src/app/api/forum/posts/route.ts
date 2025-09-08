export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import { getSession } from "lib/auth";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // In your schema, the relation on Post is named `User`, not `author`
        User: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { comments: true } },
        comments: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            // Comment relation really is named `author` in your schema
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    // Normalize key so the client can keep using `post.author`
    const shaped = posts.map(({ User, ...rest }) => ({
      ...rest,
      author: User,
    }));

    return NextResponse.json(shaped);
  } catch (err) {
    console.error("GET /api/forum/posts error", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, body } = await req.json();
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Your session shape exposes user id on either s.user.id or s.userId
    const authorId: string | undefined = (s as any).user?.id ?? (s as any).userId;
    if (!authorId) {
      return NextResponse.json({ error: "Session missing user id" }, { status: 400 });
    }

    const p = await prisma.post.create({
      data: {
        title: title.trim(),
        content: body.trim(),
        authorId,
      },
    });

    // Optionally join author for immediate client display consistency
    const withAuthor = await prisma.post.findUnique({
      where: { id: p.id },
      include: { User: { select: { id: true, name: true, email: true, role: true } } },
    });

    // Shape to { ...post, author: User }
    const shaped =
      withAuthor && "User" in withAuthor
        ? { ...(withAuthor as any), author: (withAuthor as any).User, User: undefined }
        : p;

    return NextResponse.json(shaped);
  } catch (err) {
    console.error("POST /api/forum/posts error", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
