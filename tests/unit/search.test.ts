import { describe, expect, it } from "vitest";
import { buildSearchSql, buildTrackOrderBy, buildTrackWhere, getPagination } from "@/lib/search";

describe("buildTrackWhere", () => {
  it("includes license and tag filters", () => {
    const where = buildTrackWhere({ tag: "drums", license: "cc_by" });
    expect(where).toMatchObject({
      license: "cc_by",
      tagJoins: { some: { tag: { name: "drums" } } },
    });
  });

  it("can include fallback text search", () => {
    const withText = buildTrackWhere({ query: "kick" });
    expect(withText.OR).toBeDefined();

    const withoutText = buildTrackWhere({ query: "kick" }, { includeTextSearch: false });
    expect(withoutText.OR).toBeUndefined();
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

describe("buildSearchSql", () => {
  it("produces a sql fragment with plainto_tsquery", () => {
    const fragment = buildSearchSql("kick drum");
    expect(fragment?.sql).toContain("plainto_tsquery");
    expect(fragment?.values).toContain("kick drum");
  });
});

describe("getPagination", () => {
  it("guards against invalid pages", () => {
    expect(getPagination(-5)).toEqual({ take: 24, skip: 0 });
  });
});
