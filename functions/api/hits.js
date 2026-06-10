// functions/api/hits.js
// Privacy-light visit counter for the AESTRAT site, backed by Cloudflare D1 (free tier).
// Records ONE row per page open: timestamp, path, and the edge-provided country / region /
// city (request.cf) — NO IP address is ever read or stored.
//   POST /api/hits   -> record this open            body: { path }
//   GET  /api/hits   -> aggregate stats (JSON) for the on-page counter / your report

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'no_db' }, 503);

  let path = '/';
  try { const b = await request.json(); path = String(b.path || '/').slice(0, 200); } catch { /* keep default */ }

  const cf = request.cf || {};
  const country = String(cf.country || '').slice(0, 2);
  const region = String(cf.region || '').slice(0, 60);
  const city = String(cf.city || '').slice(0, 80);

  try {
    await env.DB
      .prepare('INSERT INTO hits (ts, path, country, region, city) VALUES (?, ?, ?, ?, ?)')
      .bind(Date.now(), path, country, region, city)
      .run();
  } catch {
    return json({ error: 'write_failed' }, 500);
  }
  return json({ ok: true }, 200);
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'no_db' }, 503);
  try {
    const total = (await env.DB.prepare('SELECT COUNT(*) AS n FROM hits').first())?.n || 0;
    const since = Date.now() - 30 * 864e5; // last 30 days
    const month = (await env.DB.prepare('SELECT COUNT(*) AS n FROM hits WHERE ts >= ?').bind(since).first())?.n || 0;
    const cityCount = (await env.DB.prepare("SELECT COUNT(DISTINCT city) AS n FROM hits WHERE city <> ''").first())?.n || 0;
    const cities = ((await env.DB.prepare(
      "SELECT city, country, COUNT(*) AS n FROM hits WHERE city <> '' GROUP BY city, country ORDER BY n DESC LIMIT 25"
    ).all())?.results) || [];
    const countries = ((await env.DB.prepare(
      "SELECT country, COUNT(*) AS n FROM hits WHERE country <> '' GROUP BY country ORDER BY n DESC LIMIT 40"
    ).all())?.results) || [];
    return json({ total, month, cityCount, cities, countries }, 200);
  } catch {
    return json({ error: 'read_failed' }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
  });
}
