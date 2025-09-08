export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { prisma } from "lib/db";

export async function POST() {
  const sid = cookies().get("sid")?.value;
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(()=>{});
    cookies().delete("sid");
  }
  return new Response("ok");
}
