import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  PLAY_COOKIE_PREFIX,
  buildFingerprint,
  getClientIpFromHeaders,
  parsePlayCookieTimestamp,
  signPlayCookieValue,
} from "@/lib/analytics";

const DEBOUNCE_MS = 30_000;
const COOKIE_TTL_SECONDS = 60 * 60;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const trackId = params.id;
  const cookieStore = cookies();
  const cookieName = `${PLAY_COOKIE_PREFIX}${trackId}`;
  const existing = cookieStore.get(cookieName);
  const now = Date.now();
  const clientIp = getClientIpFromHeaders(request.headers);
  const fingerprint = buildFingerprint(clientIp, trackId);

  if (existing) {
    const timestamp = parsePlayCookieTimestamp(fingerprint, existing.value);
    if (timestamp !== null && now - timestamp < DEBOUNCE_MS) {
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
    value: signPlayCookieValue(fingerprint, now),
    httpOnly: true,
    maxAge: COOKIE_TTL_SECONDS,
    sameSite: "lax",
  });

  return response;
}
