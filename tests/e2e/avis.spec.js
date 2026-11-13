/**
 * Tests E2E de la section « Ils Me Font Confiance » (avis clients)
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Le HTML contient tous les avis ; js/avis.js n'en affiche qu'un à la fois et
 * ajoute les commandes (voyants, boutons précédent / suivant). On vérifie le
 * défilement à la souris, au clavier et par balayage, la stabilité de la
 * hauteur, et la conservation des liens vers Google.
 */

import { test, expect } from '@playwright/test';

test.describe('Avis clients', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-avis].is-ready')).toHaveCount(1);
        // La page défile en douceur (scroll-behavior: smooth). Pour les tests on
        // le désactive : sinon Playwright clique pendant que la page bouge encore
        // et le clic peut tomber sur la barre de navigation fixe.
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
        // On centre les commandes à l'écran, loin de la barre de navigation (en
        // haut) et du bandeau cookies (en bas).
        await page.locator('#avis .avis-nav').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    });

    test('six avis, un seul affiché, un voyant par avis', async ({ page }) => {
        await expect(page.locator('#avis .avis-slide')).toHaveCount(6);
        await expect(page.locator('#avis .avis-slide:visible')).toHaveCount(1);
        await expect(page.locator('#avis .avis-led')).toHaveCount(6);
        await expect(page.locator('#avis .avis-led[aria-current="true"]')).toHaveCount(1);
        await expect(page.locator('#avis .avis-count')).toHaveText('01 / 06');
    });

    test('chaque avis garde son texte et son auteur', async ({ page }) => {
        const authors = await page.$$eval('#avis .avis-author', els => els.map(el => el.firstChild.textContent.trim()));
        expect(authors.sort()).toEqual([
            'Aurélie Léglise', 'David Maugue', 'Florent Rodriguez',
            'Happyfrenchbuddha 21stsanctuary', 'Mireille Flechard', 'Sylvia Randria',
        ]);
        const empty = await page.$$eval('#avis .avis-slide blockquote', els => els.filter(el => el.textContent.trim().length < 10).length);
        expect(empty).toBe(0);
    });

    test('les boutons font défiler les avis, en boucle', async ({ page }) => {
        const slides = page.locator('#avis .avis-slide');
        await expect(slides.nth(0)).toBeVisible();
        await page.locator('#avis .avis-next').click();
        await expect(slides.nth(1)).toBeVisible();
        await expect(slides.nth(0)).toBeHidden();
        await expect(page.locator('#avis .avis-count')).toHaveText('02 / 06');
        await page.locator('#avis .avis-prev').click();
        await page.locator('#avis .avis-prev').click();
        // Avant le premier, on repart du dernier
        await expect(slides.nth(5)).toBeVisible();
        await expect(page.locator('#avis .avis-count')).toHaveText('06 / 06');
        await page.locator('#avis .avis-next').click();
        await expect(slides.nth(0)).toBeVisible();
    });

    test('un voyant affiche directement son avis', async ({ page }) => {
        const leds = page.locator('#avis .avis-led');
        await leds.nth(3).click();
        await expect(page.locator('#avis .avis-slide').nth(3)).toBeVisible();
        await expect(leds.nth(3)).toHaveAttribute('aria-current', 'true');
        await expect(leds.nth(0)).not.toHaveAttribute('aria-current', 'true');
    });

    test('les flèches du clavier font défiler les avis', async ({ page }) => {
        await page.locator('#avis .avis-next').focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('#avis .avis-slide').nth(1)).toBeVisible();
        await page.keyboard.press('ArrowLeft');
        await expect(page.locator('#avis .avis-slide').nth(0)).toBeVisible();
    });

    test('balayer le texte passe à l\'avis suivant ou précédent', async ({ page }) => {
        const list = page.locator('#avis .avis-slides');
        await list.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const box = await list.boundingBox();
        const y = box.y + box.height / 2;
        // Vers la gauche : avis suivant
        await page.mouse.move(box.x + box.width * 0.7, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.3, y, { steps: 5 });
        await page.mouse.up();
        await expect(page.locator('#avis .avis-slide').nth(1)).toBeVisible();
        // Vers la droite : avis précédent
        await page.mouse.move(box.x + box.width * 0.3, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.7, y, { steps: 5 });
        await page.mouse.up();
        await expect(page.locator('#avis .avis-slide').nth(0)).toBeVisible();
    });

    test('changer d\'avis ne modifie pas la hauteur de la section', async ({ page }) => {
        const height = () => page.locator('#avis').evaluate(el => el.offsetHeight);
        const before = await height();
        for (let i = 0; i < 6; i++) {
            await page.locator('#avis .avis-next').click();
            expect(await height()).toBe(before);
        }
    });

    test('la note et les liens vers Google sont présents', async ({ page }) => {
        await expect(page.locator('#avis .avis-meter-score')).toHaveText('5,0');
        await expect(page.locator('#avis .avis-meter-count')).toContainText('51 avis vérifiés');
        const all = page.locator('#avis .avis-cta').first();
        await expect(all).toContainText('Voir tous les avis');
        await expect(all).toHaveAttribute('href', /google\.com\/search/);
        const leave = page.locator('#avis .avis-cta-primary');
        await expect(leave).toContainText('Laisser mon avis');
        await expect(leave).toHaveAttribute('href', 'https://g.page/r/Cd-M3iSxzhgcEBM/review');
    });

    test('la photo a un texte alternatif', async ({ page }) => {
        const alt = await page.locator('#avis .avis-photo img').getAttribute('alt');
        expect((alt || '').trim().length).toBeGreaterThan(10);
    });

    test('sur téléphone, la section ne fait pas déborder la page', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        await page.locator('#avis .avis-nav').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await expect(page.locator('#avis .avis-next')).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
    });
});

test.describe('Avis clients — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('tous les avis restent affichés', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#avis .avis-nav')).toHaveCount(0);
        const displayed = await page.$$eval('#avis .avis-slide',
            els => els.filter(el => getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden').length);
        expect(displayed).toBe(6);
    });
});
