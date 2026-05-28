/**
 * Bracket share encoding for static hosting (GitHub Pages).
 * Full prediction state is embedded in the URL hash — no backend required.
 */
(function (root, factory) {
  const BracketShare = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = BracketShare;
  } else {
    root.BracketShare = BracketShare;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  const SHARE_VERSION = 2;

  function encodePayload(payload) {
    const data = {
      v: SHARE_VERSION,
      name: payload.name || "",
      step: payload.step || "championship",
      gScores: payload.gScores || {},
      kScores: payload.kScores || {},
      kPicks: payload.kPicks || {},
      thirds: payload.thirds || []
    };
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  }

  function normalizePayload(raw) {
    if (!raw || typeof raw !== "object") return null;

    // Legacy Swipe Cup: { name, picks }
    if (raw.picks && !raw.kPicks && !raw.gScores) {
      return {
        name: raw.name || "",
        step: "championship",
        gScores: {},
        kScores: {},
        kPicks: raw.picks,
        thirds: [],
        legacyKnockoutOnly: true
      };
    }

    return {
      name: raw.name || "",
      step: raw.step || "championship",
      gScores: raw.gScores || {},
      kScores: raw.kScores || {},
      kPicks: raw.kPicks || {},
      thirds: raw.thirds || [],
      legacyKnockoutOnly: false
    };
  }

  function decodeShareCode(code) {
    if (!code || typeof code !== "string") {
      return { ok: false, error: "empty" };
    }
    try {
      let trimmed = code.trim();
      if (trimmed.includes("#share=")) {
        trimmed = trimmed.split("#share=")[1];
      }
      if (trimmed.includes("?share=")) {
        trimmed = trimmed.split("?share=")[1].split("&")[0];
      }
      const json = decodeURIComponent(escape(atob(trimmed)));
      const data = JSON.parse(json);
      const payload = normalizePayload(data);
      if (!payload) return { ok: false, error: "invalid" };
      return { ok: true, payload };
    } catch (err) {
      console.error("BracketShare decode failed:", err);
      return { ok: false, error: "parse" };
    }
  }

  function extractShareCodeFromPage() {
    const hash = window.location.hash || "";
    if (hash.startsWith("#share=")) {
      return hash.slice("#share=".length);
    }
    const params = new URLSearchParams(window.location.search);
    const q = params.get("share");
    if (q) return q;
    return null;
  }

  /** Build swipe.html#share=… relative to the current page (works on GitHub Pages). */
  function buildBracketViewUrl(payload, currentHref) {
    const encoded = encodePayload(payload);
    const url = new URL("swipe.html", currentHref || window.location.href);
    url.search = "";
    url.hash = `share=${encoded}`;
    return url.href;
  }

  function applyPayloadToState(state, payload) {
    if (!payload) return false;
    state.userName = payload.name || "";
    state.wizardStep = payload.step || "championship";
    state.groupMatchScores = payload.gScores || {};
    state.knockoutScores = payload.kScores || {};
    state.knockoutPicks = payload.kPicks || {};
    state.thirdPlaceQualifiers = payload.thirds || [];
    return true;
  }

  function payloadFromSimulatorState(state) {
    return {
      name: state.userName || "",
      step: state.wizardStep || "championship",
      gScores: state.groupMatchScores || {},
      kScores: state.knockoutScores || {},
      kPicks: state.knockoutPicks || {},
      thirds: state.thirdPlaceQualifiers || []
    };
  }

  return {
    SHARE_VERSION,
    encodePayload,
    decodeShareCode,
    extractShareCodeFromPage,
    buildBracketViewUrl,
    applyPayloadToState,
    payloadFromSimulatorState
  };
});
