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
