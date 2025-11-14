/**
 * Configuration Playwright pour Red Den Connexion
 * Tests end-to-end du site web
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Répertoire des tests
    testDir: './tests/e2e',

    // Timeout par test
    timeout: 30000,

    // Nombre de tentatives en cas d'échec
    retries: 2,

    // Exécution en parallèle
    workers: 1,

    // Reporter
    reporter: [
        ['html'],
        ['list']
    ],

    // Configuration commune à tous les tests
    use: {
        // URL de base (pour les tests locaux)
        baseURL: 'http://localhost:8000',

        // Captures d'écran en cas d'échec
        screenshot: 'only-on-failure',

        // Vidéos en cas d'échec
        video: 'retain-on-failure',

        // Traces en cas d'échec
        trace: 'retain-on-failure',
    },

    // Configuration des projets (navigateurs)
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Décommentez pour tester sur d'autres navigateurs
        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },
        // Tests mobile
        // {
        //     name: 'Mobile Chrome',
        //     use: { ...devices['Pixel 5'] },
        // },
    ],

    // Serveur web local pour les tests (optionnel)
    // Décommentez si vous voulez lancer automatiquement un serveur
    // webServer: {
    //     command: 'python3 -m http.server 8000',
    //     port: 8000,
    //     timeout: 120000,
    //     reuseExistingServer: !process.env.CI,
    // },
});
