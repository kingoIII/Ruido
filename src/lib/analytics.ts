import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { env } from "@/lib/env";

export const PLAY_COOKIE_PREFIX = "track_play_";

export function getClientIpFromHeaders(headers: Headers) {
  const header =
    headers.get("x-forwarded-for") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip");
  if (!header) return "unknown";
  return header.split(",")[0]?.trim() || "unknown";
}

export function buildFingerprint(ip: string, trackId: string) {
  return `${ip}|${trackId}`;
}

function signFingerprint(fingerprint: string, timestamp: string) {
  return createHmac("sha256", env.NEXTAUTH_SECRET).update(`${fingerprint}.${timestamp}`).digest("hex");
}

export function signPlayCookieValue(fingerprint: string, timestamp: number) {
  const value = String(timestamp);
  const signature = signFingerprint(fingerprint, value);
  return `${value}.${signature}`;
}

export function parsePlayCookieTimestamp(fingerprint: string, value: string) {
  const [timestamp, signature] = value.split(".");
  if (!timestamp || !signature) {
    return null;
  }

  try {
    const expected = signFingerprint(fingerprint, timestamp);
    if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }

  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}
