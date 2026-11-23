// /priser: ekte tall dag for dag (glidebryter + søyler) og «Dette har du etter X måneder». Ingen animasjon (designregel 5).
// Uten JS står tallene for valgt dag, grafen, tabellen og Vekst etter 6 måneder allerede i HTML-en.
(() => {
  const nb = (x) => x.toLocaleString('nb-NO');

  // Faner (Alt i ett / Markedsføring / Nettside), med piltaster og #markedsforing / #nettside i adressen.
  const liste = document.querySelector('.faner');
  if (liste) {
    const faner = [...liste.querySelectorAll('[role="tab"]')];
    const fra = (hash) => faner.find((f) => `#${f.getAttribute('aria-controls')}` === hash);
    // Streken under valgt fane glir mellom fanene (bare transform, se «Bevegelse» i stil.css).
    const strek = Object.assign(document.createElement('span'), { className: 'fane-strek' });
    strek.setAttribute('aria-hidden', 'true');
    liste.append(strek);
    liste.classList.add('har-strek');
    const flytt = () => {
      const f = faner.find((x) => x.getAttribute('aria-selected') === 'true');
      if (f) strek.style.transform = `translate(${f.offsetLeft}px, ${f.offsetTop + f.offsetHeight - liste.offsetHeight}px) scaleX(${f.offsetWidth / 100})`;
    };
    addEventListener('resize', flytt);
    document.fonts?.ready.then(flytt); // fanebredden endrer seg når skriften er lastet
    const velg = (fane, fokus) => {
      for (const f of faner) {
        const pa = f === fane;
        f.setAttribute('aria-selected', pa);
        f.tabIndex = pa ? 0 : -1;
        document.getElementById(f.getAttribute('aria-controls')).hidden = !pa;
      }
      flytt();
      if (fokus) fane.focus();
    };
    liste.hidden = false;
    liste.addEventListener('click', (e) => {
      const f = e.target.closest('[role="tab"]');
      if (!f) return;
      velg(f);
      history.replaceState(null, '', `#${f.getAttribute('aria-controls')}`);
    });
    liste.addEventListener('keydown', (e) => {
      const i = faner.indexOf(document.activeElement);
      const ny = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: faner.length - 1 }[e.key];
      if (i < 0 || ny === undefined) return;
      e.preventDefault();
      velg(faner[(ny + faner.length) % faner.length], true);
    });
    const vedHash = () => { const f = fra(location.hash); if (f) { velg(f); liste.scrollIntoView(); } };
    addEventListener('hashchange', vedHash);
    velg(faner[0]);
    vedHash();
  }

  const r = document.querySelector('.resultat');
  if (r) {
    const dager = JSON.parse(r.dataset.dager);
    const glider = r.querySelector('#res-dag');
    const felt = [...r.querySelectorAll('[data-felt]')];
    const soyler = [...r.querySelectorAll('.soyle')];
    const dag = r.querySelector('.resultat-dag');
    const vis = (i) => {
      const d = dager[i];
      soyler.forEach((s, j) => s.classList.toggle('er-med', j <= i));
      dag.textContent = `Totalt til og med ${d.vis}`;
      glider.setAttribute('aria-valuetext', d.vis);
      for (const f of felt) f.textContent = nb(d[f.dataset.felt]);
    };
    r.querySelector('.resultat-glider').hidden = false;
    glider.addEventListener('input', () => vis(+glider.value));
    soyler.forEach((s, j) => {
      s.addEventListener('pointerenter', () => vis(j));
      s.addEventListener('click', () => { glider.value = j; vis(j); });
    });
    r.querySelector('svg').addEventListener('pointerleave', () => vis(+glider.value));
  }

  // Samme regler som vekstLinjer() i kilde/felles/mal-felles.mjs (hold dem like).
  const flertall = (n, en, flere) => `${n} ${n === 1 ? en : flere}`;
  const linjer = (p, m) => {
    const igjen = p.egenEtter - m;
    return [
      `${m * p.videoer} ferdigklipte videoer`,
      `${m * p.annonser} nye annonser`,
      !p.egenEtter ? p.nettside : igjen <= 0 ? `${p.nettside}, nå din` : `${p.nettside}, din om ${flertall(igjen, 'måned', 'måneder')}`,
      p.uke ? `ca. ${Math.round(m * 52 / 12)} ukesrapporter` : flertall(m, 'månedsrapport', 'månedsrapporter'),
      ...(p.moter ? [`${flertall(m, 'møte', 'møter')} med Roberts`] : []),
      ...(p.postet ? ['Alle videoene lagt ut på Facebook og Instagram for deg'] : []),
    ];
  };

  const v = document.querySelector('.vekstplan');
  if (v) {
    const pakker = JSON.parse(v.dataset.pakker);
    const mnd = v.querySelector('#vp-mnd');
    const tegn = () => {
      const p = pakker.find((x) => x.navn === v.querySelector('input[name="vp-pakke"]:checked').value);
      const m = +mnd.value;
      v.querySelector('#vp-mnd-ut').textContent = m;
      v.querySelector('.vekstplan-tittel').textContent = `Etter ${flertall(m, 'måned', 'måneder')} med ${p.navn} har du:`;
      v.querySelector('.vekstplan-liste').replaceChildren(...linjer(p, m).map((t) => Object.assign(document.createElement('li'), { textContent: t })));
    };
    v.querySelector('.vekstplan-valg').hidden = false;
    v.addEventListener('input', tegn);
  }
})();
