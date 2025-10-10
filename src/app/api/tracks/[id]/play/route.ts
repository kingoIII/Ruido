import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const DEBOUNCE_MS = 30_000;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const trackId = params.id;
  const cookieStore = cookies();
  const cookieName = `track_play_${trackId}`;
  const existing = cookieStore.get(cookieName);
  const now = Date.now();

  if (existing) {
    const timestamp = Number(existing.value);
    if (!Number.isNaN(timestamp) && now - timestamp < DEBOUNCE_MS) {
      return new NextResponse(null, { status: 202 });
    }
  }

  await prisma.track.update({
    where: { id: trackId },
    data: { plays: { increment: 1 } },
  });

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set({
    name: cookieName,
    value: String(now),
    httpOnly: true,
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  return response;
}
