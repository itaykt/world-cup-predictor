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
