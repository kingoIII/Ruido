import { describe, expect, it } from "vitest";
import {
  PLAY_COOKIE_PREFIX,
  buildFingerprint,
  getClientIpFromHeaders,
  parsePlayCookieTimestamp,
  signPlayCookieValue,
} from "@/lib/analytics";

describe("analytics helpers", () => {
  it("extracts client ip from forwarded headers", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" });
    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.1");
  });

  it("signs and verifies play cookie values", () => {
    const fingerprint = buildFingerprint("203.0.113.1", "track-1");
    const value = signPlayCookieValue(fingerprint, 1000);
    expect(parsePlayCookieTimestamp(fingerprint, value)).toBe(1000);
  });

  it("rejects tampered signatures", () => {
    const fingerprint = buildFingerprint("203.0.113.1", "track-1");
    const value = signPlayCookieValue(fingerprint, 1000);
    const [timestamp] = value.split(".");
    expect(parsePlayCookieTimestamp(fingerprint, `${timestamp}.deadbeef`)).toBeNull();
  });

  it("exposes cookie prefix", () => {
    expect(PLAY_COOKIE_PREFIX).toBe("track_play_");
  });
});
