import { describe, expect, it } from "vitest";
import { isLicenseAllowed } from "@/lib/tags";

describe("isLicenseAllowed", () => {
  it("accepts supported licenses", () => {
    expect(isLicenseAllowed("cc_by"));
    expect(isLicenseAllowed("cc0")).toBe(true);
  });

  it("rejects unsupported licenses", () => {
    expect(isLicenseAllowed("proprietary")).toBe(false);
  });
});
