/**
 * Tests E2E de l'interrupteur « Coupez le courant » du bloc d'accueil
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * L'interrupteur (js/power-switch.js) bascule le bloc d'accueil en « mode
 * panne » : le texte habituel laisse place au message de dépannage, sans
 * modifier la hauteur du bloc ni le titre principal de la page.
 */

import { test, expect } from '@playwright/test';

test.describe('Interrupteur du bloc d\'accueil', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#powerSwitchWrap')).toBeVisible();
    });

    test('la page s\'ouvre allumée', async ({ page }) => {
        const button = page.locator('#powerSwitch');
        await expect(button).toHaveAttribute('role', 'switch');
        await expect(button).toHaveAttribute('aria-checked', 'true');
        await expect(page.locator('.hero')).not.toHaveClass(/is-off/);
        await expect(page.locator('#mainTitle')).toBeVisible();
        await expect(page.locator('.hero-panne')).toBeHidden();
    });

    test('éteindre affiche le message de panne à la place du texte habituel', async ({ page }) => {
        await page.locator('#powerSwitch').click();
        await expect(page.locator('#powerSwitch')).toHaveAttribute('aria-checked', 'false');
        await expect(page.locator('.hero')).toHaveClass(/is-off/);
        await expect(page.locator('.hero-panne')).toBeVisible();
        await expect(page.locator('.hero-panne-title')).toHaveText('Plus de courant ?');
        await expect(page.locator('.hero-main-lit')).toBeHidden();
        await expect(page.locator('#powerSwitchHint')).toHaveText('Rallumez');
        // Le numéro d'appel reste accessible
        await expect(page.locator('.hero .cta-primary')).toBeVisible();
    });

    test('rallumer rétablit le contenu d\'origine', async ({ page }) => {
        const button = page.locator('#powerSwitch');
        await button.click();
        await expect(page.locator('.hero-panne')).toBeVisible();
        await button.click();
        await expect(button).toHaveAttribute('aria-checked', 'true');
        await expect(page.locator('.hero')).not.toHaveClass(/is-off/);
        await expect(page.locator('#mainTitle')).toBeVisible();
        await expect(page.locator('.hero-panne')).toBeHidden();
        await expect(page.locator('#powerSwitchHint')).toHaveText('Coupez le courant');
    });

    test('basculer ne change pas la hauteur du bloc d\'accueil', async ({ page }) => {
        const height = () => page.locator('.hero').evaluate(el => el.offsetHeight);
        const before = await height();
        await page.locator('#powerSwitch').click();
        await expect(page.locator('.hero-panne')).toBeVisible();
        expect(await height()).toBe(before);
    });

    test('fonctionne au clavier', async ({ page }) => {
        const button = page.locator('#powerSwitch');
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-checked', 'false');
        await page.keyboard.press('Space');
        await expect(button).toHaveAttribute('aria-checked', 'true');
    });

    test('le titre principal de la page reste inchangé', async ({ page }) => {
        await expect(page.locator('h1')).toHaveCount(1);
        await page.locator('#powerSwitch').click();
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('#mainTitle')).toHaveText('Électricien à St Médard de Guizières');
    });
});
