/* assets/analytics.js — records each page open and, if a counter slot exists
   (homepage corner), shows the running total. Fails silently off-Cloudflare
   (file:// / GitHub Pages) where /api/hits doesn't exist. No cookies, no IP. */
(function () {
  // 1) Record this open.
  try {
    fetch('/api/hits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname }),
      keepalive: true,
    }).catch(function () {});
  } catch (e) { /* no-op */ }

  // 2) If the page has a counter slot, fill it (homepage only).
  var el = document.getElementById('site-visits');
  if (!el) return;
  fetch('/api/hits')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || typeof d.total !== 'number') return;
      var zh = document.documentElement.getAttribute('data-lang') === 'zh';
      var n = d.total.toLocaleString();
      el.textContent = zh
        ? (n + ' 次访问 · ' + d.cityCount + ' 座城市')
        : (n + ' visits · ' + d.cityCount + ' cities');
      el.removeAttribute('hidden');
    })
    .catch(function () {});
})();
