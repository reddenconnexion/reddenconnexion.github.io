/**
 * Tests E2E de la section « Zone d'Intervention » (tableau des départs)
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * On vérifie la liste des communes, sa cohérence avec les données de la
 * carte, les filtres par temps de trajet et le bouton « voir sur la carte ».
 * La carte elle-même (Leaflet, chargée depuis un serveur tiers) n'est pas
 * sollicitée : elle est remplacée par un double pour le dernier test.
 */

import { test, expect } from '@playwright/test';

test.describe('Zone d\'intervention', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        // Pas de dépendance au réseau : on bloque le chargement de la vraie carte
        await page.route(/unpkg\.com|tile\.openstreetmap\.org/, route => route.abort());
        await page.goto('/');
        await expect(page.locator('[data-zone][data-zone-ready="true"]')).toHaveCount(1);
    });

    test('dix-sept communes, triées de la plus proche à la plus lointaine', async ({ page }) => {
        const minutes = await page.$$eval('.zone-depart', rows => rows.map(r => Number(r.dataset.minutes)));
        expect(minutes).toHaveLength(17);
        expect([...minutes].sort((a, b) => a - b)).toEqual(minutes);
        expect(minutes[0]).toBe(6);
        expect(minutes[16]).toBe(45);
    });

    test('la liste est identique aux données de la carte', async ({ page }) => {
        const result = await page.evaluate(() => {
            const fromMap = RDC_CITIES.map(c => `${c.name}|${c.drive}|${c.page}`).sort();
            const fromList = [...document.querySelectorAll('.zone-depart')].map(r =>
                `${r.dataset.ville}|${r.dataset.minutes}|${r.querySelector('a').getAttribute('href')}`).sort();
            return { fromMap, fromList };
        });
        expect(result.fromList).toEqual(result.fromMap);
    });

    test('chaque commune affiche son nom, son temps et mène à sa page', async ({ page }) => {
        const row = page.locator('.zone-depart[data-ville="Coutras"]');
        await expect(row.locator('.zone-depart-nom')).toHaveText('Coutras');
        await expect(row.locator('.zone-depart-temps')).toHaveText('8 min');
        await expect(row.locator('a')).toHaveAttribute('href', 'depannage-electrique-coutras.html');
    });

    test('les filtres limitent la liste par temps de trajet', async ({ page }) => {
        const filters = page.locator('.zone-filtre');
        await expect(filters).toHaveText(['15 min (7)', '30 min (15)', 'Toutes (17)']);
        const visible = page.locator('.zone-depart:visible');

        await filters.nth(0).click();
        await expect(visible).toHaveCount(7);
        await expect(filters.nth(0)).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.zone-depart[data-ville="Blaye"]')).toBeHidden();

        await filters.nth(1).click();
        await expect(visible).toHaveCount(15);
        await expect(filters.nth(0)).toHaveAttribute('aria-pressed', 'false');

        await filters.nth(2).click();
        await expect(visible).toHaveCount(17);
        await expect(page.locator('.zone-depart[data-ville="Blaye"]')).toBeVisible();
    });

    test('sur ordinateur toutes les communes sont affichées à l\'arrivée', async ({ page }) => {
        await expect(page.locator('.zone-depart:visible')).toHaveCount(17);
        await expect(page.locator('.zone-filtre').nth(2)).toHaveAttribute('aria-pressed', 'true');
    });

    test('sans carte, les boutons « voir sur la carte » restent masqués', async ({ page }) => {
        await expect(page.locator('.zone-voir:visible')).toHaveCount(0);
    });

    test('quand la carte est prête, le bouton centre la carte et ouvre la fiche', async ({ page }) => {
        // Double de la carte : on enregistre simplement les appels reçus
        await page.evaluate(() => {
            window.calls = [];
            const markers = {};
            RDC_CITIES.forEach(c => {
                markers[c.name] = {
                    getLatLng: () => c.coords,
                    openPopup: () => window.calls.push('popup:' + c.name),
                };
            });
            window.rdcZone = { map: { setView: (coords, zoom) => window.calls.push('vue:' + coords.join(',') + ':' + zoom) }, markers };
            document.dispatchEvent(new Event('rdc:carte-prete'));
        });
        await expect(page.locator('.zone-voir:visible')).toHaveCount(17);
        const button = page.locator('.zone-depart[data-ville="Libourne"] .zone-voir');
        await expect(button).toHaveAttribute('aria-label', 'Voir Libourne sur la carte');
        await button.dispatchEvent('click');
        const calls = await page.evaluate(() => window.calls);
        expect(calls).toEqual(['vue:44.9167,-0.2333:12', 'popup:Libourne']);
    });
});

test.describe('Zone d\'intervention — téléphone', () => {
    test.use({ viewport: { width: 390, height: 800 } });

    test('la liste commence par les communes à moins de 15 minutes', async ({ page }) => {
        await page.route(/unpkg\.com|tile\.openstreetmap\.org/, route => route.abort());
        await page.goto('/');
        await expect(page.locator('[data-zone][data-zone-ready="true"]')).toHaveCount(1);
        await expect(page.locator('.zone-depart:visible')).toHaveCount(7);
        await expect(page.locator('.zone-filtre').nth(0)).toHaveAttribute('aria-pressed', 'true');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
    });
});

test.describe('Zone d\'intervention — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('les dix-sept communes et leurs liens restent affichés', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.zone-depart a')).toHaveCount(17);
        await expect(page.locator('.zone-filtres')).toBeHidden();
        const hidden = await page.$$eval('.zone-depart', rows => rows.filter(r => getComputedStyle(r).display === 'none').length);
        expect(hidden).toBe(0);
    });
});
