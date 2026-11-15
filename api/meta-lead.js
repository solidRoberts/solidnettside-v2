'use strict';

/*
  Vercel-funksjon: e-post til Roberts når noen sender Meta-skjemaet (hurtigskjema) i Solid-annonsene.
  Laget 15.11.2026. Kopieres til api/meta-lead.js i roten av deploy-repoet solidRoberts/solidnettside-v2.

  Flyt: Meta sender en webhook (felt «leadgen») hit → funksjonen henter selve henvendelsen fra Meta med
  META_LEADS_TOKEN → sender e-post via Resend (samme oppsett som api/kontakt.js).
  Falske kall gir ingen e-post: henvendelsen må finnes hos Meta og tilhøre Solid-siden.

  Miljøvariabler i Vercel (Production):
  - META_LEADS_TOKEN  påkrevd. Sidetoken for Solid-siden (ligger lokalt i meta-api/sidetoken-solid.txt).
  - RESEND_API_KEY    finnes allerede (kontaktskjemaet).
  - KONTAKT_TIL / KONTAKT_FRA  valgfrie, som i api/kontakt.js.

  Oppsett hos Meta (appen «SolidMarketing API/ Hoved», 1109073352131651 → Webhooks → Page):
  callback https://www.solidmarketing.no/api/meta-lead, verify token = VERIFY_TOKEN under, felt «leadgen».
  Siden må også abonnere: POST /1085761464611108/subscribed_apps?subscribed_fields=leadgen (sidetoken).
*/

const SIDE_ID = '1085761464611108';
const VERIFY_TOKEN = 'solid-leadgen-2026-11';
const STANDARD_TIL = 'Roberts@solidmarketing.no';
const STANDARD_FRA = 'Solid Marketing nettside <skjema@solidmarketing.no>';
const GRAPH = 'https://graph.facebook.com/v26.0/';
const RESEND_URL = 'https://api.resend.com/emails';
const LEADS_SENTER = 'https://business.facebook.com/latest/leads_center';

const FELTNAVN = { full_name: 'Navn', phone_number: 'Telefon', email: 'E-post' };
const PLATTFORM = { fb: 'Facebook', ig: 'Instagram' };

function svar(res, status, tekst) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(tekst);
}

async function medTidsavbrudd(url, valg = {}, ms = 8000) {
  const k = new AbortController();
  const t = setTimeout(() => k.abort(), ms);
  try { return await fetch(url, { ...valg, signal: k.signal }); } finally { clearTimeout(t); }
}

async function hentLead(id, token) {
  const felt = 'field_data,created_time,ad_name,adset_name,form_id,platform,is_organic';
  const r = await medTidsavbrudd(`${GRAPH}${encodeURIComponent(id)}?fields=${felt}&access_token=${encodeURIComponent(token)}`);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Meta svarte ${r.status}: ${j.error ? j.error.message : ''}`);
  return j;
}

async function sendEpost(lead, endring) {
  const verdier = {};
  for (const f of lead.field_data || []) verdier[f.name] = (f.values || []).join(', ');
  const linjer = [];
  for (const [nokkel, navn] of Object.entries(FELTNAVN)) if (verdier[nokkel]) linjer.push(`${navn}: ${verdier[nokkel]}`);
  for (const [nokkel, verdi] of Object.entries(verdier)) if (!FELTNAVN[nokkel]) linjer.push(`${nokkel}: ${verdi}`);
  const tid = new Date(lead.created_time || Date.now()).toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });
  const tekst = [
    'Ny henvendelse fra Meta-skjemaet i Solid-annonsene. Ring så fort du kan.', '',
    ...linjer, '',
    `Annonse: ${lead.ad_name || (lead.is_organic ? 'organisk (ikke annonse)' : 'ukjent')}`,
    `Plattform: ${PLATTFORM[lead.platform] || lead.platform || 'ukjent'}`,
    `Mottatt: ${tid}`,
    `Skjema-ID: ${lead.form_id || endring.form_id || ''}`, '',
    `Alle henvendelser: ${LEADS_SENTER}`,
  ].join('\n');
  const navn = (verdier.full_name || '').replace(/[\r\n]+/g, ' ').slice(0, 60);
  const til = (process.env.KONTAKT_TIL || STANDARD_TIL).split(',').map((s) => s.trim()).filter(Boolean);
  const r = await medTidsavbrudd(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.KONTAKT_FRA || STANDARD_FRA,
      to: til,
      subject: `Ny henvendelse fra Meta-skjema${navn ? ': ' + navn : ''}`,
      text: tekst,
    }),
  });
  if (!r.ok) throw new Error(`Resend svarte ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`);
}

module.exports = async function handler(req, res) {
  // Meta bekrefter adressen med et GET-kall når webhooken settes opp.
  if (req.method === 'GET') {
    const q = req.query || {};
    if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === VERIFY_TOKEN) return svar(res, 200, String(q['hub.challenge'] || ''));
    return svar(res, 403, 'Ikke tillatt');
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return svar(res, 405, 'Metoden er ikke tillatt');
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { return svar(res, 400, 'Ugyldig'); } }
  if (!body || body.object !== 'page' || !Array.isArray(body.entry)) return svar(res, 200, 'ok');

  const token = process.env.META_LEADS_TOKEN;
  if (!token || !process.env.RESEND_API_KEY) {
    console.error('meta-lead: META_LEADS_TOKEN eller RESEND_API_KEY mangler');
    return svar(res, 500, 'Ikke satt opp');
  }

  const endringer = [];
  for (const e of body.entry.slice(0, 10)) {
    for (const c of (e.changes || []).slice(0, 10)) {
      if (c.field === 'leadgen' && c.value && String(c.value.page_id || e.id) === SIDE_ID && /^\d{5,25}$/.test(String(c.value.leadgen_id))) endringer.push(c.value);
    }
  }

  let feil = 0;
  for (const endring of endringer) {
    try {
      const lead = await hentLead(String(endring.leadgen_id), token);
      await sendEpost(lead, endring);
      console.log('meta-lead: e-post sendt for', endring.leadgen_id);
    } catch (err) {
      feil++;
      console.error('meta-lead:', endring.leadgen_id, err && err.message);
    }
  }
  // 500 ved feil gjør at Meta prøver igjen senere.
  return svar(res, feil ? 500 : 200, feil ? 'feil' : 'ok');
};
