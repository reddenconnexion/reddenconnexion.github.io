# Documentation des Tests - Red Den Connexion

Ce document explique comment utiliser l'infrastructure de tests mise en place pour le site Red Den Connexion.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Tests Unitaires (Jest)](#tests-unitaires-jest)
4. [Tests E2E (Playwright)](#tests-e2e-playwright)
5. [Pipeline CI/CD](#pipeline-cicd)
6. [Structure des Tests](#structure-des-tests)

## 🎯 Vue d'ensemble

L'infrastructure de tests comprend :

- **Tests unitaires** : Valident la logique du formulaire (validation, détection XSS, anti-spam)
- **Tests E2E** : Simulent un utilisateur réel sur le site
- **Pipeline CI/CD** : Exécute automatiquement les tests sur chaque modification
- **Couverture de code** : Mesure quel pourcentage du code est testé

### Statistiques

- ✅ **52 tests unitaires** (100% de réussite)
- ✅ **10 tests E2E** pour le formulaire et la navigation
- ✅ **Couverture de code cible** : 80%+

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

Pour Playwright (tests E2E), installer les navigateurs :

```bash
npx playwright install chromium
```

## 🧪 Tests Unitaires (Jest)

Les tests unitaires vérifient le bon fonctionnement de chaque fonction JavaScript.

### Exécuter les tests

```bash
# Tous les tests
npm test

# Tests en mode "watch" (re-exécute automatiquement)
npm run test:watch

# Tests avec rapport de couverture
npm run test:coverage
```

### Ce qui est testé

#### Validation du nom
- ✅ Accepte 2-100 caractères
- ❌ Refuse < 2 ou > 100 caractères
- ✅ Gère les espaces

#### Validation du téléphone
- ✅ Formats acceptés : `0612345678`, `06 12 34 56 78`, `+33612345678`
- ❌ Refuse les numéros invalides

#### Validation de l'email
- ✅ Formats standard
- ❌ Refuse les emails mal formés
- ✅ Email optionnel (peut être vide)

#### Validation du message
- ✅ Accepte 10-2000 caractères
- ❌ Refuse les messages trop courts ou trop longs

#### Sécurité
- ✅ Détecte les tentatives XSS (`<script>`, `javascript:`, `onerror=`, etc.)
- ✅ Détecte le spam via honeypot

### Fichiers de test

```
tests/
└── formValidation.test.js    # 52 tests pour la validation du formulaire
```

## 🌐 Tests E2E (Playwright)

Les tests end-to-end simulent un utilisateur réel qui remplit le formulaire.

### Exécuter les tests E2E

```bash
# Démarrer un serveur local d'abord
python3 -m http.server 8000

# Dans un autre terminal
npm run test:e2e

# Mode interactif (avec interface graphique)
npm run test:e2e:ui
```

### Ce qui est testé

- Affichage du formulaire
- Validation côté client en temps réel
- Soumission du formulaire
- Messages d'erreur
- Compatibilité mobile
- Navigation du site
- Menu mobile

### Fichiers de test

```
tests/e2e/
└── contact-form.spec.js    # Tests du formulaire et navigation
```

## ⚙️ Pipeline CI/CD

Le pipeline GitHub Actions s'exécute automatiquement sur chaque :
- Push vers les branches `main`, `master` ou `claude/*`
- Pull request

### Jobs exécutés

1. **Tests unitaires** (Jest)
   - Exécute tous les tests
   - Génère un rapport de couverture

2. **Tests E2E** (Playwright)
   - Lance un serveur web local
   - Exécute les tests dans Chromium
   - Capture des vidéos/screenshots en cas d'échec

3. **Validation HTML**
   - Vérifie que le HTML est valide (W3C)

4. **Audit de sécurité**
   - Vérifie les vulnérabilités des dépendances npm

### Voir les résultats

Les résultats sont visibles dans l'onglet **Actions** de GitHub :
- ✅ Tous les tests passent → badge vert
- ❌ Un test échoue → badge rouge

## 📁 Structure des Tests

```
reddenconnexion.github.io/
├── js/                                # Code JavaScript modulaire
│   ├── formValidation.js              # Fonctions de validation
│   ├── formHandler.js                 # Gestion du formulaire
│   └── main.js                        # Point d'entrée principal
├── tests/                             # Tests
│   ├── formValidation.test.js         # Tests unitaires
│   └── e2e/                           # Tests E2E
│       └── contact-form.spec.js       # Tests du formulaire
├── .github/workflows/                 # CI/CD
│   └── tests.yml                      # Configuration GitHub Actions
├── jest.config.js                     # Configuration Jest
├── playwright.config.js               # Configuration Playwright
└── package.json                       # Dépendances et scripts

```

## 🎓 Commandes Utiles

```bash
# Tous les tests (unitaires + E2E)
npm run test:all

# Tests unitaires uniquement
npm test

# Tests avec couverture
npm run test:coverage

# Tests E2E uniquement
npm run test:e2e

# Tests E2E en mode interactif
npm run test:e2e:ui

# Tests unitaires en mode watch
npm run test:watch
```

## 📊 Rapport de Couverture

Après avoir exécuté `npm run test:coverage`, ouvrez :

```
coverage/lcov-report/index.html
```

Vous verrez :
- % de lignes testées
- % de fonctions testées
- % de branches testées
- Lignes non couvertes en rouge

## 🐛 Déboguer les Tests

### Tests unitaires

Ajoutez des `console.log()` dans votre code ou vos tests :

```javascript
test('mon test', () => {
    const result = validateName('Jean');
    console.log('Résultat:', result);
    expect(result.valid).toBe(true);
});
```

### Tests E2E

Utilisez le mode interactif :

```bash
npm run test:e2e:ui
```

Ou ajoutez `await page.pause()` dans vos tests pour mettre en pause l'exécution.

## ✅ Bonnes Pratiques

1. **Exécutez les tests avant chaque commit**
   ```bash
   npm test
   ```

2. **Vérifiez la couverture régulièrement**
   ```bash
   npm run test:coverage
   ```

3. **Ajoutez des tests pour chaque nouvelle fonctionnalité**

4. **Ne committez jamais si les tests échouent**

## 🆘 Dépannage

### Jest ne trouve pas les modules

Vérifiez que `"type": "module"` est bien dans `package.json`.

### Playwright ne trouve pas le navigateur

Réinstallez les navigateurs :
```bash
npx playwright install chromium --with-deps
```

### Les tests E2E échouent localement

Vérifiez que le serveur web tourne sur le port 8000 :
```bash
python3 -m http.server 8000
```

## 📞 Support

Pour toute question sur les tests, consultez :
- [Documentation Jest](https://jestjs.io/)
- [Documentation Playwright](https://playwright.dev/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
