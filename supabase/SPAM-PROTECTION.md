# Leaderboard spam protection

The static site uses the **anon** key with open insert/update RLS. Anyone with the key can write rows from the browser or curl. For a friends-only project that is usually fine; for a public link, add one or more of these:

## 1. Supabase Dashboard (easiest)

**Project Settings → API** — review built-in rate limiting on the Data API.

**Database → Webhooks / Advisors** — monitor row count on `public.brackets`.

Manually delete junk rows in **Table Editor** when needed.

## 2. Row cap (optional SQL)

After go-live, if the table grows too large:

```sql
-- Example: alert only — enforce via app or cron, not automatic here
select count(*) from public.brackets;
```

A hard cap needs a trigger or Edge Function; the client cannot enforce a global max safely.

## 3. Edge Function (strongest)

Move `submitBracket` to a Supabase Edge Function that:

- Verifies PIN server-side
- Rate-limits by IP (e.g. 10 writes / hour)
- Rejects invalid nicknames

The static site would call the function URL instead of direct `upsert`. Not implemented in this repo yet.

## 4. What you already have

- **Unique nickname** — one row per name; updates require correct PIN (checked in browser before upsert; a determined attacker can still bypass via API).
- **4-digit PIN** — stored as SHA-256 hash only, not plaintext.

For tournament week, checking the table once a day and deleting obvious spam is enough for most fan sites.
