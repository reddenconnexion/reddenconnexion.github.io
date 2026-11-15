/**
 * Tests E2E du carrousel « Ce que je fais pour vous, en images »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Le défilement en boucle (animation CSS translateX -50%) nécessite que chaque
 * rangée contienne ses tuiles EN DOUBLE. Pour faciliter l'ajout de photos de
 * chantiers, les tuiles ne sont écrites qu'UNE seule fois dans index.html : le
 * script js/showcase.js clone automatiquement les tuiles pour créer la boucle.
 *
 * Ces tests vérifient ce que le HTML statique ne peut pas garantir seul :
 * que le clonage a bien lieu et que les copies sont correctes (accessibilité).
 */

import { test, expect } from '@playwright/test';

test.describe('Carrousel d\'images (showcase)', () => {
    test.describe.configure({ mode: 'parallel' });

    test('la section et ses rangées sont présentes', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.showcase')).toBeVisible();
        const rows = page.locator('.showcase-row');
        await expect(rows).toHaveCount(3);
    });

    test('chaque rangée est dupliquée automatiquement pour la boucle', async ({ page }) => {
        await page.goto('/');
        // On attend que le script ait marqué les rangées comme dupliquées
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('.showcase-row');
            return rows.length > 0 &&
                Array.from(rows).every(r => r.dataset.looped === 'true');
        });

        const rows = await page.$$('.showcase-row');
        for (const row of rows) {
            const counts = await row.evaluate(el => {
                // On ne compte que les tuiles directes (pas les <span> internes
                // qui portent aussi aria-hidden sur les icônes)
                const total = el.children.length;
                const visible = el.querySelectorAll(':scope > [role="listitem"]').length;
                const clones = el.querySelectorAll(':scope > [aria-hidden="true"]').length;
                return { total, visible, clones };
            });
            // Chaque tuile d'origine doit avoir exactement une copie
            expect(counts.visible).toBeGreaterThan(0);
            expect(counts.total).toBe(counts.visible * 2);
            expect(counts.clones).toBe(counts.visible);
        }
    });

    test('les images clonées sont masquées aux lecteurs d\'écran (alt vide)', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('.showcase-row');
            return rows.length > 0 &&
                Array.from(rows).every(r => r.dataset.looped === 'true');
        });

        // Toute image à l'intérieur d'une tuile aria-hidden doit avoir un alt vide
        const badClones = await page.$$eval(
            '.showcase-tile[aria-hidden="true"] img',
            imgs => imgs.filter(img => img.getAttribute('alt') !== '').length
        );
        expect(badClones).toBe(0);

        // Les images visibles, elles, doivent garder un alt descriptif
        const visibleImgsWithAlt = await page.$$eval(
            '.showcase-tile[role="listitem"] img',
            imgs => imgs.filter(img => (img.getAttribute('alt') || '').trim() !== '').length
        );
        expect(visibleImgsWithAlt).toBeGreaterThan(0);
    });
});

test.describe('Carrousel — affichage d\'une photo en grand (lightbox)', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll('.showcase-row');
            return rows.length && [...rows].every(r => r.dataset.looped === 'true');
        });
    });

    test('réutilise la lightbox existante (pas de doublon)', async ({ page }) => {
        // Une seule lightbox dans la page : on ne recrée pas un second composant
        await expect(page.locator('.lightbox')).toHaveCount(1);
    });

    test('un clic sur une photo l\'ouvre en grand', async ({ page }) => {
        const tileImg = page.locator('.showcase-tile[role="listitem"] img').first();
        const src = await tileImg.getAttribute('src');
        // La rangée défile en continu : un vrai clic force l'action (le survol met
        // la rangée en pause pour l'utilisateur réel ; Playwright a besoin de force).
        await tileImg.click({ force: true });
        await expect(page.locator('#lightbox.active')).toBeVisible();
        await expect(page.locator('#lightbox-img')).toHaveAttribute('src', src);
        const loaded = await page.locator('#lightbox-img').evaluate(i => i.complete && i.naturalWidth > 0);
        expect(loaded).toBe(true);
    });

    test('se ferme via le bouton ✕ puis via la touche Échap', async ({ page }) => {
        const tileImg = page.locator('.showcase-tile[role="listitem"] img').first();
        await tileImg.click({ force: true });
        await page.locator('#lightboxClose').click();
        await expect(page.locator('#lightbox')).not.toHaveClass(/active/);

        await tileImg.click({ force: true });
        await expect(page.locator('#lightbox.active')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
    });

    test('ne s\'ouvre pas au clic sur une tuile texte', async ({ page }) => {
        await page.locator('.showcase-tile.text[role="listitem"]').first().click({ force: true });
        await expect(page.locator('#lightbox.active')).toHaveCount(0);
    });

    test('affiche un texte de contexte (légende) sous la photo agrandie', async ({ page }) => {
        const tileImg = page.locator('.showcase-tile[role="listitem"] img').first();
        // La légende privilégie data-legende (texte personnalisé), sinon le alt
        const expected = (await tileImg.getAttribute('data-legende'))
            || (await tileImg.getAttribute('alt'));
        expect((expected || '').trim().length).toBeGreaterThan(0);
        await tileImg.click({ force: true });
        const caption = page.locator('#lightbox-caption');
        await expect(caption).toBeVisible();
        await expect(caption).toHaveText(expected);
    });

    test('la galerie existante n\'hérite pas d\'une légende du carrousel', async ({ page }) => {
        // Ouvre une photo du carrousel (légende renseignée), puis ferme
        await page.locator('.showcase-tile[role="listitem"] img').first().click({ force: true });
        await expect(page.locator('#lightbox-caption')).not.toHaveText('');
        await page.locator('#lightboxClose').click();
        // Ouvre une image de la galerie : la légende doit être vidée
        const wrapper = page.locator('.gallery-image-wrapper[data-lightbox]').first();
        await wrapper.scrollIntoViewIfNeeded();
        await wrapper.click();
        await expect(page.locator('#lightbox.active')).toBeVisible();
        await expect(page.locator('#lightbox-caption')).toHaveText('');
    });
});

test.describe('Carrousel — défilement manuel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => document.querySelector('.showcase')?.dataset.manual === 'true');
        await page.locator('.showcase').scrollIntoViewIfNeeded();
    });

    const offset = (page, i = 0) => page.locator('.showcase-row').nth(i).evaluate(
        r => new DOMMatrix(getComputedStyle(r).transform).m41
    );

    test('le défilement automatique continue (piloté par le script)', async ({ page }) => {
        await page.mouse.move(0, 0);
        const a = await offset(page);
        await page.waitForTimeout(600);
        const b = await offset(page);
        expect(b).not.toBe(a);
    });

    test('glisser une rangée à la souris la déplace, sans ouvrir la photo', async ({ page }) => {
        const row = page.locator('.showcase-row').first();
        const box = await row.boundingBox();
        const y = box.y + box.height / 2;
        const before = await offset(page);
        await page.mouse.move(600, y);
        await page.mouse.down();
        await page.mouse.move(500, y, { steps: 5 });
        await page.mouse.move(400, y, { steps: 5 });
        const during = await offset(page);
        await page.mouse.up();
        // Décalage d'environ -200 px (au bouclage près)
        const loop = await row.evaluate(r => r.children[r.children.length / 2].offsetLeft - r.children[0].offsetLeft);
        const moved = ((during - before) % loop + loop) % loop;
        expect(Math.abs(moved - (loop - 200))).toBeLessThan(25);
        await expect(page.locator('#lightbox.active')).toHaveCount(0);
    });

    test('les boutons ‹ › font défiler les rangées', async ({ page }) => {
        const next = page.getByRole('button', { name: /vers la droite/ });
        const prev = page.getByRole('button', { name: /vers la gauche/ });
        await expect(next).toBeVisible();
        await expect(prev).toBeVisible();
        const before = await offset(page);
        await next.click(); // la souris quitte les rangées : défilement auto + poussée
        await page.waitForTimeout(800);
        const after = await offset(page);
        const loop = await page.locator('.showcase-row').first().evaluate(r => r.children[r.children.length / 2].offsetLeft - r.children[0].offsetLeft);
        const moved = ((before - after) % loop + loop) % loop; // déplacement vers la gauche
        expect(moved).toBeGreaterThan(200);
    });
});
