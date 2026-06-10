-- D1 schema for the AESTRAT visit counter (functions/api/hits.js).
-- Run once after creating the D1 database (see ANALYTICS.md).
CREATE TABLE IF NOT EXISTS hits (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,   -- epoch milliseconds
  path    TEXT,               -- which page was opened
  country TEXT,               -- 2-letter code, from Cloudflare edge geo
  region  TEXT,               -- province / state
  city    TEXT                -- city, from Cloudflare edge geo (no IP stored)
);
CREATE INDEX IF NOT EXISTS idx_hits_ts   ON hits (ts);
CREATE INDEX IF NOT EXISTS idx_hits_city ON hits (city);
