/**
 * Tests E2E de la section « Questions Fréquentes »
 * Red Den Connexion - Électricien St Médard de Guizières
 *
 * Chaque question est un bouton avec un interrupteur (js/faq.js) : on vérifie
 * l'ouverture et la fermeture, l'indépendance des questions, le bouton
 * général, le clavier, et que les douze questions et leurs réponses sont
 * toujours là.
 */

import { test, expect } from '@playwright/test';

test.describe('Questions fréquentes', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-faq].is-ready')).toHaveCount(1);
        // La page défile en douceur (scroll-behavior: smooth). Pour les tests on
        // le désactive : sinon Playwright clique pendant que la page bouge encore
        // et le clic peut tomber sur la barre de navigation fixe.
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
        await page.locator('#faq-q2').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    });

    test('douze questions, la première réponse est ouverte', async ({ page }) => {
        await expect(page.locator('#faq .faq-item')).toHaveCount(12);
        await expect(page.locator('#faq .faq-item.is-open')).toHaveCount(1);
        await expect(page.locator('#faq-q1')).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#faq-r1 p')).toBeVisible();
        await expect(page.locator('#faq-r2 p')).toBeHidden();
    });

    test('chaque question garde sa réponse', async ({ page }) => {
        const questions = await page.$$eval('#faq .faq-label', els => els.map(el => el.textContent.replace(/ /g, ' ').trim()));
        expect(questions).toEqual([
            'Intervenez-vous en urgence ?',
            'Proposez-vous un devis gratuit ?',
            'Êtes-vous certifié et assuré ?',
            "Quelle est votre zone d'intervention ?",
            'Quels types de travaux réalisez-vous ?',
            'Combien de temps prend une installation électrique ?',
            'Acceptez-vous les paiements échelonnés ?',
            'Fournissez-vous le matériel électrique ?',
            'Installez-vous des panneaux photovoltaïques en Gironde ?',
            'Installez-vous des bornes de recharge pour véhicules électriques ?',
            'Installez-vous des caméras de sécurité ?',
            'Installez-vous des climatisations ?',
        ]);
        const short = await page.$$eval('#faq .faq-answer p', els => els.filter(el => el.textContent.trim().length < 40).length);
        expect(short).toBe(0);
    });

    test('actionner une question affiche puis masque sa réponse', async ({ page }) => {
        const button = page.locator('#faq-q2');
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#faq-r2 p')).toBeVisible();
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('#faq-r2 p')).toBeHidden();
    });

    test('les questions sont indépendantes', async ({ page }) => {
        await page.locator('#faq-q3').click();
        // Ouvrir la troisième ne referme pas la première
        await expect(page.locator('#faq-r1 p')).toBeVisible();
        await expect(page.locator('#faq-r3 p')).toBeVisible();
        await expect(page.locator('#faq .faq-item.is-open')).toHaveCount(2);
    });

    test('le bouton général allume puis éteint toutes les réponses', async ({ page }) => {
        const master = page.locator('#faq .faq-master');
        await expect(master).toBeVisible();
        await expect(master).toHaveText('Tout allumer');
        await master.click();
        await expect(page.locator('#faq .faq-item.is-open')).toHaveCount(12);
        await expect(master).toHaveText('Tout éteindre');
        await expect(master).toHaveAttribute('aria-pressed', 'true');
        await master.click();
        await expect(page.locator('#faq .faq-item.is-open')).toHaveCount(0);
        await expect(master).toHaveText('Tout allumer');
    });

    test('fonctionne au clavier', async ({ page }) => {
        const button = page.locator('#faq-q2');
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Space');
        await expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('les liens d\'une réponse repliée ne sont pas atteignables', async ({ page }) => {
        // La réponse n°4 contient des liens vers les pages locales
        const link = page.locator('#faq-r4 a').first();
        await expect(link).toBeHidden();
        await page.locator('#faq-q4').click();
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', 'depannage-electrique-libourne.html');
    });

    test('chaque bouton est relié à sa réponse', async ({ page }) => {
        const ok = await page.$$eval('#faq .faq-question', buttons => buttons.every(button => {
            const region = document.getElementById(button.getAttribute('aria-controls'));
            return !!region && region.getAttribute('aria-labelledby') === button.id;
        }));
        expect(ok).toBe(true);
    });

    test('sur téléphone, la section ne fait pas déborder la page', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        await page.locator('#faq .faq-master').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.locator('#faq .faq-master').click();
        await expect(page.locator('#faq .faq-item.is-open')).toHaveCount(12);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow).toBe(false);
    });
});

test.describe('Questions fréquentes — sans JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('toutes les réponses restent affichées', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const hidden = await page.$$eval('#faq .faq-answer p', els => els.filter(el => {
            const box = el.getBoundingClientRect();
            return box.height === 0 || getComputedStyle(el).visibility === 'hidden';
        }).length);
        expect(hidden).toBe(0);
        await expect(page.locator('#faq .faq-master')).toBeHidden();
    });
});

// Les autres pages du site (dépannage par commune, rénovation, installations,
// tarifs) utilisent le même composant : on en contrôle une de chaque famille.
const AUTRES_PAGES = [
    '/depannage-electrique-abzac.html',
    '/depannage-electrique-coutras.html',
    '/depannage-urgent.html',
    '/installation-tableau.html',
    '/renovation-electrique.html',
    '/tarifs-devis.html',
];

test.describe('Questions fréquentes — autres pages', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const url of AUTRES_PAGES) {
        test(`la FAQ fonctionne sur ${url}`, async ({ page }) => {
            await page.goto(url);
            await expect(page.locator('[data-faq].is-ready')).toHaveCount(1);
            await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

            const items = page.locator('[data-faq] .faq-item');
            expect(await items.count()).toBeGreaterThanOrEqual(5);
            // À l'arrivée : seule la première réponse est ouverte
            await expect(page.locator('[data-faq] .faq-item.is-open')).toHaveCount(1);
            await expect(page.locator('#faq-r1 p')).toBeVisible();
            await expect(page.locator('#faq-r2 p')).toBeHidden();

            const second = page.locator('#faq-q2');
            await second.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
            await second.click();
            await expect(second).toHaveAttribute('aria-expanded', 'true');
            await expect(page.locator('#faq-r2 p')).toBeVisible();
            // La première reste ouverte : les questions sont indépendantes
            await expect(page.locator('#faq-r1 p')).toBeVisible();

            // Plus aucune trace de l'ancien mécanisme
            await expect(page.locator('.faq-icon')).toHaveCount(0);
            await expect(page.locator('[onclick*="toggleFaq"]')).toHaveCount(0);
        });
    }
});
