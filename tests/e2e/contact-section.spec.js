/**
 * Tests E2E de la présentation de la section « Contactez-moi »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Le fonctionnement du formulaire lui-même (validation, envoi) est couvert
 * par contact-form.spec.js. Ici on vérifie le bornier des coordonnées et les
 * voyants ajoutés par js/contact.js.
 */

import { test, expect } from '@playwright/test';

test.describe('Section contact', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#contactForm.a-des-voyants')).toHaveCount(1);
    });

    test('le bornier donne les trois moyens de contact', async ({ page }) => {
        const items = page.locator('#contact .contact-item');
        await expect(items).toHaveCount(3);
        await expect(items.nth(0).locator('a')).toHaveAttribute('href', 'tel:0695100823');
        await expect(items.nth(0)).toContainText('06 95 10 08 23');
        await expect(items.nth(1).locator('a')).toHaveAttribute('href', 'mailto:reddenconnexion@gmail.com');
        await expect(items.nth(2)).toContainText('St Médard de Guizières');
        await expect(items.nth(2)).toContainText('33230');
        // Les bornes colorées sont décoratives
        const hidden = await page.$$eval('#contact .contact-borne', els => els.every(el => el.getAttribute('aria-hidden') === 'true'));
        expect(hidden).toBe(true);
    });

    test('un voyant par champ obligatoire, éteints au départ', async ({ page }) => {
        const leds = page.locator('#contactVoyants .contact-voyant');
        await expect(leds).toHaveText(['Nom', 'Téléphone', 'Ville', 'Projet']);
        await expect(page.locator('#contactVoyants .contact-voyant.is-ok')).toHaveCount(0);
        await expect(page.locator('#contactForm')).not.toHaveClass(/is-pret/);
        await expect(page.locator('#contactVoyants')).toHaveAttribute('aria-hidden', 'true');
    });

    test('les voyants s\'allument à mesure que les champs sont remplis', async ({ page }) => {
        const ok = page.locator('#contactVoyants .contact-voyant.is-ok');
        await page.fill('#name', 'Jean Dupont');
        await expect(ok).toHaveCount(1);
        await page.fill('#phone', '06 12 34 56 78');
        await expect(ok).toHaveCount(2);
        await page.fill('#city', 'Coutras');
        await expect(ok).toHaveCount(3);
        await expect(page.locator('#contactForm')).not.toHaveClass(/is-pret/);
        await page.fill('#message', 'Un devis pour un tableau électrique.');
        await expect(ok).toHaveCount(4);
        // Tout est rempli : le bouton passe « sous tension »
        await expect(page.locator('#contactForm')).toHaveClass(/is-pret/);
    });

    test('un champ mal rempli garde son voyant éteint', async ({ page }) => {
        await page.fill('#name', 'A'); // trop court (minlength=2)
        await page.fill('#phone', '12'); // ne respecte pas le format
        await expect(page.locator('#contactVoyants .contact-voyant.is-ok')).toHaveCount(0);
        await page.fill('#name', 'Jean');
        await expect(page.locator('#contactVoyants .contact-voyant').first()).toHaveClass(/is-ok/);
        // Effacer le champ éteint de nouveau le voyant
        await page.fill('#name', '');
        await expect(page.locator('#contactVoyants .contact-voyant').first()).not.toHaveClass(/is-ok/);
    });

    test('le champ e-mail, facultatif, n\'a pas de voyant', async ({ page }) => {
        await page.fill('#email', 'jean.dupont@example.com');
        await expect(page.locator('#contactVoyants .contact-voyant.is-ok')).toHaveCount(0);
    });

    test('sur téléphone, l\'adresse e-mail tient sans faire déborder la page', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
        const lines = await page.locator('#contact a[href^="mailto:"]').evaluate(el => {
            const s = getComputedStyle(el);
            return Math.round(el.getBoundingClientRect().height / parseFloat(s.lineHeight));
        });
        expect(lines).toBe(1);
    });
});

test.describe('Section contact — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('le formulaire reste complet, sans voyants', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#contactVoyants')).toBeHidden();
        for (const id of ['#name', '#phone', '#email', '#city', '#service', '#message']) {
            await expect(page.locator(id)).toHaveCount(1);
        }
        await expect(page.locator('#contactForm .submit-btn')).toHaveText('Envoyer ma demande');
    });
});
