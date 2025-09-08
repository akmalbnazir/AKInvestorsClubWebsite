export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/db";
import bcrypt from "bcryptjs";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }){
  const jr = await prisma.joinRequest.findUnique({ where: { id: params.id } });
  if (!jr) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const temp = Math.random().toString(36).slice(2, 10) + "!" ;
  const hash = await bcrypt.hash(temp, 10);
  const user = await prisma.user.upsert({
    where: { email: jr.email },
    update: { approved: true, name: jr.name, passwordHash: hash },
    create: { 
      email: jr.email, 
      name: jr.name, 
      approved: true, 
      passwordHash: hash, 
      role: "MEMBER",
      account: { create: {} }, 
    }
});
  await prisma.joinRequest.update({ where: { id: jr.id }, data: { status: "approved" } });
  return NextResponse.json({ ok: true, tempPassword: temp, email: user.email, name: user.name });
}
