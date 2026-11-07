'use strict';

/*
  Vercel-funksjon for kontaktskjemaet på solidmarketing.no (/kontakt og /en/contact).
  Sender henvendelsen som e-post via Resend (REST-API, ingen npm). Erstatter FormSubmit, som var nede fra 3.11.2026.
  Bygget på /nettside-skillens kit/api/kontakt.js (i drift på nsservice.no).

  Kopieres til api/kontakt.js i roten av deploy-repoet solidRoberts/solidnettside-v2 (ved siden av public/).

  Miljøvariabler (Vercel → Project → Settings → Environment Variables, Production + Preview):
  - RESEND_API_KEY   påkrevd. Uten den svarer funksjonen 500, og skjemaet viser feilmeldingen med telefonnummer.
  - KONTAKT_TIL      valgfri, mottaker(e) kommaseparert. Standard: Roberts@solidmarketing.no (Google Workspace).
  - KONTAKT_FRA      valgfri, avsender på domenet som er verifisert i Resend. Standard: se STANDARD_FRA.

  Skjemaet (kilde/felles/js/skjema.js) sender JSON med feltnavnene fra kilde/innhold.mjs som nøkler
  («Navn», «Telefon», «E-post», …), pluss Side, _subject, _honey og tid (ms fra siden ble åpnet).
  Svar: { ok: true } ved sendt (eller stille forkastet spam), ellers { ok: false, feil }.
*/

// ===== OPPSETT =====
const DOMENE = 'solidmarketing.no';
const STANDARD_TIL = 'Roberts@solidmarketing.no';
const STANDARD_FRA = 'Solid Marketing nettside <skjema@solidmarketing.no>';
const RING_OSS = 'Ring Roberts på 988 31 492';
// Rekkefølgen her er rekkefølgen i e-posten.
const FELT = [
  { nokkel: 'Navn', maks: 100 },
  { nokkel: 'Telefon', maks: 30 },
  { nokkel: 'E-post', maks: 200 },
  { nokkel: 'Gjelder', maks: 80 },
  { nokkel: 'Bransje', maks: 80 },
  { nokkel: 'Når passer det', maks: 200 },
  { nokkel: 'Melding', maks: 3000 }
];
const STANDARD_EMNE = 'Ny henvendelse fra solidmarketing.no';
// Bare emnene fra innhold.mjs og innhold-en.mjs godtas, så ingen kan sette sitt eget emne.
const TILLATTE_EMNER = [STANDARD_EMNE, 'Ny henvendelse fra solidmarketing.no (engelsk side – svar på engelsk)'];
// Ord som tyder på spam. Solid er et markedsføringsbyrå med engelsk side, så ord som «SEO», «website»
// og «leads» er normale her og står ikke på lista.
const SPAMORD = /\b(backlinks?|guest post|crypto|bitcoin|forex|casino|loans?|viagra|cbd)\b/i;
// ===== SLUTT OPPSETT =====

const RESEND_URL = 'https://api.resend.com/emails';
const TIDSAVBRUDD_MS = 10000;

/*
  Spamfilter i to trinn:
  1. Mangler «tid», eller er den under MIN_UTFYLLING_MS, er det et skript. Forkastes stille med ok-svar.
  2. Innholdet vurderes. 1–2 tegn → «[Mulig spam]» i emnet, men sendes (ingen ekte kunde forsvinner).
     3+ tegn → forkastes stille.
*/
const MIN_UTFYLLING_MS = 2500;
const FORKAST_VED_ANTALL_TEGN = 3;
const LENKE = /(https?:\/\/|www\.|\[url|<a\s)/i;
const FREMMED_SKRIFT = /[Ѐ-ӿ؀-ۿ฀-๿぀-ヿ一-鿿가-힯]/;

function telefonSiffer(telefon) {
  const kompakt = telefon.replace(/[\s().-]/g, '');
  let siffer = kompakt.replace(/\D/g, '');
  if (/^(\+|00)47/.test(kompakt)) siffer = siffer.replace(/^(00)?47/, '');
  return siffer;
}

function spamTegn(v) {
  const tegn = [];
  const fritekst = [v['Navn'], v['Når passer det'], v['Melding']].join(' ');
  if (LENKE.test(fritekst)) tegn.push('lenke i teksten');
  if (FREMMED_SKRIFT.test(fritekst)) tegn.push('utenlandsk skrift');
  if (SPAMORD.test(fritekst)) tegn.push('spamord');
  if (v['Telefon'] && !/^[2-9]\d{7}$/.test(telefonSiffer(v['Telefon']))) tegn.push('ikke norsk telefonnummer');
  return tegn;
}

// Enkel grense per IP (i minnet til instansen; nullstilles ved kald start). Bare gyldige forsøk telles,
// og et forsøk som feiler hos Resend trekkes fra igjen.
const GRENSE_ANTALL = 5;
const GRENSE_VINDU_MS = 10 * 60 * 1000;
const treff = new Map();

function klientIp(req) {
  const h = req.headers || {};
  const ip = h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || 'ukjent';
  return String(ip).trim();
}

function reserverForsok(ip) {
  const na = Date.now();
  const nylige = (treff.get(ip) || []).filter((t) => na - t < GRENSE_VINDU_MS);
  if (treff.size > 5000) {
    for (const [nokkel, tider] of treff) if (!tider.some((t) => na - t < GRENSE_VINDU_MS)) treff.delete(nokkel);
  }
  if (nylige.length >= GRENSE_ANTALL) { treff.set(ip, nylige); return null; }
  nylige.push(na);
  treff.set(ip, nylige);
  return na;
}

function angreForsok(ip, tid) {
  const tider = treff.get(ip);
  if (!tider) return;
  const i = tider.indexOf(tid);
  if (i !== -1) tider.splice(i, 1);
  if (tider.length === 0) treff.delete(ip);
}

// Avviser kall nettleseren merker som sendt fra et annet nettsted.
function fraEgetNettsted(req) {
  const h = req.headers || {};
  const sted = h['sec-fetch-site'];
  if (sted && sted !== 'same-origin') return false;
  if (h.origin) {
    const vert = h['x-forwarded-host'] || h.host;
    try { if (!vert || new URL(h.origin).host !== vert) return false; } catch (e) { return false; }
  }
  return true;
}

// Siden skjemaet ble sendt fra. Bare adresser på eget domene (eller lokal test) tas med i e-posten.
function sideAdresse(verdi) {
  if (typeof verdi !== 'string' || verdi.length > 300) return '';
  try {
    const u = new URL(verdi);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    if (u.hostname === DOMENE || u.hostname.endsWith('.' + DOMENE) || u.hostname.endsWith('.vercel.app') || u.hostname === 'localhost' || u.hostname === '127.0.0.1') return u.href;
  } catch (e) {
    return '';
  }
  return '';
}

function svar(res, status, innhold) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(innhold));
}

const enLinje = (tekst) => String(tekst).replace(/[\r\n]+/g, ' ').trim();

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return svar(res, 405, { ok: false, feil: 'Metoden er ikke tillatt.' });
  }
  if (!fraEgetNettsted(req)) return svar(res, 403, { ok: false, feil: 'Forespørselen ble avvist.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return svar(res, 400, { ok: false, feil: 'Ugyldig forespørsel.' }); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return svar(res, 400, { ok: false, feil: 'Ugyldig forespørsel.' });

  // Honningfelt: skjult felt som bare roboter fyller ut.
  if (typeof body._honey === 'string' && body._honey.trim() !== '') return svar(res, 200, { ok: true });

  const tid = Number(body.tid);
  if (!Number.isFinite(tid) || tid < MIN_UTFYLLING_MS) {
    console.log('kontakt: forkastet, sendt uten å åpne siden eller for raskt');
    return svar(res, 200, { ok: true });
  }

  const v = {};
  for (const f of FELT) {
    const verdi = typeof body[f.nokkel] === 'string' ? body[f.nokkel].trim() : '';
    if (verdi.length > f.maks) return svar(res, 400, { ok: false, feil: `Feltet «${f.nokkel}» er for langt (maks ${f.maks} tegn).` });
    v[f.nokkel] = verdi;
  }
  if (!v['Navn']) return svar(res, 400, { ok: false, feil: 'Fyll inn navnet ditt.' });
  if (!v['Telefon'] && !v['E-post']) return svar(res, 400, { ok: false, feil: 'Fyll inn telefon eller e-post.' });
  if (v['E-post'] && !/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v['E-post'])) return svar(res, 400, { ok: false, feil: 'E-postadressen ser ikke riktig ut.' });
  if (v['Telefon'] && telefonSiffer(v['Telefon']).length < 8) return svar(res, 400, { ok: false, feil: 'Telefonnummeret ser ikke riktig ut.' });

  const tegn = spamTegn(v);
  if (tegn.length >= FORKAST_VED_ANTALL_TEGN) {
    console.log(`kontakt: forkastet som spam (${tegn.join(', ')})`);
    return svar(res, 200, { ok: true });
  }
  const muligSpam = tegn.length > 0;

  const apiNokkel = process.env.RESEND_API_KEY;
  if (!apiNokkel) {
    console.error('kontakt: RESEND_API_KEY er ikke satt');
    return svar(res, 500, { ok: false, feil: 'Skjemaet er ikke satt opp riktig.' });
  }

  const ip = klientIp(req);
  const forsok = reserverForsok(ip);
  if (forsok === null) return svar(res, 429, { ok: false, feil: `Du har sendt flere henvendelser på kort tid. ${RING_OSS}, eller prøv igjen om litt.` });

  const til = (process.env.KONTAKT_TIL || STANDARD_TIL).split(',').map((s) => s.trim()).filter(Boolean);
  const fra = process.env.KONTAKT_FRA || STANDARD_FRA;
  const emne = (muligSpam ? '[Mulig spam] ' : '') + (TILLATTE_EMNER.includes(body._subject) ? body._subject : STANDARD_EMNE);
  const side = sideAdresse(body.Side);
  const linjer = FELT.filter((f) => v[f.nokkel])
    .map((f) => `${f.nokkel}: ${f.nokkel === 'Melding' ? '\n' + v[f.nokkel] : enLinje(v[f.nokkel])}`);
  const tekst = [
    ...(muligSpam ? [`Merket som mulig spam: ${tegn.join(', ')}. Sjekk før du svarer.`, ''] : []),
    `Henvendelse fra kontaktskjemaet på ${DOMENE}.`, '', ...linjer, '',
    ...(side ? [`Sendt fra: ${side}`] : []),
    `Mottatt: ${new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' })}`
  ].join('\n');

  const e_post = { from: fra, to: til, subject: enLinje(emne).slice(0, 180), text: tekst };
  if (v['E-post']) e_post.reply_to = v['E-post'];

  const kontroller = new AbortController();
  const tidtaker = setTimeout(() => kontroller.abort(), TIDSAVBRUDD_MS);
  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiNokkel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(e_post),
      signal: kontroller.signal
    });
    if (!r.ok) {
      const detaljer = await r.text().catch(() => '');
      console.error(`kontakt: Resend svarte ${r.status}: ${detaljer.slice(0, 300)}`);
      angreForsok(ip, forsok);
      return svar(res, 502, { ok: false, feil: 'Henvendelsen kunne ikke sendes akkurat nå.' });
    }
  } catch (feil) {
    console.error('kontakt: klarte ikke å nå Resend:', feil && feil.name);
    angreForsok(ip, forsok);
    return svar(res, 502, { ok: false, feil: 'Henvendelsen kunne ikke sendes akkurat nå.' });
  } finally {
    clearTimeout(tidtaker);
  }
  return svar(res, 200, { ok: true });
};
