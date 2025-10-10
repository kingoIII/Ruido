import { describe, expect, it } from "vitest";
import { buildTrackWhere, buildTrackOrderBy } from "@/lib/search";

describe("buildTrackWhere", () => {
  it("includes query filters", () => {
    const where = buildTrackWhere({ query: "kick", license: "cc_by", tag: "drums" });
    expect(where.license).toBe("cc_by");
    expect(where.tagJoins).toBeDefined();
    expect(where.OR).toBeDefined();
  });
});

describe("buildTrackOrderBy", () => {
  it("sorts by likes", () => {
    const order = buildTrackOrderBy("likes");
    expect(order).toEqual({ likes: "desc" });
  });

  it("defaults to newest", () => {
    const order = buildTrackOrderBy(undefined);
    expect(order).toEqual({ createdAt: "desc" });
  });
});
