// js/games.js

// Megvárjuk, amíg a teljes DOM (HTML szerkezet) betöltődik
// Az 'async' kulcsszó jelzi, hogy aszinkron műveleteket (adatletöltés) végzünk benne
document.addEventListener('DOMContentLoaded', async function () {

  // --- 1. DOM ELEMEK KIVÁLASZTÁSA ---
  // Ezekkel az elemekkel fogunk dolgozni
  const tbody = document.querySelector('#gamesTable tbody'); // Ide kerülnek a sorok
  const details = document.querySelector('.details');        // Ide kerülnek a kártyák
  const searchInput = document.getElementById('search');     // Keresőmező
  const clearBtn = document.getElementById('clear');         // Törlés gomb
  const addBtn = document.getElementById('addSample');       // Minta hozzáadása gomb
  const genreRadios = document.querySelectorAll('input[name="genre"]'); // Műfaj választók

  // Biztonsági ellenőrzés: ha nincs táblázat vagy details konténer, kilépünk (ne dobjon hibát más oldalon)
  if (!tbody || !details) return;

  // Segédfüggvény: Értékelés alapján visszaad egy CSS osztálynevet (színezéshez)
  // 8.5 felett 'good', 7 és 8.5 között 'ok', alatta 'bad'
  const ratingCls = (r) => r >= 8.5 ? 'good' : (r >= 7 ? 'ok' : 'bad');

  // --- 2. ADATOK LETÖLTÉSE (FETCH) ---
  let data = [];
  try {
    // A fetch() lekéri a games.json tartalmát
    // cache: 'no-store' -> Fejlesztésnél hasznos, hogy ne gyorsítótárazza a böngésző a régi adatot
    const res = await fetch('data/games.json', { cache: 'no-store' });

    // Ha a szerver hibát jelez (pl. 404), dobunk egy hibát
    if (!res.ok) throw new Error('HTTP ' + res.status);

    // A választ JSON-ként értelmezzük
    data = await res.json();
  } catch (e) {
    // HIBAKEZELÉS: Ha nem sikerül betölteni, kiírunk egy üzenetet a táblázatba
    console.error('Nem sikerült betölteni a games.json-t:', e);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding:14px; color:#f6e05e;">
          ⚠️ Nem sikerült betölteni a játéklistát (games.json). Ellenőrizd: fut-e helyi szerver, és a <code>data/games.json</code> elérhető-e.
        </td>
      </tr>`;
    return; // Kilépünk, mert nincs adat
  }



  // --- 3. TÁBLÁZAT GENERÁLÁSA ---
  function fillTable(list) {
    tbody.innerHTML = ''; // Előző tartalom törlése (hogy ne duplázzuk meg)

    for (const g of list) {
      // Új sor (tr) létrehozása
      const tr = document.createElement('tr');

      // Metaadatok (dataset) beállítása a szűréshez
      // Így később könnyen el tudjuk dönteni, hogy meg kell-e jeleníteni a sort
      tr.setAttribute('data-genre', g.genre);
      tr.dataset.title = g.title.toLowerCase();
      tr.dataset.genre = g.genre.toLowerCase();
      tr.id = g.slug; // Horgony ID (hogy a link ide ugorjon)

      // A cellák (td) HTML tartalmának összeállítása
      // A ratingCls függvény itt színezi be az értékelést
      tr.innerHTML = `
        <td class="cover"><img src="${g.cover}" alt="${g.title} borító" loading="lazy"></td>
        <td><a href="#${g.slug}-card">${g.title}</a></td>
        <td>${g.genre}</td>
        <td>${g.publisher}</td>
        <td>${g.release_date}</td>
        <td><span class="rating ${ratingCls(g.rating)}">${g.rating}</span></td>
      `;
      tbody.appendChild(tr); // Hozzáadás a táblázathoz
    }
  }

  // --- 4. RÉSZLETES KÁRTYÁK GENERÁLÁSA ---
  // Ugyanazt az adatot használjuk, csak más formátumban (kártyák) jelenítjük meg a táblázat alatt
  function fillCards(list) {
    details.innerHTML = '';
    for (const g of list) {
      const card = document.createElement('article');
      card.className = 'card';
      card.id = `${g.slug}-card`; // Egyedi ID a horgonyzáshoz

      card.innerHTML = `
        <img src="${g.cover}" alt="${g.title} borító nagyban" loading="lazy">
        <h3>${g.title}</h3>
        <p>${g.summary || ''}</p>
        <ul>
          <li>Műfaj: ${g.genre}</li>
          <li>Platformok: ${g.platforms.join(', ')}</li>
          <li>Kiadó/fejlesztő: ${g.publisher}</li>
          <li>Megjelenés: ${g.release_date}</li>
        </ul>
      `;
      details.appendChild(card);
    }
  }

  // --- 5. KEZDETI KIRAJZOLÁS ---
  // Rendezés: a legfrissebb játékok kerüljenek előre (csökkenő sorrend dátum szerint)
  data.sort((a, b) => b.release_date.localeCompare(a.release_date));

  // Megjelenítés meghívása
  fillTable(data);
  fillCards(data);

  // --- 6. SZŰRÉS LOGIKA (KERESÉS + MŰFAJ) ---
  function applyFilter() {
    // Kiolvassuk a keresőmezőt (kisbetűsítve, szóközöket levágva)
    const q = (searchInput?.value || '').toLowerCase().trim();

    // Megnézzük, melyik rádiógomb van bejelölve
    const checked = document.querySelector('input[name="genre"]:checked');
    const genre = (checked ? checked.value : '').toLowerCase();

    // Végigmegyünk az összes soron a táblázatban
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(tr => {
      // Kiolvassuk a sorhoz tartozó adatokat (amiket a dataset-be mentettünk)
      const titleText = tr.dataset.title || '';
      const rowGenre = tr.dataset.genre || '';

      // Ellenőrzés: tartalmazza-e a keresett szöveget ÉS egyezik-e a műfaj?
      const matchText = (q === '' || titleText.includes(q));
      const matchGenre = (genre === '' || rowGenre.includes(genre));

      // Ha mindkettő igaz, megjelenítjük, egyébként elrejtjük (display: none)
      tr.style.display = (matchText && matchGenre) ? '' : 'none';
    });
  }

  // Eseményfigyelők csatolása:
  // Minden gépelésnél (input) fusson le a szűrés
  searchInput?.addEventListener('input', applyFilter);
  // Minden rádiógomb váltásnál (change) fusson le a szűrés
  genreRadios.forEach(r => r.addEventListener('change', applyFilter));

  // --- 7. TÖRLÉS GOMB ---
  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''; // Kereső ürítése

    // "Mind" (üres value) rádiógomb kiválasztása
    const all = document.querySelector('input[name="genre"][value=""]');
    if (all) all.checked = true;

    applyFilter(); // Szűrés frissítése (minden megjelenik)
  });

  // --- 8. MINTA SOR HOZZÁADÁSA (DOM MANIPULÁCIÓ) ---
  addBtn?.addEventListener('click', () => {
    const tr = document.createElement('tr');

    // Adatok beállítása (hardcoded példa)
    tr.setAttribute('data-genre', 'RPG');
    tr.dataset.title = 'Arcane Trials'.toLowerCase();
    tr.dataset.genre = 'RPG'.toLowerCase();

    tr.innerHTML = `
      <td class="cover"><img src="assets/arcanetrials.jpg" alt="Arcane Trials borító" loading="lazy"></td>
      <td><a href="#arcane-trials-card">Arcane Trials</a></td>
      <td>RPG</td>
      <td>Sifermi</td>
      <td>2018-09-20</td>
      <td><span class="rating ok">7.5</span></td>
    `;

    // Animáció előkészítése: átlátszó
    tr.style.opacity = '0';
    tr.style.transition = 'opacity .3s ease';

    tbody.appendChild(tr);

    // Következő képkockánál (render után) áttűnés megjelenítése
    requestAnimationFrame(() => tr.style.opacity = '1');

    applyFilter(); // Ha épp szűrünk, lehet, hogy el kell rejteni az újat
    showNotice('✅ Új minta sor hozzáadva!'); // Értesítés
  });

  // --- 9. FELUGRÓ ÉRTESÍTÉS (TOAST) ---
  function showNotice(msg) {
    // Megnézzük, létezik-e már a notice elem, ha nem, létrehozzuk
    let notice = document.querySelector('.notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'notice'; // CSS-ben van formázva
      document.body.appendChild(notice);
    }

    notice.textContent = msg;
    notice.classList.add('show'); // Megjelenítés (CSS transform)

    // 2.5 másodperc múlva eltüntetjük
    setTimeout(() => notice.classList.remove('show'), 2500);
  }
});