import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clampLikes(value: number) {
  return value < 0 ? 0 : value;
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profileId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const track = await prisma.track.findUnique({ where: { id: params.id } });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const compositeKey = { profileId: session.user.profileId, trackId: params.id };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({ where: { profileId_trackId: compositeKey } });
      if (existing) {
        await tx.like.delete({ where: { profileId_trackId: compositeKey } });
        const updated = await tx.track.update({
          where: { id: params.id },
          data: { likes: { decrement: 1 } },
          select: { likes: true },
        });
        return { liked: false as const, count: clampLikes(updated.likes) };
      }

      await tx.like.create({ data: compositeKey });
      const updated = await tx.track.update({
        where: { id: params.id },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });
      return { liked: true as const, count: clampLikes(updated.likes) };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to toggle like", error);
    return NextResponse.json({ error: "Unable to update like" }, { status: 500 });
  }
}
