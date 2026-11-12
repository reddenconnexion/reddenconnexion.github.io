/**
 * Configuration Jest pour Red Den Connexion
 */

export default {
    // Utiliser l'environnement Node pour les tests
    testEnvironment: 'node',

    // Chercher les fichiers de test
    testMatch: [
        '**/tests/**/*.test.js'
    ],

    // Activer la transformation des modules ES6
    transform: {},

    // Couverture de code
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/main.js', // Exclure le point d'entrée
        '!js/formHandler.js', // Exclure le handler UI (testé via E2E)
        '!js/cookie-banner.js', // Exclure le bandeau cookies (DOM/localStorage, testé via E2E)
        '!js/showcase.js', // Exclure le carrousel d'images (manipulation du DOM, testé via E2E)
        '!js/before-after.js', // Exclure le curseur avant/après (manipulation du DOM, testé via E2E)
        '!js/power-switch.js', // Exclure l'interrupteur de l'accueil (manipulation du DOM, testé via E2E)
        '!js/diagnostic.js', // Exclure le diagnostic express (manipulation du DOM, testé via E2E)
        '!**/node_modules/**'
    ],

    // Seuils de couverture
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Affichage verbose pour plus de détails
    verbose: true
};
