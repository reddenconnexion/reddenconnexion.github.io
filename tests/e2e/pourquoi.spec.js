/**
 * Tests E2E de la section « Pourquoi Me Choisir ? »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Quatre atouts présentés comme des afficheurs (js/pourquoi.js). On vérifie
 * les textes, les valeurs affichées après le défilement des chiffres, et que
 * les deux actions d'origine (fenêtre « 25 ans » et lien vers le dépannage)
 * sont toujours là, désormais utilisables au clavier.
 */

import { test, expect } from '@playwright/test';

test.describe('Pourquoi me choisir', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-pourquoi].is-ready')).toHaveCount(1);
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
        await page.locator('#pourquoi .why-grid').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    });

    test('quatre atouts avec leurs titres', async ({ page }) => {
        await expect(page.locator('#pourquoi .why-item h3')).toHaveText([
            "25 ans d'expérience",
            'Travail aux normes',
            'Plus de 7000 dépannages',
            'Assuré RC Pro & Décennale',
        ]);
    });

    test('les afficheurs défilent jusqu\'à leur valeur', async ({ page }) => {
        const values = page.locator('#pourquoi .why-valeur');
        await expect(values).toHaveText(['25', '15-100', '+7000', '10'], { timeout: 6000 });
        await expect(page.locator('#pourquoi .why-item.is-vu')).toHaveCount(4);
    });

    test('les afficheurs sont décoratifs, les titres portent l\'information', async ({ page }) => {
        const hidden = await page.$$eval('#pourquoi .why-valeur, #pourquoi .why-unite, #pourquoi .why-barres',
            els => els.every(el => el.getAttribute('aria-hidden') === 'true'));
        expect(hidden).toBe(true);
    });

    test('« En savoir plus » ouvre la fenêtre des 25 ans d\'expérience', async ({ page }) => {
        const button = page.locator('#experience-card button.why-lien');
        await expect(button).toHaveText('En savoir plus →');
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#experienceModal')).toBeVisible();
    });

    test('le lien vers les services de dépannage est conservé', async ({ page }) => {
        const link = page.locator('#pourquoi a.why-lien');
        await expect(link).toHaveText('Découvrir mes services →');
        await expect(link).toHaveAttribute('href', 'depannage-urgent.html');
    });

    test('sur téléphone, deux colonnes sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        const columns = await page.locator('#pourquoi .why-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(2);
        const cut = await page.$$eval('#pourquoi .why-unite, #pourquoi .why-valeur', els => els.filter(el => el.scrollWidth > el.parentElement.clientWidth).length);
        expect(cut).toBe(0);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
    });
});

test.describe('Pourquoi me choisir — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('les valeurs finales sont affichées', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#pourquoi .why-valeur')).toHaveText(['25', '15-100', '+7000', '10']);
    });
});
