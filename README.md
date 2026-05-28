# World Cup 2026 Fan Bracket

Static fan bracket simulator for the 2026 FIFA World Cup — game-by-game predictions, full knockout tree, and **Swipe Cup** (Tinder-style mobile predictor).

Live on GitHub Pages: predictions can be shared via URL-encoded bracket data, or saved to a **Supabase** leaderboard with nickname + 4-digit PIN.

**Going live?** Follow [GO-LIVE.md](GO-LIVE.md).

## Apps

| File | Description |
|------|-------------|
| [`swipe.html`](swipe.html) | **Only public entry** — welcome, swipe predictor, podium, bracket viewer |

**Share this URL:** `https://itaykt.github.io/world-cup-predictor/swipe.html` — the site root (`/world-cup-predictor/`) is intentionally not a page.

## Development

Requires [Node.js](https://nodejs.org/) 20+.

Shared modules (loaded before the apps in HTML):

- [`data.js`](data.js) — teams, groups, match schedule
- [`tournament-standings.js`](tournament-standings.js) — standings, tiebreakers, third-place wildcards
- [`share-utils.js`](share-utils.js) — URL share encoding for GitHub Pages
- [`supabase-utils.js`](supabase-utils.js) — optional leaderboard save/load (Supabase CDN client)
- [`bracket-view.js`](bracket-view.js) — read-only group tables + knockout list in Swipe

### Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in **SQL Editor**.
3. Copy **Project URL** and **anon public** key into `supabase-utils.js` (replace `YOUR_PROJECT` placeholders).
4. Deploy — users can save brackets from the championship screen or Swipe Cup podium.

Saved brackets load read-only on `swipe.html?bracket=nickname`. Hash sharing uses `swipe.html#share=…`.

```bash
npm install
npm run lint      # ESLint
npm test          # Vitest unit tests (share-utils + standings)
npm run ci        # lint + test (same as GitHub Actions)
```

## Sharing

| Method | URL | Storage |
|--------|-----|---------|
| Hash share | `swipe.html#share=…` | None (full state in URL) |
| Leaderboard | `swipe.html?bracket=nickname` | Supabase `brackets` table |
| Bracket only | `swipe.html?bracket=nick&view=bracket` | Opens group + knockout view directly |

PINs are stored as SHA-256 hashes client-side before upsert. Re-submitting with the same nickname requires the correct PIN.

## CI

[![CI](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml)

## License

Personal project © 2026 Itaykt
