/*
  Samtykke til informasjonskapsler og Meta-pikselen (ekomloven § 3-15 og GDPR). Lastes på alle sider.
  - Banneret (#samtykke) står skjult i HTML-en, med tekstene fra kilde/innhold.mjs og piksel-ID-en i data-piksel.
  - Ingenting fra Meta lastes før «Godta». «Godta» og «Avvis» er like store knapper.
  - Valget lagres i localStorage["sm_samtykke"] med versjon og dato, og spørres om igjen etter 12 måneder
    eller når VERSJON økes (gjør det hvis nye verktøy eller formål kommer til, og oppdater personvernerklæringen).
  - Knappen [data-samtykke-endre] nederst på siden viser banneret igjen. Trekkes samtykket tilbake, slettes
    Meta-kapslene (_fbp, _fbc) og siden lastes på nytt, så pikselen ikke fortsetter å kjøre.
  - window.smPiksel(hendelse) sender en standardhendelse (Lead, Contact) bare når pikselen er lastet.
    Ingen personopplysninger sendes med: Meta får vite at noe skjedde, ikke hva som ble skrevet.
  - Klikk på tel:-lenker sender Contact.
*/
(function () {
  'use strict';

  var NOKKEL = 'sm_samtykke';
  var VERSJON = 1;
  var MAKS_ALDER_MS = 365 * 24 * 60 * 60 * 1000;

  var banner = document.getElementById('samtykke');
  if (!banner) return;
  var PIKSEL_ID = banner.getAttribute('data-piksel');
  var lastet = false;

  function lesValg() {
    try {
      var v = JSON.parse(localStorage.getItem(NOKKEL));
      if (!v || v.versjon !== VERSJON || typeof v.dato !== 'string') return null;
      var alder = Date.now() - new Date(v.dato).getTime();
      if (!(alder >= 0 && alder < MAKS_ALDER_MS)) return null;
      return { markedsforing: v.markedsforing === true };
    } catch (e) {
      return null;
    }
  }

  function lagreValg(markedsforing) {
    try {
      localStorage.setItem(NOKKEL, JSON.stringify({ versjon: VERSJON, dato: new Date().toISOString(), markedsforing: !!markedsforing }));
    } catch (e) {
      // Lagring kan være blokkert (privat modus). Valget gjelder da bare denne sidevisningen.
    }
  }

  /*
    Sletter kapsler som begynner med «prefiks». En kapsel slettes bare når domene og sti stemmer med det den ble
    satt med, og Meta setter _fbp på registrert domene med punktum foran (.solidmarketing.no). Derfor prøves
    vert-kapsel uten domene og hvert domenenivå med og uten punktum. Varianter som ikke passer, ignoreres.
  */
  function slettKapsler(prefiks) {
    var raa = '';
    try {
      raa = document.cookie || '';
    } catch (e) {
      return;
    }
    var navn = raa.split(';').map(function (bit) { return bit.split('=')[0].trim(); })
      .filter(function (n, i, alle) { return n.indexOf(prefiks) === 0 && alle.indexOf(n) === i; });
    if (!navn.length) return;
    var domener = [''];
    var vert = window.location.hostname || '';
    if (vert.indexOf('.') > -1 && !/^[\d.]+$/.test(vert)) {
      var deler = vert.split('.');
      for (var i = 0; i + 1 < deler.length; i++) {
        var d = deler.slice(i).join('.');
        domener.push(d, '.' + d);
      }
    }
    navn.forEach(function (n) {
      domener.forEach(function (d) {
        try {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; max-age=0; path=/' + (d ? '; domain=' + d : '') + '; SameSite=Lax';
        } catch (e) {
          // Blokkert kapsellagring: da finnes kapselen uansett ikke.
        }
      });
    });
  }

  function slettMetaKapsler() {
    slettKapsler('_fbp');
    slettKapsler('_fbc');
  }

  // Metas standardkode for pikselen, uten inline-skript (CSP tillater bare skript fra egne filer og connect.facebook.net).
  function lastPiksel() {
    if (lastet || !PIKSEL_ID) return;
    lastet = true;
    if (!window.fbq) {
      var fbq = window.fbq = function () {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
    }
    // Ingen automatiske hendelser (knappeklikk med knappetekst o.l.): bare PageView, Lead og Contact,
    // slik personvernerklæringen beskriver.
    window.fbq('set', 'autoConfig', false, PIKSEL_ID);
    window.fbq('init', PIKSEL_ID);
    window.fbq('track', 'PageView');
  }

  window.smPiksel = function (hendelse) {
    if (!lastet || typeof window.fbq !== 'function') return;
    try {
      window.fbq('track', hendelse);
    } catch (e) {
      // Sporing skal aldri stoppe siden.
    }
  };

  // Banneret ligger fast nederst. Siden får like mye luft nederst, så footeren ikke skjules bak det.
  function maalBanner() {
    var h = banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height);
    document.body.style.paddingBottom = h ? h + 'px' : '';
  }

  function visBanner() {
    banner.hidden = false;
    maalBanner();
  }

  function skjulBanner() {
    var haddeFokus = banner.contains(document.activeElement);
    banner.hidden = true;
    maalBanner();
    // Knappen som hadde fokus forsvinner. Fokus flyttes til hovedinnholdet i stedet for å falle til <body>.
    if (haddeFokus) {
      var hoved = document.getElementById('innhold');
      if (hoved) hoved.focus({ preventScroll: true });
    }
  }

  function velg(markedsforing) {
    lagreValg(markedsforing);
    skjulBanner();
    if (markedsforing) {
      lastPiksel();
    } else {
      slettMetaKapsler();
      // Et skript som allerede kjører, kan ikke fjernes fra en åpen side.
      if (lastet) window.location.reload();
    }
  }

  banner.addEventListener('click', function (e) {
    var knapp = e.target.closest('[data-samtykke]');
    if (!knapp) return;
    velg(knapp.getAttribute('data-samtykke') === 'godta');
  });

  document.addEventListener('click', function (e) {
    var endre = e.target.closest('[data-samtykke-endre]');
    if (endre) {
      visBanner();
      var forste = banner.querySelector('[data-samtykke]');
      if (forste) forste.focus();
      return;
    }
    var tel = e.target.closest('a[href^="tel:"]');
    if (tel) window.smPiksel('Contact');
  });

  // Knappen for å endre valget virker bare med skript, så den vises først nå.
  Array.prototype.forEach.call(document.querySelectorAll('[data-samtykke-endre]'), function (k) { k.hidden = false; });

  if ('ResizeObserver' in window) new ResizeObserver(maalBanner).observe(banner);
  else window.addEventListener('resize', maalBanner);

  var v = lesValg();
  if (v && v.markedsforing) {
    lastPiksel();
  } else {
    // Uten gyldig samtykke skal det ikke ligge Meta-kapsler igjen (f.eks. etter at VERSJON er økt).
    slettMetaKapsler();
    if (!v) visBanner();
  }
})();
