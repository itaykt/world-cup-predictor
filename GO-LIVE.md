# Go-live checklist

Use this before sharing Swipe Cup with friends. Items you must do in dashboards are marked **manual**.

---

## Supabase setup

- [ ] **manual** Create a project at [supabase.com](https://supabase.com)
- [ ] **manual** Run [`supabase/schema.sql`](supabase/schema.sql) in **SQL Editor** (creates `brackets` + RLS policies)
- [ ] **manual** Copy **Project URL** and **anon public** key into [`supabase-utils.js`](supabase-utils.js) (replace `YOUR_PROJECT` / `YOUR_ANON_KEY`)
- [ ] **manual** Confirm RLS: Table Editor → `brackets` → policies should include `brackets_public_select`, `brackets_public_insert`, `brackets_public_update` (all `using (true)`). You do **not** need to disable RLS if those policies exist.
- [ ] Test API locally:

```bash
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJ..."
npm run test:supabase
```

Optional: run with a real nickname to upsert, then list:

```bash
npm run test:supabase -- --submit testfan 1234
```

See [supabase/SPAM-PROTECTION.md`](supabase/SPAM-PROTECTION.md) for rate-limit ideas before the tournament.

---

## GitHub Pages

- [ ] **manual** Repo **Settings → Pages** → Source: **Deploy from branch** → `main` → `/ (root)`
- [ ] **manual** Wait for deploy; open your Pages URL
- [ ] Confirm live:
  - `https://<user>.github.io/<repo>/swipe.html` — main app
  - `https://<user>.github.io/<repo>/index.html` — optional full simulator (share links redirect to Swipe)
- [ ] `swipe.html?bracket=<nickname>` — loads podium + **View Bracket** (read-only)
- [ ] `swipe.html#share=<base64>` — same (hash share; old `index.html#share=` redirects to Swipe)

---

## Before sharing with friends

- [ ] Full run on **mobile**: swipe gestures, podium, **Share Results**, **View Bracket**, **Group stage** toggle
- [ ] Save a bracket (**Save to leaderboard** on podium or index championship modal); refresh Swipe welcome — **Community leaderboard** should list it
- [ ] Wrong PIN: save again with same nickname + wrong PIN → red error in modal (“Wrong PIN for this nickname…”)
- [ ] CI passing: [![CI](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml) (`npm run ci` locally)

---

## Nice to do before kickoff (June 11)

- [ ] Read [supabase/SPAM-PROTECTION.md`](supabase/SPAM-PROTECTION.md) — enable Supabase API rate limits or prune spam rows
- [ ] Submit your own bracket first so the leaderboard isn’t empty
- [ ] Pin the Swipe URL (`swipe.html`) in your group chat, not `index.html`

---

## Quick reference

| What | URL |
|------|-----|
| Play | `swipe.html` |
| View saved bracket | `swipe.html?bracket=nickname` |
| Hash share (no DB) | `swipe.html#share=…` |
| Bracket view only | `swipe.html?bracket=nick&view=bracket` |

**Do not commit** real `SUPABASE_ANON_KEY` to a public repo if you care about quota abuse — for a friends-only bracket the anon key is normal; use Dashboard rate limits for protection.
