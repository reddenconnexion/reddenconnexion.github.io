/**
 * Tests E2E du motif « fils électriques » (css/fils.css)
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Trois fils aux couleurs conventionnelles (rouge, bleu, vert/jaune) signent
 * le site : sous les titres de section, en haut du pied de page et entre
 * quelques sections de l'accueil. On vérifie que le motif est bien appliqué
 * sur plusieurs familles de pages et qu'il ne dérange pas la mise en page.
 */

import { test, expect } from '@playwright/test';

const after = (locator, prop) =>
    locator.evaluate((el, p) => getComputedStyle(el, '::after').getPropertyValue(p), prop);
const before = (locator, prop) =>
    locator.evaluate((el, p) => getComputedStyle(el, '::before').getPropertyValue(p), prop);

test.describe('Fils électriques — page d\'accueil', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('les titres de section sont soulignés par les trois fils', async ({ page }) => {
        const title = page.locator('#services h2');
        expect(await after(title, 'background-image')).toContain('data:image/svg+xml');
        expect(await after(title, 'height')).toBe('20px');
        // L'ancien trait rouge lumineux a disparu
        expect(await after(title, 'box-shadow')).toBe('none');
    });

    test('trois nappes de fils séparent des sections, sans ajouter de hauteur', async ({ page }) => {
        const separators = page.locator('.fils-separateur');
        await expect(separators).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            const sep = separators.nth(i);
            await expect(sep).toHaveAttribute('aria-hidden', 'true');
            // Marges négatives égales à la hauteur : la nappe chevauche la jonction
            const extra = await sep.evaluate(el => {
                const s = getComputedStyle(el);
                return el.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
            });
            expect(extra).toBe(0);
        }
    });

    test('le pied de page porte la nappe de fils', async ({ page }) => {
        const footer = page.locator('footer');
        expect(await before(footer, 'background-image')).toContain('data:image/svg+xml');
        expect(await before(footer, 'position')).toBe('absolute');
    });

    test('le motif ne fait pas déborder la page, y compris sur téléphone', async ({ page }) => {
        for (const width of [1280, 360]) {
            await page.setViewportSize({ width, height: 800 });
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
            expect(overflow).toBe(false);
        }
    });

    test('les fils ne gênent pas les clics', async ({ page }) => {
        const values = await page.$$eval('.fils-separateur', els => els.map(el => getComputedStyle(el).pointerEvents));
        expect(values).toEqual(['none', 'none', 'none']);
    });
});

test.describe('Fils électriques — autres pages', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const url of ['/depannage-electrique-coutras.html', '/renovation-electrique.html', '/tarifs-devis.html']) {
        test(`titres et pied de page sur ${url}`, async ({ page }) => {
            await page.goto(url);
            const title = page.locator('[data-faq]').locator('xpath=preceding-sibling::h2[1]');
            expect(await after(title, 'background-image')).toContain('data:image/svg+xml');
            expect(await before(page.locator('footer'), 'background-image')).toContain('data:image/svg+xml');
        });
    }

    test('sur un bandeau d\'appel rouge, le trait d\'origine est conservé', async ({ page }) => {
        await page.goto('/depannage-electrique-coutras.html');
        const title = page.locator('.contact-cta h2').first();
        expect(await after(title, 'height')).toBe('4px');
        expect(await after(title, 'background-image')).toBe('none');
    });

    for (const url of ['/conseils/', '/realisations/', '/mentions-legales.html']) {
        test(`pied de page sur ${url}`, async ({ page }) => {
            await page.goto(url);
            expect(await before(page.locator('footer'), 'background-image')).toContain('data:image/svg+xml');
        });
    }
});
