// js/home.js

// Aszinkron függvény indítása a DOM betöltődése után
document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. ELEMEK KIVÁLASZTÁSA ---
    const grid = document.getElementById('featuredGrid'); // A konténer, ahová a kártyák kerülnek

    // Ha nincs grid (pl. másik oldalon vagyunk), álljunk le, ne fusson tovább a kód
    if (!grid) return;

    // Konfiguráció: Mely játékokat szeretnénk kiemelni a főoldalon?
    // Fontos: A címeknek pontosan egyezniük kell a JSON-ben lévőkkel
    const wantedTitles = ["Path of Exile", "Judgment", "Stardew Valley"];

    // Segédfüggvény: Értékelés alapján visszaad egy osztálynevet (színezéshez)
    const ratingCls = (r) => r >= 8.5 ? 'good' : (r >= 7 ? 'ok' : 'bad');

    // --- 2. MODAL (FELUGRÓ ABLAK) ELEMEK KIVÁLASZTÁSA ---
    // Előre kikeressük az elemeket, hogy ne kelljen minden megnyitáskor újra keresni őket
    const modal = document.getElementById('gameModal');
    const modalClose = modal?.querySelector('.close');
    const mCover = document.getElementById('modalCover');
    const mTitle = document.getElementById('modalTitle');
    const mGenre = document.getElementById('modalGenre');
    const mPubl = document.getElementById('modalPublisher');
    const mPlat = document.getElementById('modalPlatforms');
    const mSum = document.getElementById('modalSummary');

    // --- 3. ADAT BETÖLTÉS (ASZINKRON) ---
    let data = [];
    try {
        // Lekérjük a JSON adatokat
        const res = await fetch('data/games.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data = await res.json();
    } catch (e) {
        // Hibakezelés: Ha nem sikerül betölteni, hibaüzenetet írunk a gridbe
        console.error('Kiemeltek betöltése sikertelen:', e);
        grid.innerHTML = `<article class="featured-card">⚠️ Nem érhető el a játékadatbázis.</article>`;
        return;
    }

    // --- 4. ADATOK ELŐKÉSZÍTÉSE ---

    // Kiválasztjuk a JSON-ből azokat a játékokat, amik szerepelnek a 'wantedTitles' listában
    const selected = wantedTitles
        .map(t => data.find(g => g.title.toLowerCase() === t.toLowerCase()))
        // .filter(Boolean): kiszűri a 'undefined' értékeket (ha egy címet elírtunk volna)
        .filter(Boolean);

    // Létrehozunk egy "Lookup Table"-t (szótárat) a gyors kereséshez
    // Kulcs: slug (pl. "path-of-exile"), Érték: a teljes játék objektum
    // Ez segít majd a modal megnyitásakor azonnal megtalálni az adatot
    const bySlug = Object.fromEntries(data.map(g => [g.slug, g]));

    // --- 5. KÁRTYÁK RENDERELÉSE (KIRAJZOLÁS) ---
    grid.innerHTML = ''; // Töröljük a helyőrzőket

    for (const g of selected) {
        const card = document.createElement('article');
        card.className = 'featured-card';
        const rClass = ratingCls(g.rating);

        // Template literal használata a HTML összeállításához
        // Fontos: A gombnak adunk egy 'data-slug' attribútumot az azonosításhoz
        card.innerHTML = `
            <img src="${g.cover}" alt="${g.title} borító" loading="lazy">
            <h3>${g.title}</h3>
            <div class="featured-meta">${g.genre} • <span class="rating ${rClass}">${g.rating}</span></div>
            <p>${g.summary || ''}</p>
            <div class="featured-actions">
                <button class="btn btn-accent details-btn" data-slug="${g.slug}">Részletek</button>
            </div>
        `;
        grid.appendChild(card);
    }

    // --- 6. MODAL VEZÉRLÉS ---

    // Modal megnyitása és feltöltése adatokkal
    function openModal(g) {
        if (!modal) return;

        // Képek és szövegek beállítása
        mCover.src = g.cover; mCover.alt = `${g.title} borító`;
        mTitle.textContent = g.title;
        mGenre.textContent = g.genre;
        mPubl.textContent = g.publisher;
        mPlat.textContent = g.platforms.join(', ');

        // Leírás kezelése: ha van részletes (details), azt használjuk, különben a rövidet (summary)
        // A .replace(/\n/g, '<br>') lecseréli a sortöréseket HTML <br> tagekre
        mSum.innerHTML = (g.details || g.summary || '').replace(/\n/g, '<br>');

        // Megjelenítés: 'show' osztály hozzáadása (CSS transition kezeli az áttűnést)
        modal.classList.add('show');
        modal.removeAttribute('hidden');

        // Fókusz áthelyezése a bezáró gombra (akadálymentesség miatt fontos)
        setTimeout(() => modalClose?.focus(), 50);
    }

    // Modal bezárása
    function closeModal() {
        modal?.classList.remove('show');
        // Kis késleltetéssel tesszük rá a 'hidden' attribútumot, 
        // hogy a CSS animáció (opacity fade-out) le tudjon futni.
        setTimeout(() => modal?.setAttribute('hidden', ''), 200);
    }

    // --- 7. ESEMÉNY DELEGÁLÁS (EVENT DELEGATION) ---
    // Nem minden egyes "Részletek" gombra teszünk eseménykezelőt,
    // hanem csak a szülő konténerre (grid). Ez hatékonyabb memória szempontból.
    grid.addEventListener('click', (e) => {
        // Megnézzük, hogy amire kattintottunk, az egy .details-btn gomb-e (vagy annak belseje)
        const btn = e.target.closest('.details-btn');
        if (!btn) return; // Ha nem gomb, nem csinálunk semmit

        // Kiolvassuk a slug-ot az attribútumból
        const slug = btn.dataset.slug;

        // Megkeressük az adatot a 'bySlug' táblában
        const g = bySlug[slug];

        if (g) openModal(g); // Ha megvan, nyitjuk a modalt
    });

    // --- 8. BEZÁRÁS ESEMÉNYEK ---
    // Bezárás az 'X' gombbal
    modalClose?.addEventListener('click', closeModal);

    // Bezárás, ha a sötét háttérre (overlay) kattintunk (nem a tartalomra)
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Bezárás az ESC billentyűvel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});