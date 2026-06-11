/* assets/motion.js — count-up numbers, staggered reveals, hero-on-load.
   Pairs with motion.css. No deps. Respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1) Hero entrance on load ─────────────────────────────────────────── */
  // Tag the homepage hero stack and the service masthead copy, then play them in.
  function markHero() {
    var pairs = [
      ['.hero-logo', 0], ['.hero-slogan', 1],          // homepage
      ['.mast-title', 0], ['.mast-lead', 1],           // services masthead
    ];
    pairs.forEach(function (p) {
      var el = document.querySelector(p[0]);
      if (!el) return;
      el.classList.add('m-hero-rise', p[1] === 1 ? 'm-d2' : 'm-d1');
    });
  }
  markHero();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.querySelectorAll('.m-hero-rise').forEach(function (el) { el.classList.add('m-in'); });
    });
  });

  if (reduce) return; // entrance shown; skip the rest of the motion work

  /* ── 2) Staggered cascade for known groups ────────────────────────────── */
  // Give each child an index so motion.css can delay it, then reveal on enter.
  var groups = document.querySelectorAll('.db-stats, .db-cols, .svc-pair, .channels .metrics, .f-channels');
  groups.forEach(function (g) {
    g.setAttribute('data-stagger', '');
    var kids = g.children, i;
    for (i = 0; i < kids.length; i++) kids[i].style.setProperty('--si', i);
  });
  var stagObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); stagObs.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-stagger]').forEach(function (g) { stagObs.observe(g); });

  /* ── 3) Count-up numbers ──────────────────────────────────────────────── */
  // Targets: stat figures (.db-stats b) and metric numbers (.num). Parses the
  // text, keeps any prefix/suffix (~ , + % and thousands commas), counts up.
  function parseNum(txt) {
    var m = txt.match(/^([^\d-]*)([\d.,]+)(.*)$/s);
    if (!m) return null;
    var num = parseFloat(m[2].replace(/,/g, ''));
    if (isNaN(num)) return null;
    var hasComma = m[2].indexOf(',') >= 0;
    var decimals = (m[2].split('.')[1] || '').length;
    return { prefix: m[1], value: num, suffix: m[3], hasComma: hasComma, decimals: decimals };
  }
  function fmt(n, info) {
    var s = info.decimals ? n.toFixed(info.decimals) : String(Math.round(n));
    if (info.hasComma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: info.decimals, maximumFractionDigits: info.decimals });
    return info.prefix + s + info.suffix;
  }
  function animate(el) {
    var info = parseNum(el.textContent.trim());
    if (!info) return;
    var target = info.value, dur = 1100, t0 = 0;
    el.classList.add('m-counting');
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);     // easeOutCubic
      el.textContent = fmt(target * eased, info);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, info);
    }
    requestAnimationFrame(step);
  }
  var numObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animate(e.target); numObs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.db-stats b, .num').forEach(function (el) { numObs.observe(el); });
})();
