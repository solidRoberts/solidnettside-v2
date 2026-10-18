/* Annonsekalkulatoren – flyttet fra teamet/annonsekalkulator.html (inline-skript er ikke lov med CSP).
   Endret her: eksempelvarselet, resultatteksten og skjermlesersammendraget sier fra så lenge noen av
   eksempeltallene står igjen, ikke bare til første endring. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Feltdefinisjoner — grenser og feilmeldinger på norsk
     --------------------------------------------------------------- */
  var FELT = [
    { id: 'budsjett',     navn: 'Annonsebudsjett per måned', enhet: 'kr', min: 0,    max: 100000000, paakrevd: true,
      under: 'Budsjettet kan ikke være negativt.', over: 'Budsjettet kan ikke være over 100 000 000 kr.' },
    { id: 'klikkpris',    navn: 'Klikkpris', enhet: 'kr', min: 0.01, max: 10000, paakrevd: true,
      under: 'Klikkprisen må være større enn 0. Minste tillatte verdi er 0,01 kr.', over: 'Klikkprisen kan ikke være over 10 000 kr.' },
    { id: 'konvRate',     navn: 'Andel klikk som blir en henvendelse', enhet: '%', min: 0, max: 100, paakrevd: true,
      under: 'Andelen kan ikke være negativ.', over: 'Andelen kan ikke være over 100 %.' },
    { id: 'salgsRate',    navn: 'Andel henvendelser som blir kunde', enhet: '%', min: 0, max: 100, paakrevd: true,
      under: 'Andelen kan ikke være negativ.', over: 'Andelen kan ikke være over 100 %.' },
    { id: 'snittordre',   navn: 'Gjennomsnittlig ordreverdi', enhet: 'kr', min: 0, max: 100000000, paakrevd: true,
      under: 'Ordreverdien kan ikke være negativ.', over: 'Ordreverdien kan ikke være over 100 000 000 kr.' },
    { id: 'dekningsgrad', navn: 'Dekningsgrad', enhet: '%', min: 0, max: 100, paakrevd: true,
      under: 'Dekningsgraden kan ikke være negativ.', over: 'Dekningsgraden kan ikke være over 100 %.' },
    { id: 'honorar',      navn: 'Månedlig honorar til byrå eller frilanser', enhet: 'kr', min: 0, max: 100000000, paakrevd: false,
      under: 'Honoraret kan ikke være negativt.', over: 'Honoraret kan ikke være over 100 000 000 kr.' }
  ];

  var EKSEMPEL = {
    budsjett: '20000', klikkpris: '14', konvRate: '4', salgsRate: '15',
    snittordre: '12000', dekningsgrad: '45', honorar: '6000'
  };

  var HARDT_MELLOMROM = ' ';
  var MINUS = '−';
  var STREK = '—';

  var el = {};
  ['tomTilstand', 'manglerBoks', 'manglerListe', 'feilBoks', 'feilListe',
   'srSammendrag', 'resultatInnhold', 'tolkning',
   'btnEksempel', 'btnTom', 'btnKopier', 'kopiStatus', 'kopiBoks', 'kopiTekst',
   'grenseBoks', 'grenseTall', 'grenseNeste', 'statuslinje', 'statusTekst'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var LINJER = ['klikk', 'henvendelser', 'kunder', 'omsetning', 'dekningsbidrag', 'totalkostnad',
                'resultat', 'roas', 'roi', 'prisHenvendelse', 'prisKunde', 'kunderNull', 'maksPrisHenvendelse'];
  var ut = {};
  LINJER.forEach(function (n) { ut[n] = document.getElementById('r-' + n); });

  var eksempelBrukt = false;    /* har eksempelknappen vært brukt i denne økten */
  var sistVarsel = '';          /* hvilke eksempelfelt varselruta sist viste (se oppdaterEksempelVarsel) */

  var TOM_TEKST = 'Fyll inn tallene dine, så regner vi mens du skriver.';
  var FEIL_TEKST = 'Rett opp feilene som er merket ved feltene, så regner vi videre.';
  var GRENSE_NULL = 'en henvendelse gir ikke dekningsbidrag med disse tallene';

  /* ---------------------------------------------------------------
     Tallformat — norsk, og likt i alle nettlesere
     --------------------------------------------------------------- */
  function avrund(n, desimaler) {
    var f = Math.pow(10, desimaler);
    var fortegn = n < 0 ? -1 : 1;
    return fortegn * Math.round(Math.abs(n) * f) / f;
  }

  /* Sjekk én gang om nettleseren faktisk kan norsk tallformat. Gjør den ikke det,
     bygger vi formatet selv, slik at siden viser likt i alle nettlesere. */
  var NORSK_LOCALE = (function () {
    try {
      var p = (1234.5).toLocaleString('nb-NO');
      return p.indexOf(',') !== -1 && p.indexOf('.') === -1;
    } catch (e) {
      return false;
    }
  })();

  function byggSelv(abs, desimaler) {
    var deler = abs.toFixed(desimaler).split('.');
    deler[0] = deler[0].replace(/\B(?=(\d{3})+(?!\d))/g, HARDT_MELLOMROM);
    return deler.join(',');
  }

  function formater(n, desimaler) {
    var negativ = n < 0;
    var abs = Math.abs(n);
    var s;
    if (NORSK_LOCALE) {
      s = abs.toLocaleString('nb-NO', {
        minimumFractionDigits: desimaler,
        maximumFractionDigits: desimaler
      });
      /* Nettlesere er uenige om hvilket mellomromstegn som brukes som tusenskille. */
      s = s.replace(/[   ]/g, HARDT_MELLOMROM);
    } else {
      s = byggSelv(abs, desimaler);
    }
    return (negativ ? MINUS : '') + s;
  }

  function kr(n) { return formater(avrund(n, 0), 0) + HARDT_MELLOMROM + 'kr'; }

  /* ---------------------------------------------------------------
     Innlesing og validering
     --------------------------------------------------------------- */
  function tolkTall(raa, felt) {
    var t = String(raa).trim();
    if (t === '') return { tom: true };
    var r = t.replace(/[\s   ]/g, '');
    r = r.replace(/−/g, '-');
    var kronefelt = felt.enhet === 'kr';
    /* Innlimt fra en annonsekonto: «+10000», «10 000 kr», «8000,-» eller «5 %».
       Bare enheten som hører til feltet fjernes — feil enhet skal avvises, ikke svelges. */
    if (kronefelt && /%$/.test(r)) {
      return { ugyldig: true, melding: 'Dette feltet oppgis i kroner, ikke i prosent.' };
    }
    if (!kronefelt && /(kr|nok|,-|\.-)$/i.test(r)) {
      return { ugyldig: true, melding: 'Dette feltet oppgis i prosent, ikke i kroner.' };
    }
    r = kronefelt ? r.replace(/(kr|nok|,-|\.-)$/i, '') : r.replace(/%$/, '');
    /* «10.000» og «10,000» kan bety ti tusen eller ti. Punktum og komma er desimaltegn
       i kalkulatoren, men et stille svar som er tusen ganger for lite er verre enn en melding.
       I prosentfeltene er maks 100, så der kan det ikke misforstås. */
    var punktumSkille = /^[+-]?[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(r);
    var kommaSkille = /^[+-]?[1-9]\d{0,2}(,\d{3})+$/.test(r);
    if (kronefelt && (punktumSkille || kommaSkille)) {
      /* Et negativt beløp er feil uansett hvordan det leses, så et forslag hjelper ikke. */
      if (r.charAt(0) === '-') { return { ugyldig: true, melding: felt.under }; }
      var uten = r.replace(/^\+/, '');
      var skilletegn = punktumSkille ? 'Punktum' : 'Komma';
      var tusen = uten.replace(punktumSkille ? /\./g : /,/g, HARDT_MELLOMROM);
      /* I klikkprisen betyr «1.500» som oftest 1,5 kr. Med ett skilletegn og ingen
         desimaler finnes begge tolkningene, og da nevnes begge. */
      if (felt.id === 'klikkpris' && /^\d{1,3}[.,]\d{3}$/.test(uten)) {
        var deler = uten.split(/[.,]/);
        var brok = deler[1].replace(/0+$/, '');
        var desimal = deler[0] + (brok ? ',' + brok : '');
        return { ugyldig: true, melding: skilletegn + ' leses som desimaltegn. Mente du ' + desimal + ' kr eller ' +
          tusen + ' kr? Skriv ' + desimal + ' eller ' + deler.join('') + '.' };
      }
      return { ugyldig: true, melding: skilletegn + ' leses som desimaltegn. Mente du ' + tusen +
        ' kr? Bruk mellomrom som tusenskille, eller skriv tallet uten skille.' };
    }
    r = r.replace(',', '.');
    if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(r)) return { ugyldig: true };
    var n = parseFloat(r);
    if (!isFinite(n)) return { ugyldig: true };
    return { verdi: n };
  }

  function settFeil(felt, melding) {
    var input = document.getElementById(felt.id);
    var boks = document.getElementById('feil-' + felt.id);
    var rad = document.getElementById('felt-' + felt.id);
    if (melding) {
      boks.textContent = melding;
      boks.hidden = false;
      rad.classList.add('ugyldig');
      input.setAttribute('aria-invalid', 'true');
    } else {
      boks.textContent = '';
      boks.hidden = true;
      rad.classList.remove('ugyldig');
      input.removeAttribute('aria-invalid');
    }
  }

  function lesAlle() {
    var verdier = {};
    var mangler = [];
    var ugyldige = [];

    function avvis(felt, melding) {
      settFeil(felt, melding);
      ugyldige.push({ navn: felt.navn, melding: melding });
    }

    FELT.forEach(function (felt) {
      var input = document.getElementById(felt.id);
      var res = tolkTall(input.value, felt);

      if (res.tom) {
        settFeil(felt, null);
        if (felt.paakrevd) {
          mangler.push(felt.navn);
        } else {
          verdier[felt.id] = 0;
        }
        return;
      }
      if (res.ugyldig) {
        avvis(felt, res.melding || 'Skriv et tall. Du kan bruke komma eller punktum som desimaltegn.');
        return;
      }
      if (res.verdi < felt.min) {
        avvis(felt, felt.under);
        return;
      }
      if (res.verdi > felt.max) {
        avvis(felt, felt.over);
        return;
      }
      settFeil(felt, null);
      verdier[felt.id] = res.verdi;
    });

    return { verdier: verdier, mangler: mangler, ugyldige: ugyldige };
  }

  /* ---------------------------------------------------------------
     Regnestykket — full presisjon, avrunding kun ved visning
     --------------------------------------------------------------- */
  /* Formel 13: hva en henvendelse kan koste før den gir tap. Den bruker bare tall eieren
     kjenner fra egen drift, og verken budsjett, klikkpris eller honorar. */
  function maksPris(v) {
    return v.snittordre * v.dekningsgrad / 100 * v.salgsRate / 100;
  }

  function kanRegneGrense(v) {
    return 'salgsRate' in v && 'snittordre' in v && 'dekningsgrad' in v;
  }

  function regn(v) {
    var r = {};
    r.klikk = v.budsjett / v.klikkpris;
    r.henvendelser = r.klikk * v.konvRate / 100;
    r.kunder = r.henvendelser * v.salgsRate / 100;
    r.omsetning = r.kunder * v.snittordre;
    r.dekningsbidrag = r.omsetning * v.dekningsgrad / 100;
    r.totalkostnad = v.budsjett + v.honorar;
    r.resultat = r.dekningsbidrag - r.totalkostnad;
    r.roas = r.totalkostnad > 0 ? r.omsetning / r.totalkostnad : null;
    r.roi = r.totalkostnad > 0 ? r.resultat / r.totalkostnad * 100 : null;
    r.prisHenvendelse = r.henvendelser > 0 ? r.totalkostnad / r.henvendelser : null;
    r.prisKunde = r.kunder > 0 ? r.totalkostnad / r.kunder : null;
    var dbPerKunde = v.snittordre * v.dekningsgrad / 100;
    r.kunderNull = dbPerKunde > 0 ? r.totalkostnad / dbPerKunde : null;
    r.maksPrisHenvendelse = maksPris(v);
    return r;
  }

  function settLinje(node, tekst, forklaring, klasse) {
    node.textContent = '';
    node.className = klasse || '';
    node.appendChild(document.createTextNode(tekst));
    if (forklaring) {
      node.appendChild(document.createTextNode(' '));
      var s = document.createElement('span');
      s.className = 'naerforklaring';
      s.textContent = forklaring;
      node.appendChild(s);
    }
  }

  /* ---------------------------------------------------------------
     Tegn resultatet
     --------------------------------------------------------------- */
  function fyllListe(node, elementer) {
    node.textContent = '';
    elementer.forEach(function (tekst) {
      var li = document.createElement('li');
      li.textContent = tekst;
      node.appendChild(li);
    });
  }

  /* Annonseringen ventes litt, slik at skjermleseren ikke leser opp
     et nytt sammendrag for hvert tegn brukeren skriver. */
  var sammendragTimer = null;
  var stille = false;   /* sann under nullstilling som brukeren ikke har utløst */
  function annonser(tekst) {
    if (sammendragTimer) { clearTimeout(sammendragTimer); }
    if (stille) { el.srSammendrag.textContent = ''; return; }
    var eks = gjenvaerendeEksempelfelt();
    if (eks.length > 0) {
      tekst = (eks.length === FELT.length ? 'Regnet med oppdiktede eksempeltall. '
        : eks.length + ' av tallene er fortsatt oppdiktede eksempeltall. ') + tekst;
    }
    sammendragTimer = setTimeout(function () {
      if (el.srSammendrag.textContent !== tekst) { el.srSammendrag.textContent = tekst; }
    }, 700);
  }

  /* Statuslinja er for øyet. Den oppdateres i samme hendelse som resultatet, uten
     pausen sammendraget har, og sier selv fra når eksempeltall står igjen. */
  function settStatus(tekst) {
    el.statusTekst.textContent = (gjenvaerendeEksempelfelt().length > 0 ? 'Eksempeltall · ' : '') + tekst;
  }

  /* Varselruta står så lenge minst ett felt har eksempeltall, og sier hvilke når bare noen står igjen.
     Den oppdateres bare når settet av felt endrer seg, så live-området ikke leser opp det samme for hvert tastetrykk. */
  function oppdaterEksempelVarsel() {
    var eks = gjenvaerendeEksempelfelt();
    var noekkel = eks.join('|');
    if (noekkel === sistVarsel) { return; }
    sistVarsel = noekkel;
    var boks = document.getElementById('eksempelVarsel');
    if (eks.length === 0) { boks.hidden = true; return; }
    var alle = eks.length === FELT.length;
    document.getElementById('eksempelVarselTittel').textContent = alle
      ? 'Dette er oppdiktede eksempeltall' : 'Noen tall er fortsatt oppdiktede eksempeltall';
    document.getElementById('eksempelVarselTekst').textContent = (alle
      ? 'Dette er oppdiktede eksempeltall som viser hvordan kalkulatoren regner.'
      : 'Disse feltene har fortsatt eksempeltall: ' + eks.join(', ') + '.')
      + ' De er ikke bransjetall og sier ingenting om hva du kan forvente. Bytt dem ut med dine egne tall fra annonsekontoen.';
    boks.hidden = false;
  }

  /* Starten på tolkningssetningen: sier fra når eksempeltall står igjen. */
  function medTallene() {
    var eks = gjenvaerendeEksempelfelt();
    if (eks.length === 0) { return 'Med tallene du har lagt inn'; }
    if (eks.length === FELT.length) { return 'Med de oppdiktede eksempeltallene'; }
    return 'Med tallene som står nå, der ' + eks.length + ' fortsatt er oppdiktede eksempeltall,';
  }

  function oppdater() {
    oppdaterEksempelVarsel();
    var lest = lesAlle();
    var antallPaakrevde = FELT.filter(function (f) { return f.paakrevd; }).length;

    if (lest.ugyldige.length > 0 || lest.mangler.length > 0) {
      el.resultatInnhold.hidden = true;
      el.kopiBoks.hidden = true;
      el.kopiStatus.textContent = '';

      var altTomt = lest.ugyldige.length === 0 && lest.mangler.length === antallPaakrevde;

      el.tomTilstand.hidden = !altTomt;
      el.manglerBoks.hidden = altTomt || lest.mangler.length === 0;
      el.feilBoks.hidden = lest.ugyldige.length === 0;

      if (!el.manglerBoks.hidden) { fyllListe(el.manglerListe, lest.mangler); }
      if (!el.feilBoks.hidden) {
        fyllListe(el.feilListe, lest.ugyldige.map(function (f) { return f.navn + ': ' + f.melding; }));
      }

      /* Delvis tilstand: ordreverdi, dekningsgrad og andel til kunde er nok til formel 13. */
      var grense = kanRegneGrense(lest.verdier) ? maksPris(lest.verdier) : null;
      el.grenseBoks.hidden = grense === null;
      if (grense !== null) {
        settLinje(el.grenseTall, kr(grense), grense === 0 ? GRENSE_NULL : null);
        /* Siste setning skal stemme også når alt er fylt inn og bare noe må rettes (f.eks. honoraret). */
        var merket = lest.ugyldige.length === 1 ? 'feltet som er merket' : 'feltene som er merket';
        el.grenseNeste.textContent = lest.mangler.length === 0 ? 'Rett ' + merket + ', så ser du hele regnestykket.'
          : lest.ugyldige.length > 0 ? 'Fyll inn resten av feltene og rett ' + merket + ', så ser du hele regnestykket.'
          : 'Fyll inn resten av feltene for å se hele regnestykket.';
      }
      var grenseTekst = grense === null ? '' : 'Høyeste pris per henvendelse før du taper penger: ' + kr(grense) + '. ';

      if (lest.ugyldige.length > 0) {
        settStatus(lest.ugyldige.length + ' felt må rettes');
      } else if (altTomt) {
        settStatus('Ingen tall fylt inn ennå');
      } else if (grense !== null) {
        settStatus('Maks ' + kr(grense) + ' per henvendelse · mangler ' + lest.mangler.length + ' felt');
      } else {
        settStatus('Mangler ' + lest.mangler.length + ' felt');
      }

      if (altTomt) {
        annonser('Ingen tall er fylt inn ennå.');
      } else if (lest.ugyldige.length > 0) {
        annonser(grenseTekst + 'Kan ikke regne. ' + lest.ugyldige.map(function (f) {
          return f.navn + ': ' + f.melding;
        }).join(' '));
      } else {
        annonser(grenseTekst + 'Kan ikke regne ennå. Disse feltene mangler: ' + lest.mangler.join(', ') + '.');
      }
      return;
    }

    el.tomTilstand.hidden = true;
    el.manglerBoks.hidden = true;
    el.feilBoks.hidden = true;
    el.resultatInnhold.hidden = false;
    el.grenseBoks.hidden = true;

    var v = lest.verdier;
    var r = regn(v);

    settLinje(ut.klikk, formater(avrund(r.klikk, 0), 0), null);
    settLinje(ut.henvendelser, formater(avrund(r.henvendelser, 1), 1), null);
    settLinje(ut.kunder, formater(avrund(r.kunder, 1), 1), null);
    settLinje(ut.omsetning, kr(r.omsetning), null);
    settLinje(ut.dekningsbidrag, kr(r.dekningsbidrag), null);
    settLinje(ut.totalkostnad, kr(r.totalkostnad), null);

    var resVis = avrund(r.resultat, 0);
    settLinje(ut.resultat, kr(r.resultat), resVis > 0 ? 'overskudd' : (resVis < 0 ? 'tap' : 'går i null'),
              resVis > 0 ? 'pos' : (resVis < 0 ? 'neg' : ''));

    if (r.roas === null) {
      settLinje(ut.roas, STREK, 'totalkostnaden er 0 med disse tallene');
    } else {
      settLinje(ut.roas, formater(avrund(r.roas, 2), 2), 'kroner omsetning per krone brukt');
    }

    if (r.roi === null) {
      settLinje(ut.roi, STREK, 'totalkostnaden er 0 med disse tallene');
    } else {
      settLinje(ut.roi, formater(avrund(r.roi, 0), 0) + HARDT_MELLOMROM + '%', null,
                avrund(r.roi, 0) < 0 ? 'neg' : '');
    }

    if (r.prisHenvendelse === null) {
      settLinje(ut.prisHenvendelse, STREK, 'ingen henvendelser med disse tallene');
    } else {
      settLinje(ut.prisHenvendelse, kr(r.prisHenvendelse), null);
    }

    if (r.prisKunde === null) {
      settLinje(ut.prisKunde, STREK, 'ingen kunder med disse tallene');
    } else {
      settLinje(ut.prisKunde, kr(r.prisKunde), null);
    }

    if (r.kunderNull === null) {
      settLinje(ut.kunderNull, STREK, 'dekningsbidraget per kunde er 0 med disse tallene');
    } else {
      settLinje(ut.kunderNull, formater(avrund(r.kunderNull, 1), 1), null);
    }

    settLinje(ut.maksPrisHenvendelse, kr(r.maksPrisHenvendelse),
              r.maksPrisHenvendelse === 0 ? GRENSE_NULL : null);

    settStatus(resVis > 0 ? 'Overskudd ' + kr(r.resultat) + ' i måneden'
      : (resVis < 0 ? 'Tap ' + kr(Math.abs(r.resultat)) + ' i måneden' : 'Går i null'));
    tegnTolkning(r, resVis);
    el.kopiStatus.textContent = '';
    el.kopiBoks.hidden = true;

    annonser('Resultat: ' + (resVis > 0 ? 'overskudd på ' + kr(r.resultat)
      : (resVis < 0 ? 'tap på ' + kr(Math.abs(r.resultat)) : 'går i null'))
      + ' i måneden. Omsetning ' + kr(r.omsetning)
      + ', totalkostnad ' + kr(r.totalkostnad)
      + (r.roas === null ? '' : ', ROAS ' + formater(avrund(r.roas, 2), 2))
      + (r.roi === null ? '' : ', ROI ' + formater(avrund(r.roi, 0), 0) + ' prosent')
      + '. Alle tretten linjene står i resultatlista.');
  }

  function tegnTolkning(r, resVis) {
    var p = el.tolkning;
    p.textContent = '';
    p.className = 'tolkning';

    var stempel = document.createElement('span');
    stempel.className = 'stempel';

    if (resVis > 0) {
      p.classList.add('pos');
      stempel.textContent = 'Overskudd';
      p.appendChild(stempel);
      p.appendChild(document.createTextNode(' '));
      p.appendChild(document.createTextNode(
        medTallene() + ' sitter du igjen med ' + kr(r.resultat) + ' etter at annonser og honorar er betalt.'));
    } else if (resVis < 0) {
      p.classList.add('neg');
      stempel.textContent = 'Tap';
      p.appendChild(stempel);
      p.appendChild(document.createTextNode(' '));
      var tekst = medTallene() + ' taper du ' + kr(Math.abs(r.resultat)) + ' i måneden.';
      if (r.kunderNull !== null) {
        tekst += ' Du må ha ' + formater(avrund(r.kunderNull, 1), 1) + ' kunder for å gå i null.';
      }
      p.appendChild(document.createTextNode(tekst));
    } else {
      p.classList.add('null');
      stempel.textContent = 'I null';
      p.appendChild(stempel);
      p.appendChild(document.createTextNode(' '));
      p.appendChild(document.createTextNode(medTallene() + ' går dette akkurat i null.'));
    }
  }

  /* ---------------------------------------------------------------
     Oppsummering som ren tekst
     --------------------------------------------------------------- */
  /* Brukerens egne tall skal gjengis nøyaktig slik de ble skrevet — ikke avrundet.
     Et regnestykke andre skal kunne etterprøve, må starte med de tallene som ble brukt. */
  function formaterInndata(n) {
    /* toFixed, ikke String: String(0.0000001) gir «1e-7», uten desimalpunktum. */
    var s = Math.abs(n).toFixed(10).replace(/0+$/, '');
    var d = s.length - s.indexOf('.') - 1;
    return formater(n, d);
  }

  /* Hvilke felt står fortsatt med den verdien eksempelknappen la inn?
     Varselruta forsvinner ved første endring, men de andre eksempeltallene
     blir stående — og de skal ikke forlate siden umerket. */
  function gjenvaerendeEksempelfelt() {
    if (!eksempelBrukt) { return []; }
    return FELT.filter(function (felt) {
      return document.getElementById(felt.id).value.trim() === EKSEMPEL[felt.id];
    }).map(function (felt) { return felt.navn; });
  }

  function byggOppsummering() {
    var lest = lesAlle();
    if (lest.ugyldige.length > 0 || lest.mangler.length > 0) { return null; }
    var v = lest.verdier;
    var r = regn(v);
    var L = [];
    var eks = gjenvaerendeEksempelfelt();
    var advarsel = null;

    if (eks.length > 0) {
      advarsel = 'ADVARSEL: ' + (eks.length === FELT.length
        ? 'Alle tallene under er oppdiktede eksempeltall fra kalkulatoren, ikke tall fra en ekte annonsekonto.'
        : eks.length + ' av tallene under er fortsatt oppdiktede eksempeltall fra kalkulatoren, ikke tall fra en ekte annonsekonto: ' + eks.join(', ') + '.')
        + ' De sier ingenting om hva noen kan forvente. Bytt dem ut med ekte tall før dette brukes til noe.';
    }

    L.push('ANNONSEKALKULATOR FOR FACEBOOK OG INSTAGRAM');
    if (advarsel) {
      L.push(advarsel);
    } else {
      L.push('Alle tall er lagt inn av brukeren, eller regnet ut av dem.');
    }
    L.push('');
    L.push(advarsel ? 'TALLENE SOM ER BRUKT' : 'DINE TALL');
    L.push('Annonsebudsjett per måned: ' + formaterInndata(v.budsjett) + HARDT_MELLOMROM + 'kr');
    L.push('Klikkpris: ' + formaterInndata(v.klikkpris) + HARDT_MELLOMROM + 'kr');
    L.push('Andel klikk som blir en henvendelse: ' + formaterInndata(v.konvRate) + HARDT_MELLOMROM + '%');
    L.push('Andel henvendelser som blir kunde: ' + formaterInndata(v.salgsRate) + HARDT_MELLOMROM + '%');
    L.push('Gjennomsnittlig ordreverdi: ' + formaterInndata(v.snittordre) + HARDT_MELLOMROM + 'kr');
    L.push('Dekningsgrad: ' + formaterInndata(v.dekningsgrad) + HARDT_MELLOMROM + '%');
    L.push('Månedlig honorar: ' + formaterInndata(v.honorar) + HARDT_MELLOMROM + 'kr');
    L.push('');
    L.push('RESULTAT');
    L.push('Klikk: ' + formater(avrund(r.klikk, 0), 0));
    L.push('Henvendelser: ' + formater(avrund(r.henvendelser, 1), 1));
    L.push('Kunder: ' + formater(avrund(r.kunder, 1), 1));
    L.push('Omsetning: ' + kr(r.omsetning));
    L.push('Dekningsbidrag: ' + kr(r.dekningsbidrag));
    L.push('Totalkostnad: ' + kr(r.totalkostnad));
    L.push('Resultat: ' + kr(r.resultat) + (avrund(r.resultat, 0) < 0 ? ' (tap)' : (avrund(r.resultat, 0) > 0 ? ' (overskudd)' : ' (går i null)')));
    L.push('ROAS: ' + (r.roas === null ? STREK + ' (totalkostnaden er 0)' : formater(avrund(r.roas, 2), 2)));
    L.push('ROI: ' + (r.roi === null ? STREK + ' (totalkostnaden er 0)' : formater(avrund(r.roi, 0), 0) + HARDT_MELLOMROM + '%'));
    L.push('Pris per henvendelse: ' + (r.prisHenvendelse === null ? STREK + ' (ingen henvendelser med disse tallene)' : kr(r.prisHenvendelse)));
    L.push('Høyeste pris per henvendelse før tap: ' + kr(r.maksPrisHenvendelse) +
      (r.maksPrisHenvendelse === 0 ? ' (' + GRENSE_NULL + ')' : ''));
    L.push('Pris per kunde: ' + (r.prisKunde === null ? STREK + ' (ingen kunder med disse tallene)' : kr(r.prisKunde)));
    L.push('Kunder for å gå i null: ' + (r.kunderNull === null ? STREK + ' (dekningsbidraget per kunde er 0)' : formater(avrund(r.kunderNull, 1), 1)));
    L.push('');
    if (advarsel) {
      L.push(advarsel);
    } else {
      L.push('Kalkulatoren bruker bare tallene som er skrevet inn. Ingen bransjetall er lagt inn.');
    }
    L.push('Den er et regnestykke, ikke et løfte om resultat.');

    return L.join('\n');
  }

  /* ---------------------------------------------------------------
     Kopiering — med fallback når utklippstavla er blokkert
     --------------------------------------------------------------- */
  function kopier(tekst, statusNode, boksNode, tekstNode, knappNode, tillegg) {
    function lykkes() {
      statusNode.textContent = 'Kopiert til utklippstavla.' + (tillegg || '');
      /* Fallback-veien flytter fokus til tekstfeltet. Skjules boksen mens
         fokus står der, mister brukeren plassen sin i tabrekkefølgen. */
      if (knappNode && boksNode.contains(document.activeElement)) { knappNode.focus(); }
      boksNode.hidden = true;
    }
    function feilet() {
      statusNode.textContent = 'Utklippstavla er blokkert her. Teksten står klar under — marker den og kopier med Ctrl+C.' + (tillegg || '');
      tekstNode.value = tekst;
      boksNode.hidden = false;
      tekstNode.focus();
      tekstNode.select();
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(lykkes, function () { proevGammel(); });
    } else {
      proevGammel();
    }

    function proevGammel() {
      var ok = false;
      try {
        tekstNode.value = tekst;
        boksNode.hidden = false;
        tekstNode.select();
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      if (ok) { lykkes(); } else { feilet(); }
    }
  }

  /* ---------------------------------------------------------------
     Hendelser
     --------------------------------------------------------------- */
  FELT.forEach(function (felt) {
    var input = document.getElementById(felt.id);
    input.addEventListener('input', oppdater);
    input.addEventListener('blur', oppdater);
  });

  el.btnEksempel.addEventListener('click', function () {
    FELT.forEach(function (felt) {
      document.getElementById(felt.id).value = EKSEMPEL[felt.id];
      settFeil(felt, null);
    });
    eksempelBrukt = true;
    oppdater();
  });

  el.btnTom.addEventListener('click', function () { nullstillAlt(true); });

  el.btnKopier.addEventListener('click', function () {
    var tekst = byggOppsummering();
    if (tekst === null) {
      el.kopiStatus.textContent = 'Fyll inn alle de påkrevde feltene før du kopierer.';
      el.kopiStatus.classList.remove('advarsel');
      return;
    }
    var eks = gjenvaerendeEksempelfelt();
    el.kopiStatus.classList.toggle('advarsel', eks.length > 0);
    kopier(tekst, el.kopiStatus, el.kopiBoks, el.kopiTekst, el.btnKopier,
      eks.length > 0 ? ' Teksten inneholder fortsatt oppdiktede eksempeltall, og sier det selv øverst.' : '');
  });

  /* ---------------------------------------------------------------
     Feltene skal alltid starte tomme.

     Nullstilling her alene er ikke nok: nettleserens egen gjenoppretting
     av skjemaverdier kjører etter «load» og etter navigering fram/tilbake,
     og ville overskrevet den. Derfor gjøres det tre steder — «autocomplete=off»
     på skjemaet, her ved oppstart, og i «pageshow» som kjører sist.
     Siden påstår at ingenting lagres, og da må det faktisk stemme.
     --------------------------------------------------------------- */
  function nullstillAlt(settFokus) {
    FELT.forEach(function (felt) {
      document.getElementById(felt.id).value = '';
      settFeil(felt, null);
    });
    eksempelBrukt = false;
    el.kopiStatus.textContent = '';
    el.kopiBoks.hidden = true;
    stille = !settFokus;
    oppdater();
    stille = false;
    if (settFokus) { document.getElementById(FELT[0].id).focus(); }
  }

  window.addEventListener('pageshow', function () { nullstillAlt(false); });

  /* Teksten i tomtilstanden lover at vi regner mens brukeren skriver.
     Det løftet kan bare gis når skriptet faktisk kjører. */
  el.tomTilstand.textContent = TOM_TEKST;

  /* Statuslinja har «hidden» i HTML, så den ikke finnes når skriptet ikke kjører. */
  el.statuslinje.hidden = false;

  nullstillAlt(false);
})();
