/**
 * Tests E2E du formulaire de contact
 * Red Den Connexion - Électricien St Médard de Guizières
 */

import { test, expect } from '@playwright/test';

test.describe('Formulaire de contact', () => {
    test.beforeEach(async ({ page }) => {
        // Naviguer vers la page d'accueil
        await page.goto('/');

        // Attendre que le formulaire soit visible
        await page.waitForSelector('#contactForm', { state: 'visible' });
    });

    test('affiche le formulaire de contact', async ({ page }) => {
        // Vérifier que le formulaire est présent
        const form = page.locator('#contactForm');
        await expect(form).toBeVisible();

        // Vérifier que tous les champs sont présents
        await expect(page.locator('#name')).toBeVisible();
        await expect(page.locator('#phone')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#city')).toBeVisible();
        await expect(page.locator('#message')).toBeVisible();
        await expect(page.locator('.submit-btn')).toBeVisible();
    });

    test('refuse un nom trop court', async ({ page }) => {
        // Remplir le formulaire avec un nom invalide
        await page.fill('#name', 'A');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Libourne');
        await page.fill('#message', 'Message de test valide pour le formulaire');

        // Soumettre le formulaire
        await page.click('.submit-btn');

        // Vérifier qu'un message d'erreur s'affiche
        const errorMessage = page.locator('#formMessage');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('2');
    });

    test('refuse un numéro de téléphone invalide', async ({ page }) => {
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '123');
        await page.fill('#city', 'Coutras');
        await page.fill('#message', 'Message de test valide pour le formulaire');

        await page.click('.submit-btn');

        const errorMessage = page.locator('#formMessage');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('téléphone');
    });

    test('refuse un email invalide', async ({ page }) => {
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#email', 'email-invalide');
        await page.fill('#city', 'Bordeaux');
        await page.fill('#message', 'Message de test valide pour le formulaire');

        await page.click('.submit-btn');

        const errorMessage = page.locator('#formMessage');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('email');
    });

    test('refuse un message trop court', async ({ page }) => {
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Paris');
        await page.fill('#message', 'Court');

        await page.click('.submit-btn');

        const errorMessage = page.locator('#formMessage');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('10');
    });

    test('accepte un formulaire valide', async ({ page }) => {
        // Mocker la réponse de Formspree pour éviter les vraies soumissions
        await page.route('**/formspree.io/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true })
            });
        });

        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#email', 'jean.dupont@example.com');
        await page.fill('#city', 'St Médard de Guizières');
        await page.fill('#message', 'Bonjour, j\'aurais besoin d\'un devis pour une installation électrique dans ma maison.');

        await page.click('.submit-btn');

        // Vérifier qu'un message de succès s'affiche
        const successMessage = page.locator('#formMessage');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
        await expect(successMessage).toContainText('succès');
    });

    test('affiche tous les champs requis', async ({ page }) => {
        const nameLabel = page.locator('label[for="name"]');
        const phoneLabel = page.locator('label[for="phone"]');
        const cityLabel = page.locator('label[for="city"]');
        const messageLabel = page.locator('label[for="message"]');

        await expect(nameLabel).toBeVisible();
        await expect(phoneLabel).toBeVisible();
        await expect(cityLabel).toBeVisible();
        await expect(messageLabel).toBeVisible();
    });

    test('le champ email est optionnel', async ({ page }) => {
        // Mocker la réponse de Formspree pour éviter les vraies soumissions
        await page.route('**/formspree.io/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true })
            });
        });

        // Remplir le formulaire sans email
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Libourne');
        await page.fill('#message', 'Message de test valide sans email pour vérifier que c\'est bien optionnel.');

        await page.click('.submit-btn');

        // Vérifier qu'un message de succès s'affiche
        const successMessage = page.locator('#formMessage');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
        await expect(successMessage).toContainText('succès');
    });

    test('détecte les tentatives XSS', async ({ page }) => {
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Bordeaux');
        await page.fill('#message', '<script>alert("XSS")</script>');

        await page.click('.submit-btn');

        const errorMessage = page.locator('#formMessage');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('non autorisés');
    });

    test('fonctionne sur mobile', async ({ page }) => {
        // Mocker la réponse de Formspree pour éviter les vraies soumissions
        await page.route('**/formspree.io/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true })
            });
        });

        // Simuler un viewport mobile
        await page.setViewportSize({ width: 375, height: 667 });

        // Vérifier que le formulaire est toujours visible et utilisable
        const form = page.locator('#contactForm');
        await expect(form).toBeVisible();

        // Remplir et soumettre
        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Coutras');
        await page.fill('#message', 'Test sur mobile avec un message suffisamment long.');

        await page.click('.submit-btn');

        // Vérifier qu'un message de succès s'affiche
        const successMessage = page.locator('#formMessage');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
        await expect(successMessage).toContainText('succès');
    });
});

test.describe('Navigation du site', () => {
    test('la page d\'accueil se charge correctement', async ({ page }) => {
        await page.goto('/');

        // Vérifier le titre
        await expect(page).toHaveTitle(/Red Den Connexion/);

        // Vérifier que le header est présent
        const header = page.locator('header');
        await expect(header).toBeVisible();
    });

    test('le menu mobile fonctionne', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Cliquer sur le bouton du menu mobile
        const menuToggle = page.locator('.mobile-menu-toggle');
        if (await menuToggle.isVisible()) {
            await menuToggle.click();

            // Vérifier que le menu s'ouvre
            const mobileMenu = page.locator('.mobile-menu');
            await expect(mobileMenu).toHaveClass(/active/);
        }
    });

    test('les liens de navigation fonctionnent', async ({ page }) => {
        await page.goto('/');

        // Vérifier que les liens principaux sont présents
        const servicesLink = page.locator('a[href*="service"]').first();
        await expect(servicesLink).toBeVisible();
    });
});
