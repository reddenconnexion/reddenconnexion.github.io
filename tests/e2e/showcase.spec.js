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
