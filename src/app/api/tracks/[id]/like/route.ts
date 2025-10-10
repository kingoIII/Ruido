import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profileId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const compositeKey = { profileId: session.user.profileId, trackId: params.id };
  const existing = await prisma.like.findUnique({ where: { profileId_trackId: compositeKey } });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { profileId_trackId: compositeKey } }),
      prisma.track.update({ where: { id: params.id, likes: { gt: 0 } }, data: { likes: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.like.create({ data: compositeKey }),
    prisma.track.update({ where: { id: params.id }, data: { likes: { increment: 1 } } }),
  ]);

  return NextResponse.json({ liked: true });
}
