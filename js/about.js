/* =========================================================
    about.js - A Rólunk oldal specifikus szkriptjei
   ========================================================= */

// 1. RÉSZ: jQuery "Document Ready" blokk
// Ez a kód akkor fut le, amikor a DOM (a HTML szerkezet) betöltődött.
$(function () {

  // --- CSAPAT KÁRTYÁK ANIMÁCIÓJA (Staggered Fade-in) ---
  // Kiválasztjuk az összes .member osztályú elemet (a dolgozók kártyáit)
  $('.member')
    .css({ opacity: 0 }) // Kezdőállapot: teljesen átlátszó (láthatatlan)
    .each(function (i, el) {
      // Végigiterálunk minden elemen. 
      // i = index (hányadik elem), el = maga a HTML elem.

      // setTimeout: Késleltetést állítunk be az animáció indításához.
      // 120 * i: Az első 0ms, a második 120ms, a harmadik 240ms múlva indul...
      // Ez hozza létre a "lépcsőzetes" megjelenést.
      setTimeout(() => {
        // .animate: 180 milliszekundum alatt átlátszatlanra (opacity: 1) váltjuk
        $(el).animate({ opacity: 1 }, 180);
      }, 120 * i);
    });

  // --- ALTERNATÍV GYIK LOGIKA (jQuery) ---
  // Ez a blokk egy másik típusú HTML szerkezethez készült (ahol aria-expanded van).
  // A te HTML kódodban a lenti Vanilla JS megoldás fog működni, de ezt is kommenteltem:
  $('.faq-toggle').on('click', function () {
    const $btn = $(this);                  // A megkattintott gomb
    const id = $btn.attr('aria-controls'); // Melyik elem tartozik hozzá (ID alapján)
    const $p = $('#' + id);                // A válasz bekezdés kiválasztása

    // Megnézzük, hogy jelenleg nyitva van-e (stringként kapjuk vissza, hogy 'true')
    const expanded = $btn.attr('aria-expanded') === 'true';

    // Megfordítjuk az állapotot az attribútumban (true <-> false)
    $btn.attr('aria-expanded', !expanded);

    if (expanded) {
      // Ha eddig nyitva volt -> bezárjuk (slideUp animáció) és elrejtjük (hidden)
      $p.slideUp(150, () => $p.attr('hidden', true));
    } else {
      // Ha zárva volt -> levesszük a hiddent és lenyitjuk (slideDown animáció)
      $p.hide().attr('hidden', false).slideDown(150);
    }
  });
});

// 2. RÉSZ: Vanilla JavaScript (Sima JS) megoldás
// Ez illeszkedik a korábbi HTML (<div class="faq-item">) és CSS (.active) kódhoz.
document.addEventListener('DOMContentLoaded', () => {

  // Kiválasztjuk az összes kérdés-válasz konténert
  const faqs = document.querySelectorAll('.faq-item');

  faqs.forEach(item => {
    // Megkeressük az adott elemen belüli kérdés gombot
    const question = item.querySelector('.faq-question');

    // Figyeljük a kattintást a kérdésen
    question.addEventListener('click', () => {

      // Megvizsgáljuk, hogy az aktuális elem nyitva van-e már
      if (item.classList.contains('active')) {
        // Ha igen, akkor bezárjuk (levesszük az active osztályt)
        item.classList.remove('active');
      } else {
        // Ha nem volt nyitva, akkor kinyitjuk, DE előtte:

        // 1. lépés: Bezárjuk az ÖSSZES többi elemet
        // (Így biztosítjuk, hogy egyszerre csak egy legyen nyitva - "harmonika" effekt)
        faqs.forEach(f => f.classList.remove('active'));

        // 2. lépés: Hozzáadjuk az 'active' osztályt a kattintotthoz
        // A CSS-ben ez jeleníti meg a választ (display: block) és forgatja el a nyilat.
        item.classList.add('active');
      }
    });
  });
});