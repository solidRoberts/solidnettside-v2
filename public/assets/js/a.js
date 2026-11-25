// Design A: Solid-merket i 3D i forsidetoppen, og bildet som følger musa i prosjektlista.
//
// 3D (assets/js/3d.js, three.js) lastes først når siden er ferdig lastet, nettleseren er ledig og merket er synlig.
// Aldri med «spar data», på 2G eller uten WebGL: da blir SVG-merket stående. Ved redusert bevegelse står figuren
// stille (den kan fortsatt dras). Tegningen stopper når merket er utenfor skjermen eller fanen er skjult.
// Unntak fra designregel 5 (IntersectionObserver/requestAnimationFrame): bare her og i 3d.js, godkjent 25.11.2026.
(function () {
  'use strict';
  var rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var boks = document.querySelector('[data-3d]');
  var tilkobling = navigator.connection;
  var spar = tilkobling && (tilkobling.saveData || /2g/.test(tilkobling.effectiveType || ''));
  var webgl = false;
  try { var t = document.createElement('canvas'); webgl = !!(t.getContext('webgl2') || t.getContext('webgl')); } catch (e) { webgl = false; }

  if (boks && webgl && !spar && 'IntersectionObserver' in window) {
    var start = function () {
      import(boks.getAttribute('data-3d')).then(function (m) {
        var api = m.default(boks, { rolig: rolig });
        var synlig = true;
        var oppdater = function () { api.kjor(synlig && !document.hidden); };
        new IntersectionObserver(function (r) { synlig = r[0].isIntersecting; oppdater(); }).observe(boks);
        document.addEventListener('visibilitychange', oppdater);
      }).catch(function () { /* SVG-merket står */ });
    };
    var ledig = function () {
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
      else setTimeout(start, 300);
    };
    var vakt = new IntersectionObserver(function (r) {
      if (!r[0].isIntersecting) return;
      vakt.disconnect();
      if (document.readyState === 'complete') ledig(); else addEventListener('load', ledig, { once: true });
    }, { rootMargin: '200px' });
    vakt.observe(boks);
  }

  // Prosjektlista: et lite bilde av arbeidet følger musa (bare med mus, aldri på telefon).
  var indeks = document.querySelector('.indeks');
  if (indeks && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var flate = document.createElement('div');
    flate.className = 'indeks-forhand';
    flate.setAttribute('aria-hidden', 'true');
    var bilde = document.createElement('img');
    bilde.alt = '';
    flate.appendChild(bilde);
    document.body.appendChild(flate);
    indeks.addEventListener('pointerover', function (e) {
      var rad = e.target.closest('[data-forhand]');
      if (!rad || e.pointerType !== 'mouse') return;
      if (bilde.getAttribute('src') !== rad.getAttribute('data-forhand')) bilde.src = rad.getAttribute('data-forhand');
      flate.classList.add('vis');
    });
    indeks.addEventListener('pointerleave', function () { flate.classList.remove('vis'); });
    indeks.addEventListener('pointermove', function (e) {
      var x = e.clientX + 32 + 280 > innerWidth ? e.clientX - 312 : e.clientX + 32;
      flate.style.transform = 'translate(' + x + 'px,' + (e.clientY - 90) + 'px)';
    });
  }
})();
