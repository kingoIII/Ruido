import { describe, expect, it } from "vitest";
import { normalizeTags } from "@/lib/tags";

describe("normalizeTags", () => {
  it("deduplicates and normalizes input", () => {
    const input = [" Kick ", "kick", "Snare!", "snare", "PAD" ];
    const result = normalizeTags(input);
    expect(result).toContain("kick");
    expect(result).toContain("snare");
    expect(result).toContain("pad");
    expect(result.length).toBe(3);
  });
});
