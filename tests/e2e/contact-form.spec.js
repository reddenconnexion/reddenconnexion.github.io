/**
 * Tests E2E du formulaire de contact
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Note : la logique de validation (nom, téléphone, email, message, XSS,
 * honeypot) est couverte exhaustivement par les tests unitaires
 * (tests/formValidation.test.js). On ne la re-teste donc PAS ici règle par
 * règle. Ces tests E2E se concentrent sur ce que les tests unitaires ne
 * peuvent pas voir : le rendu réel du formulaire dans le HTML, la validation
 * HTML5 native, et la soumission effective vers Formspree.
 *
 * Comportement réel du formulaire (cf. js/formHandler.js + index.html) :
 *  - Les champs portent les contraintes HTML5 (required / minlength / pattern).
 *    Une saisie invalide est donc bloquée par le navigateur AVANT le JS.
 *  - En cas de saisie valide, le JS exécute validateForm() puis fait un
 *    form.submit() classique (POST) vers Formspree (pas d'AJAX).
 */

import { test, expect } from '@playwright/test';

test.describe('Formulaire de contact', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Fermer le bandeau cookies (comme un vrai visiteur) sinon il
        // recouvre le bouton d'envoi sur petit écran et intercepte les clics
        const acceptCookies = page.locator('.rdc-cb-accept');
        if (await acceptCookies.isVisible().catch(() => false)) {
            await acceptCookies.click();
        }
        await page.waitForSelector('#contactForm', { state: 'visible' });
    });

    test('affiche le formulaire de contact avec tous ses champs', async ({ page }) => {
        // Détecte un id renommé ou un champ supprimé, invisible pour l'unitaire
        await expect(page.locator('#contactForm')).toBeVisible();
        await expect(page.locator('#name')).toBeVisible();
        await expect(page.locator('#phone')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#city')).toBeVisible();
        await expect(page.locator('#message')).toBeVisible();
        await expect(page.locator('.submit-btn')).toBeVisible();
    });

    test('la validation HTML5 native bloque une soumission invalide', async ({ page }) => {
        // Si une requête partait vers Formspree malgré une saisie invalide,
        // c'est que les contraintes HTML5 ont sauté : on le détecte.
        let formspreeCalled = false;
        await page.route('**/formspree.io/**', async route => {
            formspreeCalled = true;
            await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
        });

        await page.fill('#name', 'A'); // minlength=2 -> invalide
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Libourne');
        await page.fill('#message', 'Message de test valide pour le formulaire');

        await page.click('.submit-btn');

        // Le champ nom doit être marqué invalide par le navigateur
        const nameValid = await page.locator('#name').evaluate(el => el.validity.valid);
        expect(nameValid).toBe(false);

        // Et aucune requête ne doit être partie vers Formspree
        await page.waitForTimeout(300);
        expect(formspreeCalled).toBe(false);
    });

    test('soumet les données à Formspree quand le formulaire est valide', async ({ page }) => {
        let postData = null;
        let method = null;
        await page.route('**/formspree.io/**', async route => {
            method = route.request().method();
            postData = route.request().postData();
            await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
        });

        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#email', 'jean.dupont@example.com');
        await page.fill('#city', 'St Médard de Guizières');
        await page.fill('#message', 'Bonjour, j\'aurais besoin d\'un devis pour une installation électrique dans ma maison.');

        await page.click('.submit-btn');

        // La soumission réelle (POST Formspree) doit partir avec les bonnes données
        await expect.poll(() => postData, { timeout: 5000 }).not.toBeNull();
        expect(method).toBe('POST');
        expect(postData).toContain('Jean');
        expect(postData).toContain('jean.dupont');
    });

    test('fonctionne sur mobile', async ({ page }) => {
        let formspreeCalled = false;
        await page.route('**/formspree.io/**', async route => {
            formspreeCalled = true;
            await route.fulfill({ status: 200, contentType: 'text/html', body: 'OK' });
        });

        await page.setViewportSize({ width: 375, height: 667 });

        await expect(page.locator('#contactForm')).toBeVisible();

        await page.fill('#name', 'Jean Dupont');
        await page.fill('#phone', '06 12 34 56 78');
        await page.fill('#city', 'Coutras');
        await page.fill('#message', 'Test sur mobile avec un message suffisamment long.');

        await page.click('.submit-btn');

        await expect.poll(() => formspreeCalled, { timeout: 5000 }).toBe(true);
    });
});

test.describe('Message de confirmation après envoi', () => {
    test.describe.configure({ mode: 'parallel' });

    // Formspree redirige (via _next) vers une URL contenant success=true.
    // On vérifie que le message de confirmation s'affiche bien, quel que soit
    // l'emplacement du paramètre (fragment ou query string).
    test('affiche le message de succès quand success=true est dans le fragment', async ({ page }) => {
        await page.goto('/#contact?success=true');

        const successMessage = page.locator('#formMessage');
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText('succès');
    });

    test('affiche le message de succès quand success=true est dans la query string', async ({ page }) => {
        await page.goto('/?success=true');

        const successMessage = page.locator('#formMessage');
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText('succès');
    });

    test('n\'affiche pas de message de succès sans le paramètre', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#contactForm', { state: 'visible' });

        await expect(page.locator('#formMessage')).toBeHidden();
    });
});

test.describe('Navigation du site', () => {
    test.describe.configure({ mode: 'parallel' });

    test('la page d\'accueil se charge correctement', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Red Den Connexion/);
        await expect(page.locator('header')).toBeVisible();
    });

    test('le menu mobile s\'ouvre', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        const menuToggle = page.locator('#mobileMenuBtn');
        await expect(menuToggle).toBeVisible();

        await menuToggle.click();
        await expect(page.locator('#menu')).toHaveClass(/active/);
    });

    test('les liens de navigation sont présents', async ({ page }) => {
        await page.goto('/');
        const servicesLink = page.locator('a[href*="service"]').first();
        await expect(servicesLink).toBeVisible();
    });
});
