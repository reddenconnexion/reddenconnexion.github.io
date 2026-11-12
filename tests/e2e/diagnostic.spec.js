/**
 * Tests E2E du diagnostic express « Une panne ? Que vérifier avant d'appeler »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Le HTML contient les quatre fiches ; js/diagnostic.js n'en affiche qu'une
 * à la fois selon la situation choisie. On vérifie la sélection à la souris
 * et au clavier, la mise en avant de la situation urgente, et le lien avec
 * l'interrupteur du bloc d'accueil.
 */

import { test, expect } from '@playwright/test';

test.describe('Diagnostic express', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-diagnostic].is-ready')).toHaveCount(1);
    });

    test('affiche quatre situations et une seule fiche à la fois', async ({ page }) => {
        await expect(page.locator('#diagnostic [role="tab"]')).toHaveCount(4);
        await expect(page.locator('#diagnostic [role="tabpanel"]')).toHaveCount(4);
        await expect(page.locator('#diagnostic [role="tabpanel"]:visible')).toHaveCount(1);
        // La première situation est sélectionnée à l'ouverture
        await expect(page.locator('#diag-tab-coupure')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#diag-panel-coupure')).toBeVisible();
    });

    test('choisir une situation affiche la fiche correspondante', async ({ page }) => {
        await page.locator('#diag-tab-disjoncteur').click();
        await expect(page.locator('#diag-tab-disjoncteur')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#diag-tab-coupure')).toHaveAttribute('aria-selected', 'false');
        await expect(page.locator('#diag-panel-disjoncteur')).toBeVisible();
        await expect(page.locator('#diag-panel-coupure')).toBeHidden();
        await expect(page.locator('#diag-panel-disjoncteur h3')).toHaveText('Le disjoncteur saute sans arrêt');
        await expect(page.locator('#diag-panel-disjoncteur .diagnostic-steps li')).toHaveCount(3);
    });

    test('la situation dangereuse passe la carte en mode urgence', async ({ page }) => {
        const card = page.locator('.diagnostic-card');
        await expect(card).not.toHaveClass(/is-urgent/);
        await page.locator('#diag-tab-brule').click();
        await expect(card).toHaveClass(/is-urgent/);
        await expect(page.locator('#diag-panel-brule')).toContainText('18 ou 112');
        // Revenir à une situation ordinaire retire le mode urgence
        await page.locator('#diag-tab-prise').click();
        await expect(card).not.toHaveClass(/is-urgent/);
    });

    test('le bouton d\'appel reste affiché quelle que soit la situation', async ({ page }) => {
        const call = page.locator('.diagnostic-call');
        await expect(call).toHaveAttribute('href', 'tel:0695100823');
        for (const id of ['coupure', 'disjoncteur', 'prise', 'brule']) {
            await page.locator(`#diag-tab-${id}`).click();
            await expect(call).toBeVisible();
        }
    });

    test('les flèches du clavier parcourent les situations', async ({ page }) => {
        await page.locator('#diag-tab-coupure').focus();
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('#diag-tab-disjoncteur')).toBeFocused();
        await expect(page.locator('#diag-panel-disjoncteur')).toBeVisible();
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('ArrowUp');
        // Depuis la première, la flèche haut boucle sur la dernière
        await expect(page.locator('#diag-tab-brule')).toBeFocused();
        await expect(page.locator('#diag-panel-brule')).toBeVisible();
        await page.keyboard.press('Home');
        await expect(page.locator('#diag-tab-coupure')).toBeFocused();
        // Une seule situation dans l'ordre de tabulation
        const tabbable = await page.$$eval('#diagnostic [role="tab"]', els => els.filter(el => el.tabIndex === 0).length);
        expect(tabbable).toBe(1);
    });

    test('chaque situation est reliée à sa fiche', async ({ page }) => {
        const pairs = await page.$$eval('#diagnostic [role="tab"]', tabs => tabs.map(tab => {
            const panel = document.getElementById(tab.getAttribute('aria-controls'));
            return !!panel && panel.getAttribute('aria-labelledby') === tab.id;
        }));
        expect(pairs).toEqual([true, true, true, true]);
    });

    test('le mode panne de l\'accueil mène au diagnostic', async ({ page }) => {
        await page.locator('#powerSwitch').click();
        const link = page.locator('.hero-panne-link');
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', '#diagnostic');
        await link.click();
        await expect(page.locator('#diagnostic h2')).toBeInViewport();
    });
});
