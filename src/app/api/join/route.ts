export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/db';
export async function POST(req: NextRequest){
  const {name,email,grade,interest}=await req.json();
  if(!name||!email) return NextResponse.json({error:'Invalid'},{status:400});
  await prisma.joinRequest.create({data:{name,email,grade,interest}});
  return NextResponse.json({ok:true});
}
