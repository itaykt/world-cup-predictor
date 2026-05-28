# World Cup 2026 Fan Bracket

Static fan bracket simulator for the 2026 FIFA World Cup — game-by-game predictions, full knockout tree, and **Swipe Cup** (Tinder-style mobile predictor).

Live on GitHub Pages (no backend): predictions can be shared via URL-encoded bracket data.

## Apps

| File | Description |
|------|-------------|
| [`index.html`](index.html) | Full simulator with match feed, standings, bracket tree, AI settings |
| [`swipe.html`](swipe.html) | Fast swipe-through predictor; shares link to full bracket viewer |

## Development

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run lint      # ESLint
npm test          # Vitest unit tests
npm run ci        # lint + test (same as GitHub Actions)
```

## Sharing

Share links encode the full bracket in `index.html#share=…` (see [`share-utils.js`](share-utils.js)). Works on static hosting only — no server storage.

## CI

[![CI](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com/itaykt/world-cup-predictor/actions/workflows/ci.yml)

> Replace `itaykt/world-cup-predictor` in the badge URL with your GitHub `user/repo` after publishing.

## License

Personal project © 2026 Itaykt
