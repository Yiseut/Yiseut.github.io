# Visit counter — setup (do this after the domain is on Cloudflare)

A privacy-light, free counter. Every page open is recorded with **city / country /
page / time** — **no IP, no cookies, no dwell time**. The homepage footer shows a quiet
`1,234 visits · 56 cities`; the full breakdown is available from the API / D1.

It is dormant until deployed on Cloudflare (on `file://` or GitHub Pages the calls just
fail silently). Nothing else is needed to keep building.

## One-time setup

1. **Create the free D1 database** (Cloudflare dashboard → Storage & Databases → D1 →
   Create, name it `aestrat-analytics`; or CLI):
   ```
   wrangler d1 create aestrat-analytics
   ```
2. **Create the table** (loads `schema.sql`):
   ```
   wrangler d1 execute aestrat-analytics --remote --file=./schema.sql
   ```
3. **Bind it to the Worker.** Copy the database id from step 1 into `wrangler.toml`
   (replace `PASTE_D1_DATABASE_ID_HERE`). The binding name must stay `DB`.
   *(Dashboard route: Workers & Pages → your Worker → Settings → Bindings → D1 →
   add binding `DB` → `aestrat-analytics`.)*
4. **Deploy** (`wrangler deploy`, or the connected git deploy).

## Reading the report

- **Footer counter:** total opens + distinct cities, shown on the homepage.
- **Full JSON:** open `https://<your-domain>/api/hits` — returns `{ total, month (last 30d),
  cityCount, cities:[{city,country,n}], countries:[{country,n}] }`.
- **Ad-hoc SQL** (anything you want — busiest day, a given city, etc.):
  ```
  wrangler d1 execute aestrat-analytics --remote --command "SELECT city, COUNT(*) n FROM hits GROUP BY city ORDER BY n DESC LIMIT 20"
  ```

## Notes

- Counts page **opens** (a refresh counts again) — that's "how many times opened".
- City/country come from Cloudflare's edge geo (`request.cf`), not from storing an IP.
- Free-tier D1 (5 GB, millions of reads/day) is far more than this site will use.
- Want a nicer private stats page instead of raw JSON? Ask and I'll add `/stats`.
