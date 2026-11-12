/**
 * Tests E2E du curseur de comparaison « Avant / Après »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Le composant (js/before-after.js + css/before-after.css) affiche deux fois
 * la même image comparative, recadrée à gauche (avant) et à droite (après),
 * et laisse le visiteur faire glisser la séparation. On vérifie ici ce que le
 * HTML statique ne garantit pas : l'initialisation, le glissement à la souris,
 * le clavier, et l'intégration dans les cartes et la photo agrandie.
 */

import { test, expect } from '@playwright/test';

const CASE_PAGE = '/realisations/remplacement-tableau-fusibles-porcelaine-bonzac.html';

// Position courante du curseur (0 à 100), lue sur la variable CSS --ba-pos
const position = (slider) =>
    slider.evaluate(el => parseFloat(el.style.getPropertyValue('--ba-pos')));

// Attend la fin de l'animation d'invite (petit va-et-vient à l'apparition)
const settle = (page) => page.waitForTimeout(1700);

test.describe('Curseur avant/après — étude de cas', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto(CASE_PAGE);
        await page.locator('.ba-slider').scrollIntoViewIfNeeded();
        await expect(page.locator('.ba-slider[data-ba-ready="true"]')).toHaveCount(1);
    });

    test('le comparateur est initialisé avec ses étiquettes et sa poignée', async ({ page }) => {
        const slider = page.locator('.ba-slider');
        await expect(slider.locator('.ba-label-before')).toHaveText('Avant');
        await expect(slider.locator('.ba-label-after')).toHaveText('Après');
        await expect(slider.locator('.ba-knob')).toBeVisible();
        await expect(slider.locator('input[type="range"]')).toHaveAttribute('aria-label', /avant et après/i);
    });

    test('une seule des deux images porte le texte alternatif', async ({ page }) => {
        const alts = await page.$$eval('.ba-slider img', imgs => imgs.map(i => i.getAttribute('alt')));
        expect(alts).toHaveLength(2);
        expect(alts.filter(a => a && a.trim() !== '')).toHaveLength(1);
        await expect(page.locator('.ba-slider .ba-before')).toHaveAttribute('aria-hidden', 'true');
    });

    test('glisser à la souris déplace la séparation', async ({ page }) => {
        const slider = page.locator('.ba-slider');
        await settle(page);
        const box = await slider.boundingBox();
        const y = box.y + box.height / 2;
        await page.mouse.move(box.x + box.width * 0.5, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.8, y, { steps: 5 });
        await page.mouse.up();
        expect(await position(slider)).toBeCloseTo(80, 0);

        // La photo « avant » est découverte sur la même proportion
        const clip = await slider.locator('.ba-before').evaluate(el => getComputedStyle(el).clipPath);
        expect(clip).toContain('inset(');

        await page.mouse.move(box.x + box.width * 0.8, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.1, y, { steps: 5 });
        await page.mouse.up();
        expect(await position(slider)).toBeCloseTo(10, 0);
        // Près du bord, l'étiquette de la photo recouverte s'efface
        await expect(slider).toHaveClass(/ba-near-start/);
    });

    test('la séparation reste dans l\'image même si la souris en sort', async ({ page }) => {
        const slider = page.locator('.ba-slider');
        await settle(page);
        const box = await slider.boundingBox();
        const y = box.y + box.height / 2;
        await page.mouse.move(box.x + box.width * 0.5, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width + 200, y, { steps: 5 });
        await page.mouse.up();
        expect(await position(slider)).toBe(100);
    });

    test('les flèches du clavier déplacent la séparation', async ({ page }) => {
        const slider = page.locator('.ba-slider');
        await settle(page);
        const range = slider.locator('input[type="range"]');
        await range.focus();
        const before = await position(slider);
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        expect(await position(slider)).toBe(before + 2);
        await page.keyboard.press('ArrowLeft');
        expect(await position(slider)).toBe(before + 1);
        await expect(range).toHaveAttribute('aria-valuetext', /% de la photo avant/);
    });
});

test.describe('Curseur avant/après — page d\'accueil', () => {
    test.describe.configure({ mode: 'parallel' });

    test('les cartes avant/après de la galerie sont des comparateurs', async ({ page }) => {
        await page.goto('/');
        const sliders = page.locator('#galleryGrid .ba-slider[data-ba-ready="true"]');
        await expect(sliders).toHaveCount(2);
    });

    test('glisser sur une carte n\'ouvre pas la photo en grand', async ({ page }) => {
        await page.goto('/');
        const slider = page.locator('#galleryGrid .ba-slider').first();
        await slider.scrollIntoViewIfNeeded();
        await settle(page);
        const box = await slider.boundingBox();
        const y = box.y + box.height / 2;
        await page.mouse.move(box.x + box.width * 0.5, y);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.25, y, { steps: 5 });
        await page.mouse.up();
        expect(await position(slider)).toBeCloseTo(25, 0);
        await expect(page.locator('#lightbox.active')).toHaveCount(0);
    });

    test('une tuile avant/après du carrousel s\'ouvre avec le comparateur', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('.showcase-row');
            return rows.length && [...rows].every(r => r.dataset.looped === 'true');
        });
        await page.locator('.showcase-tile[role="listitem"] img[data-avant-apres]').first().click({ force: true });
        await expect(page.locator('#lightbox.active')).toBeVisible();
        const slider = page.locator('#lightbox .ba-slider');
        await expect(slider).toBeVisible();
        await expect(page.locator('#lightbox-img')).toBeHidden();

        // Manipuler le comparateur ne ferme pas la photo agrandie
        await settle(page);
        const box = await slider.boundingBox();
        await page.mouse.click(box.x + box.width * 0.7, box.y + box.height / 2);
        expect(await position(slider)).toBeCloseTo(70, 0);
        await expect(page.locator('#lightbox.active')).toBeVisible();

        // À la fermeture, le comparateur est retiré et l'image fixe redevient disponible
        await page.keyboard.press('Escape');
        await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
        await expect(page.locator('#lightbox .ba-slider')).toHaveCount(0);
        await expect(page.locator('#lightbox')).not.toHaveClass(/ba-open/);
    });

    test('une photo ordinaire du carrousel s\'ouvre toujours en image fixe', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('.showcase-row');
            return rows.length && [...rows].every(r => r.dataset.looped === 'true');
        });
        await page.locator('.showcase-tile[role="listitem"] img:not([data-avant-apres])').first().click({ force: true });
        await expect(page.locator('#lightbox.active')).toBeVisible();
        await expect(page.locator('#lightbox .ba-slider')).toHaveCount(0);
        await expect(page.locator('#lightbox-img')).toBeVisible();
    });
});
