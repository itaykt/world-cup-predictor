import { describe, it, expect } from "vitest";
import SupabaseBracket from "../supabase-utils.js";

describe("SupabaseBracket.normalizeNickname", () => {
  it("lowercases and trims", () => {
    expect(SupabaseBracket.normalizeNickname("  ItayWC26  ")).toBe("itaywc26");
  });

  it("replaces spaces with underscores", () => {
    expect(SupabaseBracket.normalizeNickname("Fan Bracket")).toBe("fan_bracket");
  });

  it("caps length at 20", () => {
    expect(SupabaseBracket.normalizeNickname("abcdefghijklmnopqrstuvwxyz")).toHaveLength(20);
  });
});

describe("SupabaseBracket.isValidNickname / isValidPin", () => {
  it("accepts valid nickname and pin", () => {
    expect(SupabaseBracket.isValidNickname("itaywc26")).toBe(true);
    expect(SupabaseBracket.isValidPin("1234")).toBe(true);
  });

  it("rejects short nickname and non-numeric pin", () => {
    expect(SupabaseBracket.isValidNickname("a")).toBe(false);
    expect(SupabaseBracket.isValidPin("12ab")).toBe(false);
  });
});

describe("SupabaseBracket.PUBLIC_PIN_HASH", () => {
  it("matches hash of wc2026_public", async () => {
    const h = await SupabaseBracket.hashPin("wc2026_public");
    expect(SupabaseBracket.PUBLIC_PIN_HASH).toBe(h);
  });
});

describe("SupabaseBracket.hashPin", () => {
  it("returns stable SHA-256 hex", async () => {
    const a = await SupabaseBracket.hashPin("1234");
    const b = await SupabaseBracket.hashPin("1234");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("differs for different pins", async () => {
    const a = await SupabaseBracket.hashPin("1234");
    const b = await SupabaseBracket.hashPin("5678");
    expect(a).not.toBe(b);
  });
});

describe("SupabaseBracket.championFromPayload", () => {
  it("formats champion with team db", () => {
    const teamsDb = { bra: { name: "Brazil", flag: "🇧🇷" } };
    const label = SupabaseBracket.championFromPayload({ kPicks: { 104: "bra" } }, teamsDb);
    expect(label).toBe("🇧🇷 Brazil");
  });
});

describe("SupabaseBracket.aggregateChampionCounts", () => {
  it("groups brackets by champion, adds percent, sorts by count", () => {
    const rows = [
      { champion: "🇧🇷 Brazil" },
      { champion: "🇦🇷 Argentina" },
      { champion: "🇧🇷 Brazil" },
      { champion: "🇧🇷 Brazil" },
      { champion: "" }
    ];
    expect(SupabaseBracket.aggregateChampionCounts(rows)).toEqual([
      { champion: "🇧🇷 Brazil", count: 3, percent: 60 },
      { champion: "—", count: 1, percent: 20 },
      { champion: "🇦🇷 Argentina", count: 1, percent: 20 }
    ]);
  });

  it("returns at most the top 6 champions", () => {
    const rows = [
      { champion: "A" },
      { champion: "B" },
      { champion: "C" },
      { champion: "D" },
      { champion: "E" },
      { champion: "F" },
      { champion: "G" },
      { champion: "H" },
      { champion: "A" },
      { champion: "A" }
    ];
    const top = SupabaseBracket.aggregateChampionCounts(rows);
    expect(top).toHaveLength(6);
    expect(top[0]).toEqual({ champion: "A", count: 3, percent: 30 });
    expect(top.map((r) => r.champion)).not.toContain("H");
  });
});
