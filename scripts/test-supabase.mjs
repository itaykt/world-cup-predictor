#!/usr/bin/env node
/**
 * Smoke-test Supabase bracket API (requires network + env vars).
 *
 *   export SUPABASE_URL="https://xxxx.supabase.co"
 *   export SUPABASE_ANON_KEY="eyJ..."
 *   npm run test:supabase
 *
 * Optional upsert + list:
 *   npm run test:supabase -- --submit mynick 1234
 */
import SupabaseBracket from "../supabase-utils.js";
import * as supabase from "@supabase/supabase-js";
globalThis.supabase = supabase;
globalThis.window = { location: { href: "http://localhost/" } };

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_ANON_KEY in the environment.");
  console.error("Values must match supabase-utils.js (not the YOUR_PROJECT placeholders).");
  process.exit(1);
}

SupabaseBracket.initSupabase(url, key);

if (!SupabaseBracket.isConfigured()) {
  console.error("initSupabase failed — check URL and key.");
  process.exit(1);
}

const args = process.argv.slice(2);
const doSubmit = args[0] === "--submit";
const nickname = args[1] || "smoke_test";

const samplePayload = {
  name: "Smoke Test",
  step: "championship",
  gScores: { A_0: { scoreA: "1", scoreB: "0" } },
  kScores: {},
  kPicks: { 104: "bra" },
  thirds: []
};

const teamsDb = {
  bra: { name: "Brazil", flag: "🇧🇷", rank: 1 }
};

async function main() {
  if (doSubmit) {
    console.log(`Submitting bracket as "${nickname}"…`);
    const sub = await SupabaseBracket.submitBracket(nickname, samplePayload, teamsDb);
    if (!sub.ok) {
      console.error("submitBracket failed:", sub.error);
      process.exit(1);
    }
    console.log("submitBracket ok:", sub.url);
  }

  console.log("listBrackets…");
  const list = await SupabaseBracket.listBrackets();
  if (!list.ok) {
    console.error("listBrackets failed:", list.error);
    process.exit(1);
  }
  console.log(`listBrackets ok (${list.brackets.length} rows)`);
  list.brackets.slice(0, 5).forEach((row) => {
    console.log(`  @${row.nickname} — ${row.champion || "—"} — ${row.updated_at}`);
  });

  if (doSubmit) {
    console.log("getBracket…");
    const got = await SupabaseBracket.getBracket(nickname);
    if (!got.ok) {
      console.error("getBracket failed:", got.error);
      process.exit(1);
    }
    console.log("getBracket ok, champion:", got.champion);

    console.log("public pin_hash:", SupabaseBracket.PUBLIC_PIN_HASH.slice(0, 12) + "…");
  }

  console.log("\nAll checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
