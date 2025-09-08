// src/app/api/admin/users/reset-password/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Optional: set in .env.local to skip auth in dev only
const ALLOW_DEV_BYPASS =
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_ADMIN_RESET_IN_DEV === "true";

// Roles allowed to perform resets
const ADMIN_ROLES = new Set(["ADMIN", "PRESIDENT", "EXEC_TECH", "EXEC_OUTREACH"]);

function genTempPassword(len = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let out = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
  return out;
}

/**
 * Find the current user via Session cookie without assuming a cookie name.
 * We iterate all cookies and try matching their values to Session.id.
 */
async function getCurrentUserFromCookies() {
  const jar = cookies();
  const all = jar.getAll();
  if (!all.length) return null;

  const now = new Date();

  // Try each cookie value as a potential Session.id
  for (const c of all) {
    const val = c.value?.trim();
    if (!val) continue;

    // Sessions.id is a cuid() string in your schema
    const sess = await prisma.session.findUnique({
      where: { id: val },
      select: { id: true, userId: true, expiresAt: true },
    });
    if (!sess) continue;
    if (sess.expiresAt <= now) continue;

    const user = await prisma.user.findUnique({
      where: { id: sess.userId },
      select: { id: true, email: true, role: true, approved: true },
    });
    if (!user) continue;

    return user;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    // ----- AuthZ -----
    let me = await getCurrentUserFromCookies();
    if (!me && ALLOW_DEV_BYPASS) {
      // Dev-only bypass for local testing
      me = { id: "dev", email: "dev@example.com", role: "ADMIN", approved: true } as any;
    }
    if (!me) return new NextResponse("Unauthorized (no session)", { status: 401 });
    if (!ADMIN_ROLES.has(me.role)) return new NextResponse("Forbidden", { status: 403 });

    // ----- Input -----
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body?.email;
    const tempPassword: string | undefined = body?.tempPassword;

    if (!email || typeof email !== "string") {
      return new NextResponse("Missing 'email'", { status: 400 });
    }

    // ----- Generate / use provided temp password -----
    const plain =
      typeof tempPassword === "string" && tempPassword.trim().length >= 8
        ? tempPassword.trim()
        : genTempPassword(12);

    const passwordHash = await bcrypt.hash(plain, 10);

    // ----- Update user & invalidate sessions -----
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash, approved: true },
      select: { id: true, email: true },
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ email: user.email, tempPassword: plain });
  } catch (e: any) {
    // Normalize Prisma "not found" to 404
    const msg = e?.message || "Internal error";
    if (msg.includes("Record to update not found")) {
      return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse(msg, { status: 500 });
  }
}
