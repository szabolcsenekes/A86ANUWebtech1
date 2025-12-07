/* =========================================================
   main.js - Globális és általános funkciók
   ========================================================= */

// 1. RÉSZ: Sima JavaScript (Vanilla JS) - Általános UI elemek
// Ez a blokk az oldal betöltődése után (DOMContentLoaded) fut le.
document.addEventListener('DOMContentLoaded', function () {

    // --- LÁBLÉC ÉVSZÁM ---
    // Automatikusan beállítja az aktuális évet a footerben
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // --- "VISSZA A TETEJÉRE" (To Top) GOMB ---
    const toTop = document.getElementById('toTop');
    if (toTop) {
        // Görgetés figyelése
        window.addEventListener('scroll', () => {
            // Ha 180px-nél lejjebb görgettünk, megjelenítjük (block), egyébként elrejtjük (none)
            toTop.style.display = (window.scrollY > 180) ? 'block' : 'none';
        });

        // Kattintás esemény
        toTop.addEventListener('click', () => {
            // Sima (smooth) görgetés az oldal tetejére
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- NAVIGÁCIÓ HOVER EFFEKT ---
    // Ez egy egyszerű JS alapú stílusmódosítás (bár CSS-ben :hover-rel elegánsabb lenne)
    const navLinks = document.querySelectorAll('#menu ul li a');
    navLinks.forEach(link => {
        // Egér ráhúzáskor kicsit átlátszóbb lesz
        link.addEventListener('mouseover', () => link.style.opacity = '0.8');
        // Egér levételekor visszaáll
        link.addEventListener('mouseout', () => link.style.opacity = '1');
    });
});

/* =========================================================
   2. RÉSZ: jQuery verzió - Űrlap kezelés
   (Megjegyzés: Ez a blokk demonstrálja, hogyan lehetne jQuery-vel megoldani
    a checkbox és a beküldés logikáját.)
   ========================================================= */
$(function () {
    // Elemek kiválasztása jQuery szelektorral ($)
    const $subscribe = $('#subscribe');
    const $emailField = $('#emailField');

    // Csak akkor futtatjuk, ha léteznek ezek az elemek az oldalon
    if ($subscribe.length && $emailField.length) {
        // Kezdetben elrejtjük az email mezőt
        $emailField.hide();

        // Figyeljük a checkbox változását ('change')
        $subscribe.on('change', function () {
            if ($(this).is(':checked')) {
                // Ha bepipálták: animáltan legördül (slideDown)
                $emailField.slideDown(200);
            } else {
                // Ha kivették a pipát: felgördül (slideUp) és töröljük az értéket
                $emailField.slideUp(200);
                $('#voteEmail').val('');
            }
        });
    }

    // Szavazás űrlap beküldésének kezelése (jQuery stílusban)
    $('#voteForm').on('submit', function (e) {
        e.preventDefault(); // Megakadályozzuk az oldal újratöltését

        // Kiválasztott rádiógomb értékének lekérése
        const genre = $('input[name="genre"]:checked').val() || 'nincs kiválasztva';
        const email = $('#voteEmail').val();

        // Üzenet összeállítása
        let msg = `Köszönjük, hogy szavaztál! Kategória: ${genre}`;
        if ($subscribe.is(':checked') && email.trim() !== '') {
            msg += `\nEmail cím: ${email}`;
        }

        alert(msg); // Felugró ablak a felhasználónak
        this.reset(); // Űrlap alaphelyzetbe állítása
        $emailField.slideUp(200); // Email mező elrejtése
    });
});

/* =========================================================
   3. RÉSZ: Vanilla JS verzió - Gyors Szavazás Panel (Quick Vote)
   Ez kezeli a panel megnyitását/bezárását és az űrlap logikáját (jQuery nélkül).
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    // DOM elemek összegyűjtése
    const toggle = document.getElementById('quickvoteToggle');   // Lebegő gomb
    const panel = document.getElementById('quickvotePanel');     // Maga a panel
    const close = document.getElementById('quickvoteClose');     // Bezáró X gomb
    const overlay = document.getElementById('quickvoteOverlay'); // Sötét háttér
    const chk = document.getElementById('subscribe');            // Checkbox
    const emailBx = document.getElementById('emailField');       // Email konténer div
    const emailIn = document.getElementById('voteEmail');        // Email input mező
    const form = document.getElementById('voteForm');            // Az űrlap

    // --- PANEL VEZÉRLÉS (Nyitás / Zárás) ---

    function openPanel() {
        panel.hidden = false;           // Levesszük a hidden attribútumot
        panel.classList.add('open');    // CSS osztály az animációhoz (becsúszás)
        overlay.classList.add('show');  // Sötét háttér megjelenítése
        toggle.setAttribute('aria-expanded', 'true'); // Akadálymentesség (screen reader)

        // Fókuszt helyezünk a panel első interaktív elemére (felhasználói élmény)
        setTimeout(() => panel.querySelector('input,button,select,textarea')?.focus(), 50);
    }

    function closePanel() {
        panel.classList.remove('open');   // Animáció visszafele
        overlay.classList.remove('show'); // Háttér eltüntetése
        toggle.setAttribute('aria-expanded', 'false');

        // Késleltetjük a teljes elrejtést (hidden=true), hogy az animáció lefusson
        setTimeout(() => panel.hidden = true, 250);
    }

    // Eseményfigyelők a panelhez
    toggle?.addEventListener('click', () => {
        // Ha nyitva van, bezárjuk, ha zárva, kinyitjuk
        (toggle.getAttribute('aria-expanded') === 'true') ? closePanel() : openPanel();
    });

    close?.addEventListener('click', closePanel);   // X gombra kattintás
    overlay?.addEventListener('click', closePanel); // Háttérre kattintás (click outside)

    // ESC billentyűre bezárás
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

    // --- FORM LOGIKA (Vanilla JS) ---
    // (Ez ugyanazt csinálja, mint a fenti jQuery rész, de natív JS-sel)

    // Checkbox -> Email mező mutatása/elrejtése
    if (chk && emailBx) {
        emailBx.style.display = 'none'; // Alapból rejtve (inline style)

        chk.addEventListener('change', function () {
            if (this.checked) {
                emailBx.style.display = 'block'; // Megjelenítés
                emailIn?.focus(); // Fókusz az email mezőre
            } else {
                emailBx.style.display = 'none'; // Elrejtés
                if (emailIn) emailIn.value = ''; // Tartalom törlése
            }
        });
    }

    // Űrlap beküldés (Submit)
    form?.addEventListener('submit', function (e) {
        e.preventDefault(); // Nincs újratöltés

        // Adatok kinyerése FormData objektummal
        const genre = (new FormData(form).get('genre')) || 'nincs kiválasztva';
        const email = emailIn?.value?.trim();

        // Visszajelzés
        alert(`Köszönjük a szavazatot!\nKategória: ${genre}${(chk?.checked && email) ? `\nEmail: ${email}` : ''}`);

        // Takarítás
        form.reset();
        if (emailBx) emailBx.style.display = 'none';
        closePanel(); // Panel bezárása sikeres szavazás után
    });
});

/* =========================================================
   4. RÉSZ: Színválasztó (Color Picker)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const picker = document.getElementById("logoColorPicker");
    const logo = document.querySelector(".logo");

    // Ha megtalálhatóak az elemek
    if (picker && logo) {
        // Minden változtatásnál (input esemény) frissítjük a logó színét
        picker.addEventListener("input", (e) => {
            logo.style.color = e.target.value;
        });
    }
});