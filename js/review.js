/* =========================================================
   review.js - A Vélemények oldal űrlap kezelése
   ========================================================= */

// jQuery "Document Ready" blokk: Megvárjuk, amíg az oldal betöltődik
$(function () {

    // --- SEGÉDFÜGGVÉNY: HIBAKEZELÉS ---
    // Megjeleníti vagy elrejti a hibát az adott mezőnél
    // $el: az input mező jQuery objektuma
    // $msgEl: a hibaüzenet div jQuery objektuma
    // show: true ha mutatni kell, false ha elrejteni
    const setError = ($el, $msgEl, show = true) => {
        if (show) {
            $el.addClass('error'); // Piros keret hozzáadása (CSS)
            $msgEl.stop(true, true).slideDown(120); // Üzenet legördítése
        } else {
            $el.removeClass('error'); // Piros keret levétele
            $msgEl.stop(true, true).slideUp(120); // Üzenet felgördítése (eltüntetése)
        }
    };

    // --- SEGÉDFÜGGVÉNY: BIZTONSÁG (XSS VÉDELEM) ---
    // "Escape" függvény: A felhasználó által beírt szöveget biztonságossá teszi.
    // Ha valaki <script> kódot írna be, ez átalakítja ártalmatlan szöveggé.
    // Működés: Létrehoz egy div-et, beleteszi szövegként (.text), majd kiveszi HTML-ként (.html).
    const esc = (s) => $('<div/>').text(s).html();

    // --- ŰRLAP BEKÜLDÉS ESEMÉNYKEZELŐ ---
    $('#reviewForm').on('submit', function (e) {
        e.preventDefault(); // Megakadályozzuk, hogy az oldal újratöltődjön

        // Elemek kiválasztása
        const $name = $('#name');
        const $title = $('#title');
        const $review = $('#review');
        const $email = $('#email');
        const $terms = $('#terms');
        // A kiválasztott rádiógomb lekérése
        const $plat = $('input[name="platform"]:checked');

        let valid = true; // Feltételezzük, hogy minden jó, amíg nem találunk hibát

        // --- VALIDÁCIÓS SZABÁLYOK ---

        // 1. Név ellenőrzése (min. 2 karakter)
        // .trim() levágja a szóközöket az elejéről és végéről
        if ($name.val().trim().length < 2) {
            setError($name, $('#err-name'));
            valid = false;
        } else {
            setError($name, $('#err-name'), false);
        }

        // 2. Email ellenőrzése (csak azt nézzük, van-e benne @ jel)
        if (!$email.val().includes('@')) {
            setError($email, $('#err-email'));
            valid = false;
        } else {
            setError($email, $('#err-email'), false);
        }

        // 3. Játék címe (min. 2 karakter)
        if ($title.val().trim().length < 2) {
            setError($title, $('#err-title'));
            valid = false;
        } else {
            setError($title, $('#err-title'), false);
        }

        // 4. Vélemény szövege (min. 5 karakter)
        if ($review.val().trim().length < 5) {
            setError($review, $('#err-review'));
            valid = false;
        } else {
            setError($review, $('#err-review'), false);
        }

        // 5. Platform kiválasztása kötelező
        // Ha a kiválasztott elemek hossza 0, akkor senki nem választott semmit
        if ($plat.length === 0) {
            $('#err-platform').slideDown(120);
            valid = false;
        } else {
            $('#err-platform').slideUp(120);
        }

        // 6. Általános szerződési feltételek (Checkbox)
        if (!$terms.is(':checked')) {
            $('#err-terms').slideDown(120);
            valid = false;
        } else {
            $('#err-terms').slideUp(120);
        }

        // Ha bármi hiba volt, itt megállunk, nem küldjük tovább
        if (!valid) return;

        // --- SIKERES BEKÜLDÉS ---

        // Dinamikus HTML létrehozása az adatokkal (Összefoglaló kártya)
        // Itt használjuk az esc() függvényt a biztonságos megjelenítéshez!
        const $miniCard = $(`
            <div class="card fade-in" style="margin-top:12px;">
                <h3>Beküldött vélemény</h3>
                <p><strong>${esc($name.val())}</strong> - ${esc($title.val())} (${$plat.val()})</p>
                <p>"${esc($review.val())}"</p>
            </div>
        `);

        // Beszúrjuk a kártyát az űrlap után
        $('#reviewForm').after($miniCard);

        // Visszajelző üzenet kiírása
        $('#formMsg').html('<div class="ok-msg">✅ Sikeres beküldés!</div>');

        // Űrlap alaphelyzetbe állítása (mezők törlése)
        this.reset();

        // Maradék vizuális hibaállapotok (piros keretek) eltüntetése
        $('input, textarea').removeClass('error');
        $('.err-msg').hide();
    });

    // --- "MINTA KITÖLTÉSE" GOMB ---
    // Teszteléshez hasznos funkció, egy kattintással kitölti az űrlapot
    $('#fillSample').on('click', function () {
        $('#name').val('Kovács Dániel');
        $('#email').val('daniel.kovacs@example.com');
        $('#title').val('Cyberpunk 2077');
        $('#review').val('A Cyberpunk 2077 egy lenyűgöző világot mutat be, remek grafikával és hangulattal.');

        // Rádiógomb és checkbox bejelölése kódból (.prop)
        $('input[name="platform"][value="PC"]').prop('checked', true);
        $('#terms').prop('checked', true);
    });

    // --- "VISSZAÁLLÍTÁS" (RESET) GOMB ---
    // Ha a felhasználó a Reset gombra kattint, manuálisan is el kell tüntetni a hibaüzeneteket
    $('#resetBtn').on('click', function () {
        $('input, textarea').removeClass('error');
        $('.err-msg').hide();
        $('#formMsg').empty();
    });
});