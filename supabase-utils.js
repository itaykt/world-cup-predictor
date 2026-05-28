/**
 * Supabase bracket submissions (nickname + 4-digit PIN).
 * Requires @supabase/supabase-js via CDN before this script.
 */
(function (root, factory) {
  const SupabaseBracket = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = SupabaseBracket;
  } else {
    root.SupabaseBracket = SupabaseBracket;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  // TODO: replace with your project values from Supabase → Project Settings → API
  const SUPABASE_URL = "https://uylamonpjwocaottuaeg.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5bGFtb25wandvY2FvdHR1YWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzU5NTcsImV4cCI6MjA5NTU1MTk1N30.-kAaY7Z8r6Wv2JOUXF6wO4iu59n45xLzPgpUESpXWsI";
  const TABLE = "brackets";
  let client = null;

  function getSupabaseLib() {
    const g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : null;
    return g && g.supabase ? g.supabase : null;
  }

  function isPlaceholderConfig(url, key) {
    if (!url || !key) return true;
    if (url.includes("YOUR_PROJECT")) return true;
    if (key === "YOUR_ANON_KEY") return true;
    return false;
  }

  function initSupabase(url, anonKey) {
    const lib = getSupabaseLib();
    if (!lib || typeof lib.createClient !== "function") {
      console.warn("SupabaseBracket: load @supabase/supabase-js from CDN before supabase-utils.js");
      return false;
    }
    const resolvedUrl = url || SUPABASE_URL;
    const resolvedKey = anonKey || SUPABASE_ANON_KEY;
    if (isPlaceholderConfig(resolvedUrl, resolvedKey)) {
      client = null;
      return false;
    }
    client = lib.createClient(resolvedUrl, resolvedKey);
    return true;
  }

  function isConfigured() {
    return client !== null;
  }

  function normalizeNickname(raw) {
    if (raw == null) return "";
    return String(raw)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .slice(0, 20);
  }

  function isValidNickname(nickname) {
    return /^[a-z0-9_]{2,20}$/.test(nickname);
  }

  function isValidPin(pin) {
    return /^\d{4}$/.test(String(pin));
  }

  async function hashPin(pin) {
    const data = new TextEncoder().encode(String(pin));
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function championFromPayload(payload, teamsDb) {
    const teamId = payload && payload.kPicks ? payload.kPicks[104] : null;
    if (!teamId) return "";
    if (teamsDb && teamsDb[teamId]) {
      const t = teamsDb[teamId];
      return `${t.flag} ${t.name}`;
    }
    return String(teamId);
  }

  function extractBracketNicknameFromPage() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("bracket");
    return q ? normalizeNickname(q) : null;
  }

  function buildSubmittedBracketUrl(nickname, currentHref) {
    const nick = normalizeNickname(nickname);
    const url = new URL("swipe.html", currentHref || window.location.href);
    url.searchParams.set("bracket", nick);
    url.hash = "";
    return url.href;
  }

  async function submitBracket(nickname, pin, payload, teamsDb) {
    if (!client) {
      return { ok: false, error: "not_configured" };
    }

    const nick = normalizeNickname(nickname);
    if (!isValidNickname(nick)) {
      return { ok: false, error: "invalid_nickname" };
    }
    if (!isValidPin(pin)) {
      return { ok: false, error: "invalid_pin" };
    }
    if (!payload || typeof payload !== "object") {
      return { ok: false, error: "invalid_payload" };
    }

    const pinHash = await hashPin(pin);
    const champion = championFromPayload(payload, teamsDb);

    const { data: existing, error: fetchError } = await client
      .from(TABLE)
      .select("nickname, pin_hash")
      .eq("nickname", nick)
      .maybeSingle();

    if (fetchError) {
      console.error("SupabaseBracket submit fetch:", fetchError);
      return { ok: false, error: fetchError.message || "fetch_failed" };
    }

    if (existing && existing.pin_hash !== pinHash) {
      return { ok: false, error: "wrong_pin" };
    }

    const row = {
      nickname: nick,
      pin_hash: pinHash,
      payload,
      champion,
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await client.from(TABLE).upsert(row, { onConflict: "nickname" });

    if (upsertError) {
      console.error("SupabaseBracket submit upsert:", upsertError);
      return { ok: false, error: upsertError.message || "upsert_failed" };
    }

    return { ok: true, nickname: nick, url: buildSubmittedBracketUrl(nick) };
  }

  async function getBracket(nickname) {
    if (!client) {
      return { ok: false, error: "not_configured" };
    }

    const nick = normalizeNickname(nickname);
    if (!nick) {
      return { ok: false, error: "invalid_nickname" };
    }

    const { data, error } = await client
      .from(TABLE)
      .select("nickname, payload, champion, updated_at")
      .eq("nickname", nick)
      .maybeSingle();

    if (error) {
      console.error("SupabaseBracket getBracket:", error);
      return { ok: false, error: error.message || "fetch_failed" };
    }
    if (!data) {
      return { ok: false, error: "not_found" };
    }

    return {
      ok: true,
      nickname: data.nickname,
      payload: data.payload,
      champion: data.champion,
      updated_at: data.updated_at
    };
  }

  async function listBrackets() {
    if (!client) {
      return { ok: false, error: "not_configured", brackets: [] };
    }

    const { data, error } = await client
      .from(TABLE)
      .select("nickname, champion, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("SupabaseBracket listBrackets:", error);
      return { ok: false, error: error.message || "fetch_failed", brackets: [] };
    }

    return { ok: true, brackets: data || [] };
  }

  const CHAMPION_BAR_TOP_N = 6;

  /** Group saved brackets by champion; percent of all predictors; top N only. */
  function aggregateChampionCounts(brackets, limit = CHAMPION_BAR_TOP_N) {
    const list = brackets || [];
    const total = list.length;
    const counts = new Map();
    for (const row of list) {
      const key = (row.champion || "").trim() || "—";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([champion, count]) => ({
        champion,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count || a.champion.localeCompare(b.champion))
      .slice(0, limit);
  }

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    initSupabase,
    isConfigured,
    normalizeNickname,
    isValidNickname,
    isValidPin,
    hashPin,
    championFromPayload,
    extractBracketNicknameFromPage,
    buildSubmittedBracketUrl,
    submitBracket,
    getBracket,
    listBrackets,
    aggregateChampionCounts,
    CHAMPION_BAR_TOP_N
  };
});
