/*
  Mobilmenyen. Uten skript er menyknappen en vanlig lenke til sidelista i footeren, så alle sider
  kan nås også uten JavaScript. Med skript blir den en ekte knapp som åpner menyen:
  - aria-expanded forteller om menyen er åpen
  - fokus flyttes inn i menyen og holdes der (Tab / Shift+Tab går i ring)
  - Esc eller klikk utenfor lukker, og fokus går tilbake til menyknappen
  Om menyen er «mobil» bestemmes av CSS: er knappen synlig, er vi i mobilvisning.
*/
(function () {
  'use strict';

  var topp = document.getElementById('sidetopp');
  var lenke = document.getElementById('menyknapp');
  var meny = document.getElementById('hovedmeny');
  if (!topp || !lenke || !meny) return;

  var tekstApne = lenke.getAttribute('data-tekst-apne');
  var tekstLukk = lenke.getAttribute('data-tekst-lukk');

  var knapp = document.createElement('button');
  knapp.type = 'button';
  knapp.className = lenke.className;
  knapp.id = lenke.id;
  knapp.innerHTML = lenke.innerHTML;
  knapp.setAttribute('aria-expanded', 'false');
  knapp.setAttribute('aria-controls', 'hovedmeny');
  lenke.parentNode.replaceChild(knapp, lenke);
  var knappTekst = knapp.querySelector('.menyknapp-tekst');

  function erSynlig(el) {
    return el.getClientRects().length > 0;
  }

  function erMobil() {
    return erSynlig(knapp);
  }

  function fokuserbare() {
    var liste = Array.prototype.filter.call(meny.querySelectorAll('a[href], button:not([disabled])'), erSynlig);
    return [knapp].concat(liste);
  }

  function erApen() {
    return knapp.getAttribute('aria-expanded') === 'true';
  }

  function apne() {
    topp.classList.add('meny-apen');
    document.documentElement.classList.add('meny-laas');
    knapp.setAttribute('aria-expanded', 'true');
    if (knappTekst) knappTekst.textContent = tekstLukk;
    document.addEventListener('keydown', tast);
    document.addEventListener('click', klikkUtenfor, true);
    var liste = fokuserbare();
    if (liste.length > 1) liste[1].focus();
  }

  function lukk(tilbakeTilKnapp) {
    topp.classList.remove('meny-apen');
    document.documentElement.classList.remove('meny-laas');
    knapp.setAttribute('aria-expanded', 'false');
    if (knappTekst) knappTekst.textContent = tekstApne;
    document.removeEventListener('keydown', tast);
    document.removeEventListener('click', klikkUtenfor, true);
    if (tilbakeTilKnapp && erSynlig(knapp)) knapp.focus();
  }

  function tast(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      lukk(true);
      return;
    }
    if (e.key !== 'Tab') return;
    var liste = fokuserbare();
    var i = liste.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      liste[liste.length - 1].focus();
    } else if (!e.shiftKey && (i === -1 || i === liste.length - 1)) {
      e.preventDefault();
      liste[0].focus();
    }
  }

  function klikkUtenfor(e) {
    if (!topp.contains(e.target)) lukk(false);
  }

  knapp.addEventListener('click', function () {
    if (erApen()) lukk(true);
    else apne();
  });

  // Et klikk på en lenke i menyen (også ankerlenker på samme side) lukker menyen.
  meny.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a') && erApen()) lukk(false);
  });

  // Går vinduet over til desktopvisning mens menyen er åpen, lukkes den uten å flytte fokus.
  window.addEventListener('resize', function () {
    if (erApen() && !erMobil()) lukk(false);
  });
})();
