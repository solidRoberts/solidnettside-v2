/*
  Kontaktskjemaet på /kontakt. Sender med FormSubmit AJAX (https://formsubmit.co) til adressen i
  data-endepunkt, med kopi til data-kopi. Alle tekster står i HTML-en (fra kilde/innhold.mjs).
  - Påkrevd: navn, og minst ett av feltene i en <fieldset data-minst-en> (telefon eller e-post).
  - Validering uten nettleserens egne bobler: feilen vises ved feltet eller gruppa (aria-invalid +
    aria-describedby), og et sammendrag øverst får fokus og lenker til feltene.
  - Honningfelt (_honey): er det fylt ut, sendes ingenting.
  - Tomme valgfrie felt sendes som tom tekst. _replyto settes bare når e-post er fylt ut.
  - Vellykket bare når svaret er OK og FormSubmit svarer success: "true". Da vises kvitteringen med navnet.
    Ellers vises en feilmelding med telefon og e-post, og det brukeren skrev, blir stående.
  - ?gjelder=annonser|google|nettside i adressen forhåndsvelger «Hva gjelder det?».
*/
(function () {
  'use strict';

  var skjema = document.getElementById('kontaktskjema');
  if (!skjema || !window.fetch || !window.JSON) return;

  var plass = document.getElementById('skjema-plass');
  var knapp = skjema.querySelector('.knapp-send');
  var sammendrag = document.getElementById('feilsammendrag');
  var sammendragTittel = document.getElementById('feilsammendrag-tittel');
  var sammendragListe = sammendrag.querySelector('ul');
  var feilplass = document.getElementById('skjema-feilplass');
  var honning = skjema.querySelector('[name="_honey"]');
  var knappTekst = knapp.textContent;
  var felt = Array.prototype.slice.call(skjema.querySelectorAll('input, select, textarea')).filter(function (el) {
    return el !== honning;
  });
  var grupper = Array.prototype.slice.call(skjema.querySelectorAll('fieldset[data-minst-en]'));
  var forsokt = false;
  var sender = false;

  // ---------- Forhåndsvalg fra adressen ----------
  var gjelder = new URLSearchParams(window.location.search).get('gjelder');
  if (gjelder && /^[a-z-]+$/.test(gjelder)) {
    var valg = skjema.querySelector('#gjelder option[data-nokkel="' + gjelder + '"]');
    if (valg) valg.selected = true;
  }

  // ---------- Hjelpere ----------
  function gruppeFor(el) {
    return el.closest ? el.closest('fieldset[data-minst-en]') : null;
  }

  // Feilboksen til gruppa: <fieldset id="gruppe-kontaktvei"> → <p id="kontaktvei-feil">.
  function gruppeFeilboks(g) {
    return document.getElementById(g.id.replace(/^gruppe-/, '') + '-feil');
  }

  function feltIGruppe(g) {
    return Array.prototype.slice.call(g.querySelectorAll('input, select, textarea'));
  }

  // ---------- Validering ----------
  function valider(el) {
    var v = el.value.trim();
    if (el.getAttribute('aria-required') === 'true' && v === '') return el.getAttribute('data-feil-tom');
    if (v === '') return '';
    var formatFeil = el.getAttribute('data-feil-format');
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v)) return formatFeil;
    if (el.type === 'tel') {
      // Norsk nummer: 8 siffer, eventuelt med +47 eller 0047 foran. Mellomrom, bindestrek, punktum og parentes er
      // lov overalt, også rundt landkoden, så «(+47) 988 31 492» vurderes som «+4798831492».
      var kompakt = v.replace(/[\s().-]/g, '');
      var siffer = kompakt.replace(/\D/g, '');
      if (/^(\+|00)47/.test(kompakt)) siffer = siffer.replace(/^(00)?47/, '');
      if (/[^\d\s+().-]/.test(v) || siffer.length !== 8) return formatFeil;
    }
    return '';
  }

  // Minst ett felt i gruppa må være fylt ut.
  function validerGruppe(g) {
    var noen = feltIGruppe(g).some(function (el) { return el.value.trim() !== ''; });
    return noen ? '' : g.getAttribute('data-feil-tom');
  }

  // aria-invalid og aria-describedby ut fra feltets egen feil og gruppas feil.
  function oppdaterAria(el) {
    var ider = [];
    if (el.getAttribute('data-hjelp')) ider.push(el.getAttribute('data-hjelp'));
    var egen = document.getElementById(el.id + '-feil');
    var g = gruppeFor(el);
    var gf = g ? gruppeFeilboks(g) : null;
    if (egen && !egen.hidden) ider.push(egen.id);
    if (gf && !gf.hidden) ider.push(gf.id);
    if (ider.length) el.setAttribute('aria-describedby', ider.join(' '));
    else el.removeAttribute('aria-describedby');
    if ((egen && !egen.hidden) || (gf && !gf.hidden)) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function visFeil(el, melding) {
    var boks = document.getElementById(el.id + '-feil');
    var rad = document.getElementById('felt-' + el.id);
    boks.textContent = melding || '';
    boks.hidden = !melding;
    rad.classList.toggle('har-feil', !!melding);
    oppdaterAria(el);
  }

  function visGruppeFeil(g, melding) {
    var boks = gruppeFeilboks(g);
    boks.textContent = melding || '';
    boks.hidden = !melding;
    g.classList.toggle('har-feil', !!melding);
    feltIGruppe(g).forEach(oppdaterAria);
  }

  function visSammendrag(feil) {
    var mal = feil.length === 1 ? skjema.getAttribute('data-sammendrag-en') : skjema.getAttribute('data-sammendrag-flere');
    sammendragTittel.textContent = mal.replace('{n}', String(feil.length));
    sammendragListe.textContent = '';
    feil.forEach(function (f) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + f.el.id;
      a.textContent = f.navn + ': ' + f.melding;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        f.el.focus();
        f.el.scrollIntoView({ block: 'center' });
      });
      li.appendChild(a);
      sammendragListe.appendChild(li);
    });
    sammendrag.hidden = false;
    sammendrag.focus();
  }

  function sjekkAlt() {
    var feil = [];
    felt.forEach(function (el) {
      var melding = valider(el);
      visFeil(el, melding);
      if (melding) feil.push({ el: el, navn: el.getAttribute('data-navn'), melding: melding });
    });
    grupper.forEach(function (g) {
      var melding = validerGruppe(g);
      visGruppeFeil(g, melding);
      // Sammendraget lenker til det første feltet i gruppa (telefon).
      if (melding) feil.push({ el: feltIGruppe(g)[0], navn: g.getAttribute('data-navn'), melding: melding });
    });
    // Samme rekkefølge som i skjemaet.
    feil.sort(function (a, b) {
      return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return feil;
  }

  // Etter første forsøk rettes feilmeldingene mens brukeren skriver.
  felt.forEach(function (el) {
    function sjekk() {
      if (!forsokt) return;
      visFeil(el, valider(el));
      var g = gruppeFor(el);
      if (g) visGruppeFeil(g, validerGruppe(g));
      if (!skjema.querySelector('[aria-invalid="true"]')) sammendrag.hidden = true;
    }
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
      var g = gruppeFor(el);
      if (el.getAttribute('aria-invalid') === 'true' || (g && g.classList.contains('har-feil'))) sjekk();
    });
    el.addEventListener('blur', sjekk);
  });

  // ---------- Tilstander ----------
  function fraMal(id) {
    var mal = document.getElementById(id);
    return mal.content.firstElementChild.cloneNode(true);
  }

  function visSuksess(navn) {
    var kvittering = fraMal('mal-suksess');
    var navnPlass = kvittering.querySelector('.kvittering-navn');
    if (navnPlass) navnPlass.textContent = navn;
    plass.textContent = '';
    plass.appendChild(kvittering);
    kvittering.focus();
  }

  function visFeilmelding() {
    feilplass.textContent = '';
    var melding = fraMal('mal-feil');
    feilplass.appendChild(melding);
    melding.scrollIntoView({ block: 'nearest' });
  }

  // Under sending låses knappen med aria-disabled, ikke disabled: en deaktivert knapp mister fokus, og da havner
  // tastatur- og skjermleserbrukere på <body>. Dobbel innsending stoppes av «sender»-flagget i submit.
  function settSender(pa) {
    sender = pa;
    if (pa) knapp.setAttribute('aria-disabled', 'true');
    else knapp.removeAttribute('aria-disabled');
    knapp.textContent = pa ? skjema.getAttribute('data-sender') : knappTekst;
    if (pa) skjema.setAttribute('aria-busy', 'true');
    else skjema.removeAttribute('aria-busy');
  }

  // ---------- Innsending ----------
  skjema.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sender) return;
    forsokt = true;
    feilplass.textContent = '';

    var feil = sjekkAlt();
    if (feil.length) {
      visSammendrag(feil);
      return;
    }
    sammendrag.hidden = true;

    var navnFelt = skjema.querySelector('#navn');
    var navn = navnFelt ? navnFelt.value.trim() : '';

    // Honningfeltet fylles bare ut av roboter. Da sendes ingenting, og roboten får ingen feilmelding å lære av.
    if (honning && honning.value !== '') {
      visSuksess(navn);
      return;
    }

    var data = {};
    felt.forEach(function (el) { data[el.name] = el.value.trim(); });
    data.Side = window.location.href;
    // Svaradresse: «Svar» i varselet skal gå til kunden, men bare når kunden har oppgitt e-post.
    var epost = skjema.querySelector('input[type="email"]');
    if (epost && epost.value.trim() !== '') data._replyto = epost.value.trim();
    data._cc = skjema.getAttribute('data-kopi');
    data._subject = skjema.getAttribute('data-emne');
    data._template = 'table';
    data._honey = '';

    settSender(true);
    var kontroll = typeof AbortController === 'function' ? new AbortController() : null;
    var tidsgrense = setTimeout(function () { if (kontroll) kontroll.abort(); }, 20000);

    fetch(skjema.getAttribute('data-endepunkt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: kontroll ? kontroll.signal : undefined
    })
      .then(function (svar) {
        return svar.json().catch(function () { return {}; }).then(function (json) {
          return { ok: svar.ok, json: json || {} };
        });
      })
      .then(function (r) {
        clearTimeout(tidsgrense);
        if (r.ok && (r.json.success === 'true' || r.json.success === true)) {
          visSuksess(navn);
        } else {
          settSender(false);
          visFeilmelding();
        }
      })
      .catch(function () {
        clearTimeout(tidsgrense);
        settSender(false);
        visFeilmelding();
      });
  });

  // Knappen er låst i HTML-en, slik at skjemaet ikke kan sendes uten skript (da vises telefon og e-post i stedet).
  knapp.disabled = false;
})();
