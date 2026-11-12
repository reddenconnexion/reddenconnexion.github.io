/**
 * Tests E2E du tableau des services
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * js/services-board.js présente la section « Mes Services » comme un tableau
 * électrique : un disjoncteur par carte de service, une fiche affichée à la
 * fois. On vérifie que le contenu d'origine des cartes est conservé, que la
 * sélection fonctionne à la souris et au clavier, et que la page ne saute pas.
 */

import { test, expect } from '@playwright/test';

test.describe('Tableau des services', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#services.services-board.is-ready')).toHaveCount(1);
    });

    test('un disjoncteur par service, une seule fiche affichée', async ({ page }) => {
        const tabs = page.locator('#services [role="tab"]');
        const cards = page.locator('#services .service-card');
        await expect(cards).toHaveCount(7);
        await expect(tabs).toHaveCount(7);
        await expect(page.locator('#services .service-card:visible')).toHaveCount(1);
        // Le premier disjoncteur est enclenché à l'ouverture
        await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
        await expect(tabs.first().locator('.board-breaker-state')).toHaveText('ON');
        await expect(cards.first()).toBeVisible();
    });

    test('les disjoncteurs portent les noms courts des services', async ({ page }) => {
        await expect(page.locator('#services .board-breaker-label')).toHaveText(
            ['Dépannage', 'Rénovation', 'Tableau', 'Solaire', 'Borne VE', 'Clim', 'Caméras']);
    });

    test('enclencher un disjoncteur affiche la fiche du service', async ({ page }) => {
        await page.locator('#service-tab-5').click();
        await expect(page.locator('#service-tab-5')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#service-tab-5 .board-breaker-state')).toHaveText('ON');
        await expect(page.locator('#service-tab-1')).toHaveAttribute('aria-selected', 'false');
        await expect(page.locator('#service-tab-1 .board-breaker-state')).toHaveText('OFF');

        const card = page.locator('#service-panel-5');
        await expect(card).toBeVisible();
        await expect(card.locator('h3')).toHaveText('Prise pour Véhicule Électrique');
        await expect(card.locator('.board-circuit')).toHaveText('Circuit Q5 · sous tension');
        await expect(page.locator('#service-panel-1')).toBeHidden();
    });

    test('le contenu d\'origine des cartes est conservé', async ({ page }) => {
        // Liens « En savoir plus » des sept services
        const hrefs = await page.$$eval('#services .service-card > a', links => links.map(a => a.getAttribute('href')));
        expect(hrefs).toEqual([
            'depannage-urgent.html',
            'renovation-electrique.html',
            'installation-tableau.html',
            'installation-panneaux-photovoltaiques.html',
            'installation-prise-vehicule-electrique.html',
            'installation-climatisation.html',
            'installation-cameras-securite.html',
        ]);
        // Pages locales toujours présentes et cliquables une fois la fiche affichée
        await page.locator('#service-tab-2').click();
        const local = page.locator('#service-panel-2 a[href="renovation-electrique-libourne.html"]');
        await expect(local).toBeVisible();
    });

    test('changer de service ne modifie pas la hauteur de la section', async ({ page }) => {
        const height = () => page.locator('#services').evaluate(el => el.offsetHeight);
        const before = await height();
        for (const n of [2, 4, 7]) {
            await page.locator(`#service-tab-${n}`).click();
            await expect(page.locator(`#service-panel-${n}`)).toBeVisible();
            expect(await height()).toBe(before);
        }
    });

    test('les flèches du clavier parcourent les disjoncteurs', async ({ page }) => {
        await page.locator('#service-tab-1').focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('#service-tab-2')).toBeFocused();
        await expect(page.locator('#service-panel-2')).toBeVisible();
        await page.keyboard.press('End');
        await expect(page.locator('#service-tab-7')).toBeFocused();
        await page.keyboard.press('ArrowRight');
        // Après le dernier, on revient au premier
        await expect(page.locator('#service-tab-1')).toBeFocused();
        await expect(page.locator('#service-panel-1')).toBeVisible();
        const tabbable = await page.$$eval('#services [role="tab"]', els => els.filter(el => el.tabIndex === 0).length);
        expect(tabbable).toBe(1);
    });

    test('chaque disjoncteur est relié à sa fiche', async ({ page }) => {
        const pairs = await page.$$eval('#services [role="tab"]', tabs => tabs.map(tab => {
            const panel = document.getElementById(tab.getAttribute('aria-controls'));
            return !!panel && panel.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === tab.id;
        }));
        expect(pairs).toEqual([true, true, true, true, true, true, true]);
    });

    test('sur téléphone, les noms tiennent sur une ligne sans faire déborder la page', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        await page.locator('#services .board-rail').scrollIntoViewIfNeeded();
        const cut = await page.$$eval('#services .board-breaker-label',
            els => els.filter(el => el.scrollWidth > el.parentElement.clientWidth).length);
        expect(cut).toBe(0);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
    });
});

test.describe('Tableau des services — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('la section garde ses sept cartes visibles', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#services [role="tab"]')).toHaveCount(0);
        await expect(page.locator('#services .service-card')).toHaveCount(7);
        const displayed = await page.$$eval('#services .service-card',
            cards => cards.filter(card => getComputedStyle(card).display !== 'none' && getComputedStyle(card).visibility !== 'hidden').length);
        expect(displayed).toBe(7);
    });
});
