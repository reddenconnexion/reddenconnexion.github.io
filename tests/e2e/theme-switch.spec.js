/**
 * Interrupteur de design : classique par défaut, alternatif (style bâche) à la demande.
 */
import { test, expect } from '@playwright/test';

const headerBg = page => page.locator('header').evaluate(el => getComputedStyle(el).backgroundImage);

test.describe('Interrupteur de design', () => {
    test('le design classique reste celui par défaut', async ({ page }) => {
        await page.goto('/');
        const btn = page.locator('.design-switch');
        await expect(btn).toHaveAttribute('aria-checked', 'false');
        await expect(btn).toContainText('classique');
        expect(await headerBg(page)).toContain('rgb(26, 26, 26)');
    });

    test('un clic passe au design alternatif, un second revient au classique', async ({ page }) => {
        await page.goto('/');
        const btn = page.locator('.design-switch');
        await btn.click();
        await expect(btn).toHaveAttribute('aria-checked', 'true');
        await expect(btn).toContainText('alternatif');
        await expect.poll(() => headerBg(page)).toContain('rgb(239, 42, 34)');
        await btn.click();
        await expect(btn).toHaveAttribute('aria-checked', 'false');
        await expect.poll(() => headerBg(page)).toContain('rgb(26, 26, 26)');
    });

    test('le choix est conservé d\'une page à l\'autre', async ({ page }) => {
        await page.goto('/');
        await page.locator('.design-switch').click();
        await page.goto('/depannage-urgent.html');
        await expect(page.locator('.design-switch')).toHaveAttribute('aria-checked', 'true');
        await expect.poll(() => headerBg(page)).toContain('rgb(239, 42, 34)');
    });

    test('l\'adresse ?design=alternatif active directement le design alternatif', async ({ page }) => {
        await page.goto('/tarifs-devis.html?design=alternatif');
        await expect(page.locator('.design-switch')).toHaveAttribute('aria-checked', 'true');
        await expect.poll(() => headerBg(page)).toContain('rgb(239, 42, 34)');
    });
});

test.describe('Interrupteur de design — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('le site garde son design classique', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.design-switch')).toHaveCount(0);
        expect(await headerBg(page)).toContain('rgb(26, 26, 26)');
    });
});
