/**
 * Tests E2E du motif « fils électriques » (css/fils.css)
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Trois fils aux couleurs conventionnelles (rouge, bleu, vert/jaune) signent
 * le site sous les titres de section, et un fil fin sous le menu se charge
 * en rouge quand on descend dans la page. On vérifie que le motif est bien appliqué
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

    test('plus de fils ondulés entre les sections ni au pied de page', async ({ page }) => {
        await expect(page.locator('.fils-separateur')).toHaveCount(0);
        expect(await before(page.locator('footer'), 'content')).toBe('none');
    });

    test('le fil sous le menu se charge à mesure que l\'on descend', async ({ page }) => {
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
        const wire = page.locator('header .fil-progression');
        await expect(wire).toHaveCount(1);
        await expect(wire).toHaveAttribute('aria-hidden', 'true');
        const fill = () => page.locator('.fil-progression-courant').evaluate(el => {
            const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
            return m.a;
        });
        expect(await fill()).toBe(0);
        await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2));
        await expect.poll(fill).toBeGreaterThan(0.45);
        expect(await fill()).toBeLessThan(0.55);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await expect.poll(fill).toBeGreaterThan(0.99);
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect.poll(fill).toBe(0);
    });

    test('le motif ne fait pas déborder la page, y compris sur téléphone', async ({ page }) => {
        for (const width of [1280, 360]) {
            await page.setViewportSize({ width, height: 800 });
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
            expect(overflow).toBe(false);
        }
    });

    test('le fil ne gêne pas les clics du menu', async ({ page }) => {
        expect(await page.locator('.fil-progression').evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    });
});

test.describe('Fils électriques — autres pages', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const url of ['/depannage-electrique-coutras.html', '/renovation-electrique.html', '/tarifs-devis.html']) {
        test(`titres et fil de progression sur ${url}`, async ({ page }) => {
            await page.goto(url);
            const title = page.locator('[data-faq]').locator('xpath=preceding-sibling::h2[1]');
            expect(await after(title, 'background-image')).toContain('data:image/svg+xml');
            await expect(page.locator('header .fil-progression')).toHaveCount(1);
        });
    }

    test('sur un bandeau d\'appel rouge, le trait d\'origine est conservé', async ({ page }) => {
        await page.goto('/depannage-electrique-coutras.html');
        const title = page.locator('.contact-cta h2').first();
        expect(await after(title, 'height')).toBe('4px');
        expect(await after(title, 'background-image')).toBe('none');
    });

    for (const url of ['/conseils/', '/realisations/']) {
        test(`fil de progression sur ${url}`, async ({ page }) => {
            await page.goto(url);
            await expect(page.locator('header .fil-progression')).toHaveCount(1);
        });
    }
});
