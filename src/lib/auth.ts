// src/app/lib/auth.ts
"use server"; // ensures this file is only used server-side

import { cookies } from "next/headers";
import { prisma } from "lib/db";

export async function getSession() {
  const sid = cookies().get("sid")?.value;
  if (!sid) return null;

  const s = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true },
  });

  if (!s || s.expiresAt < new Date()) return null;
  return s;
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) return null;

  const role = s.user.role;
  if (["PRESIDENT", "EXEC_TECH", "EXEC_OUTREACH"].includes(role)) {
    return s.user;
  }
  return null;
}
