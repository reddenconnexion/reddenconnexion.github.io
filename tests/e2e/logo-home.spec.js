/**
 * Le logo de l'en-tête ramène à la page d'accueil sur toutes les pages.
 */
import { test, expect } from '@playwright/test';

const pages = [
    '/depannage-urgent.html',
    '/tarifs-devis.html',
    '/a-propos.html',
    '/conseils/diagnostic-electrique-avant-vente.html',
    '/realisations/index.html',
];

test.describe('Logo : retour à l\'accueil', () => {
    for (const url of pages) {
        test(`clic sur le logo depuis ${url}`, async ({ page }) => {
            await page.goto(url);
            const link = page.locator('header a.logo-home');
            await expect(link).toHaveAttribute('href', '/');
            await link.locator('img').click();
            await expect(page).toHaveURL(/\/(index\.html)?$/);
        });
    }

    test('sur l\'accueil, le nom de l\'entreprise remonte en haut', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, 3000));
        await page.locator('nav a.company-info').click();
        await expect(page).toHaveURL(/#accueil$/);
    });
});
