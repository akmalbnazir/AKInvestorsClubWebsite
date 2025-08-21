export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  console.log("📥 Incoming login request:", { email, password }); // DEBUG

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const domain = process.env.ALLOWED_DOMAIN || "";
  const adminEmails = [process.env.ADMIN1_EMAIL, process.env.ADMIN2_EMAIL, process.env.ADMIN3_EMAIL].filter(Boolean) as string[];
  const isWhitelistedAdmin = adminEmails.includes(email);
  if (domain && !email.endsWith(domain) && !isWhitelistedAdmin) {
    console.log("❌ Email rejected (wrong domain):", email);
    return NextResponse.json({ error: "School email required" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("🔍 User found in DB:", user ? { email: user.email, role: user.role, approved: user.approved } : "No user");

  if (!user || !user.approved) {
    console.log("❌ User not approved or missing");
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  console.log("🔑 Comparing password with hash...");
  console.log("   ➡️ Plain password:", password);
  console.log("   ➡️ Stored hash:", user.passwordHash);

  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log("   ➡️ Compare result:", ok);

  if (!ok) {
    console.log("❌ Invalid credentials for:", email);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ttlDays = parseInt(process.env.SESSION_TTL_DAYS || "7");
  const ses = await prisma.session.create({
    data: { userId: user.id, expiresAt: new Date(Date.now() + ttlDays * 24 * 3600 * 1000) }
  });
  console.log("✅ Session created:", ses.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sid", ses.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
