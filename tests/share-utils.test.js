import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import BracketShare from "../share-utils.js";

const samplePayload = {
  name: "Itay",
  step: "championship",
  gScores: {
    A_0: { scoreA: "2", scoreB: "1" },
    B_2: { scoreA: "1", scoreB: "1" }
  },
  kScores: {
    104: { scoreA: "2", scoreB: "1", pWinner: "bra" }
  },
  kPicks: {
    73: "mex",
    104: "bra"
  },
  thirds: ["mex", "kor", "bra", "usa", "ger", "ned", "bel", "esp"]
};

describe("BracketShare.encodePayload / decodeShareCode", () => {
  it("round-trips a full prediction payload", () => {
    const encoded = BracketShare.encodePayload(samplePayload);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(20);

    const result = BracketShare.decodeShareCode(encoded);
    expect(result.ok).toBe(true);
    expect(result.payload.name).toBe("Itay");
    expect(result.payload.step).toBe("championship");
    expect(result.payload.gScores.A_0).toEqual({ scoreA: "2", scoreB: "1" });
    expect(result.payload.kPicks[104]).toBe("bra");
    expect(result.payload.thirds).toHaveLength(8);
    expect(result.payload.legacyKnockoutOnly).toBe(false);
  });

  it("embeds share format version 2 in encoded JSON", () => {
    const encoded = BracketShare.encodePayload(samplePayload);
    const json = decodeURIComponent(escape(Buffer.from(encoded, "base64").toString("utf8")));
    const data = JSON.parse(json);
    expect(data.v).toBe(BracketShare.SHARE_VERSION);
  });

  it("decodes legacy Swipe Cup links with picks only", () => {
    const legacy = Buffer.from(
      JSON.stringify({ name: "Alex", picks: { 101: "arg", 104: "arg" } }),
      "utf8"
    ).toString("base64");

    const result = BracketShare.decodeShareCode(legacy);
    expect(result.ok).toBe(true);
    expect(result.payload.name).toBe("Alex");
    expect(result.payload.kPicks[104]).toBe("arg");
    expect(result.payload.legacyKnockoutOnly).toBe(true);
    expect(result.payload.gScores).toEqual({});
  });

  it("strips #share= and ?share= prefixes from pasted URLs", () => {
    const encoded = BracketShare.encodePayload({ name: "Pat", gScores: {}, kPicks: { 104: "fra" } });
    const hashUrl = `https://example.github.io/repo/index.html#share=${encoded}`;
    const queryUrl = `https://example.github.io/repo/swipe.html?share=${encoded}&utm=1`;

    expect(BracketShare.decodeShareCode(hashUrl).payload.name).toBe("Pat");
    expect(BracketShare.decodeShareCode(queryUrl).payload.kPicks[104]).toBe("fra");
  });

  it("returns ok:false for empty or invalid codes", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(BracketShare.decodeShareCode("").ok).toBe(false);
    expect(BracketShare.decodeShareCode("not-valid-base64!!!").ok).toBe(false);
    expect(BracketShare.decodeShareCode(null).error).toBe("empty");
    errorSpy.mockRestore();
  });

  it("defaults missing fields when encoding", () => {
    const encoded = BracketShare.encodePayload({});
    const result = BracketShare.decodeShareCode(encoded);
    expect(result.ok).toBe(true);
    expect(result.payload.name).toBe("");
    expect(result.payload.step).toBe("championship");
    expect(result.payload.gScores).toEqual({});
  });
});

describe("BracketShare.applyPayloadToState / payloadFromSimulatorState", () => {
  it("maps payload fields onto simulator state", () => {
    const state = {
      userName: "",
      wizardStep: "welcome",
      groupMatchScores: {},
      knockoutScores: {},
      knockoutPicks: {},
      thirdPlaceQualifiers: []
    };

    const ok = BracketShare.applyPayloadToState(state, samplePayload);
    expect(ok).toBe(true);
    expect(state.userName).toBe("Itay");
    expect(state.wizardStep).toBe("championship");
    expect(state.groupMatchScores.A_0.scoreA).toBe("2");
    expect(state.knockoutPicks[104]).toBe("bra");
  });

  it("builds a share payload from simulator state", () => {
    const state = {
      userName: "Sam",
      wizardStep: "md2",
      groupMatchScores: { C_1: { scoreA: "0", scoreB: "0" } },
      knockoutScores: {},
      knockoutPicks: {},
      thirdPlaceQualifiers: ["bra"]
    };
    const payload = BracketShare.payloadFromSimulatorState(state);
    expect(payload.name).toBe("Sam");
    expect(payload.step).toBe("md2");
    expect(payload.gScores.C_1).toEqual({ scoreA: "0", scoreB: "0" });
    expect(payload.thirds).toEqual(["bra"]);
  });

  it("returns false when applying null payload", () => {
    expect(BracketShare.applyPayloadToState({}, null)).toBe(false);
  });
});

describe("BracketShare.buildBracketViewUrl", () => {
  it("points to swipe.html with share hash on GitHub Pages paths", () => {
    const url = BracketShare.buildBracketViewUrl(
      samplePayload,
      "https://user.github.io/world-cup-predictor/swipe.html"
    );
    expect(url).toMatch(/swipe\.html#share=/);
    expect(url.startsWith("https://user.github.io/world-cup-predictor/")).toBe(true);

    const roundtrip = BracketShare.decodeShareCode(url.split("#share=")[1]);
    expect(roundtrip.ok).toBe(true);
    expect(roundtrip.payload.name).toBe("Itay");
  });
});

describe("BracketShare.extractShareCodeFromPage", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    global.window = {
      location: {
        hash: "",
        search: "",
        href: "https://example.com/index.html"
      }
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("reads share code from location hash", () => {
    global.window.location.hash = "#share=abc123";
    expect(BracketShare.extractShareCodeFromPage()).toBe("abc123");
  });

  it("reads share code from query string", () => {
    global.window.location.search = "?share=xyz789";
    expect(BracketShare.extractShareCodeFromPage()).toBe("xyz789");
  });

  it("returns null when no share param is present", () => {
    expect(BracketShare.extractShareCodeFromPage()).toBeNull();
  });
});
