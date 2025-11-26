/**
 * Tests unitaires pour le module de validation du formulaire
 * Red Den Connexion - Électricien St Médard de Guizières
 */

import {
    validateName,
    validatePhone,
    validateEmail,
    validateCity,
    validateMessage,
    detectXSS,
    detectSpam,
    validateForm
} from '../js/formValidation.js';

describe('Validation du nom', () => {
    test('accepte un nom valide de 2 caractères', () => {
        const result = validateName('Jo');
        expect(result.valid).toBe(true);
        expect(result.error).toBe('');
    });

    test('accepte un nom valide de 100 caractères', () => {
        const longName = 'a'.repeat(100);
        const result = validateName(longName);
        expect(result.valid).toBe(true);
    });

    test('refuse un nom trop court (1 caractère)', () => {
        const result = validateName('A');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('au moins 2 caractères');
    });

    test('refuse un nom vide', () => {
        const result = validateName('');
        expect(result.valid).toBe(false);
    });

    test('refuse un nom trop long (101 caractères)', () => {
        const longName = 'a'.repeat(101);
        const result = validateName(longName);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('100 caractères');
    });

    test('gère les espaces en début et fin', () => {
        const result = validateName('  Jean  ');
        expect(result.valid).toBe(true);
    });

    test('refuse un nom avec uniquement des espaces', () => {
        const result = validateName('   ');
        expect(result.valid).toBe(false);
    });
});

describe('Validation du téléphone', () => {
    test('accepte un numéro français standard', () => {
        const result = validatePhone('0612345678');
        expect(result.valid).toBe(true);
    });

    test('accepte un numéro avec espaces', () => {
        const result = validatePhone('06 12 34 56 78');
        expect(result.valid).toBe(true);
    });

    test('accepte un numéro avec indicatif international', () => {
        const result = validatePhone('+33612345678');
        expect(result.valid).toBe(true);
    });

    test('accepte un numéro avec tirets', () => {
        const result = validatePhone('06-12-34-56-78');
        expect(result.valid).toBe(true);
    });

    test('accepte un numéro avec parenthèses', () => {
        const result = validatePhone('(06) 12 34 56 78');
        expect(result.valid).toBe(true);
    });

    test('refuse un numéro trop court', () => {
        const result = validatePhone('061234');
        expect(result.valid).toBe(false);
    });

    test('refuse un numéro avec des lettres', () => {
        const result = validatePhone('06abc12345');
        expect(result.valid).toBe(false);
    });

    test('refuse un numéro vide', () => {
        const result = validatePhone('');
        expect(result.valid).toBe(false);
    });

    test('refuse un numéro avec caractères spéciaux invalides', () => {
        const result = validatePhone('06@12#34$56');
        expect(result.valid).toBe(false);
    });
});

describe('Validation de l\'email', () => {
    test('accepte un email valide', () => {
        const result = validateEmail('test@example.com');
        expect(result.valid).toBe(true);
    });

    test('accepte un email avec sous-domaine', () => {
        const result = validateEmail('user@mail.example.com');
        expect(result.valid).toBe(true);
    });

    test('accepte un email avec chiffres', () => {
        const result = validateEmail('user123@example.com');
        expect(result.valid).toBe(true);
    });

    test('accepte un email avec tirets et points', () => {
        const result = validateEmail('jean.dupont@mon-entreprise.fr');
        expect(result.valid).toBe(true);
    });

    test('refuse un email sans @', () => {
        const result = validateEmail('testexample.com');
        expect(result.valid).toBe(false);
    });

    test('refuse un email sans domaine', () => {
        const result = validateEmail('test@');
        expect(result.valid).toBe(false);
    });

    test('refuse un email sans extension', () => {
        const result = validateEmail('test@example');
        expect(result.valid).toBe(false);
    });

    test('accepte un email vide si non requis', () => {
        const result = validateEmail('', false);
        expect(result.valid).toBe(true);
    });

    test('gère les espaces en début et fin', () => {
        const result = validateEmail('  test@example.com  ');
        expect(result.valid).toBe(true);
    });
});

describe('Validation de la ville', () => {
    test('accepte une ville valide', () => {
        const result = validateCity('St Médard de Guizières');
        expect(result.valid).toBe(true);
    });

    test('accepte une ville de 2 caractères', () => {
        const result = validateCity('Bo');
        expect(result.valid).toBe(true);
    });

    test('accepte une ville de 100 caractères', () => {
        const longCity = 'A'.repeat(100);
        const result = validateCity(longCity);
        expect(result.valid).toBe(true);
    });

    test('refuse une ville trop courte (1 caractère)', () => {
        const result = validateCity('A');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('2');
    });

    test('refuse une ville vide', () => {
        const result = validateCity('');
        expect(result.valid).toBe(false);
    });

    test('refuse une ville trop longue (101 caractères)', () => {
        const longCity = 'A'.repeat(101);
        const result = validateCity(longCity);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('100');
    });

    test('gère les espaces en début et fin', () => {
        const result = validateCity('  Paris  ');
        expect(result.valid).toBe(true);
    });

    test('refuse une ville avec uniquement des espaces', () => {
        const result = validateCity('   ');
        expect(result.valid).toBe(false);
    });
});

describe('Validation du message', () => {
    test('accepte un message de 10 caractères', () => {
        const result = validateMessage('1234567890');
        expect(result.valid).toBe(true);
    });

    test('accepte un message de 2000 caractères', () => {
        const longMessage = 'a'.repeat(2000);
        const result = validateMessage(longMessage);
        expect(result.valid).toBe(true);
    });

    test('accepte un message normal', () => {
        const result = validateMessage('Bonjour, j\'aurais besoin d\'un devis pour une installation électrique.');
        expect(result.valid).toBe(true);
    });

    test('refuse un message trop court (9 caractères)', () => {
        const result = validateMessage('123456789');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('au moins 10 caractères');
    });

    test('refuse un message vide', () => {
        const result = validateMessage('');
        expect(result.valid).toBe(false);
    });

    test('refuse un message trop long (2001 caractères)', () => {
        const longMessage = 'a'.repeat(2001);
        const result = validateMessage(longMessage);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('2000 caractères');
    });

    test('gère les espaces en début et fin', () => {
        const result = validateMessage('  Message de test valide  ');
        expect(result.valid).toBe(true);
    });
});

describe('Détection XSS', () => {
    test('détecte une balise script', () => {
        const result = detectXSS('<script>alert("XSS")</script>');
        expect(result).toBe(true);
    });

    test('détecte javascript: dans le contenu', () => {
        const result = detectXSS('javascript:alert("XSS")');
        expect(result).toBe(true);
    });

    test('détecte onerror=', () => {
        const result = detectXSS('<img src=x onerror=alert("XSS")>');
        expect(result).toBe(true);
    });

    test('détecte onload=', () => {
        const result = detectXSS('<body onload=alert("XSS")>');
        expect(result).toBe(true);
    });

    test('détecte les tentatives en majuscules', () => {
        const result = detectXSS('<SCRIPT>alert("XSS")</SCRIPT>');
        expect(result).toBe(true);
    });

    test('n\'identifie pas du contenu normal comme XSS', () => {
        const result = detectXSS('Bonjour, j\'ai besoin d\'un électricien pour mon script de test.');
        expect(result).toBe(false);
    });

    test('n\'identifie pas du texte avec "on" comme XSS', () => {
        const result = detectXSS('Installation et rénovation électrique');
        expect(result).toBe(false);
    });
});

describe('Détection de spam (honeypot)', () => {
    test('détecte du spam si le honeypot est rempli', () => {
        const result = detectSpam('contenu spam');
        expect(result).toBe(true);
    });

    test('ne détecte pas de spam si le honeypot est vide', () => {
        const result = detectSpam('');
        expect(result).toBe(false);
    });

    test('ne détecte pas de spam si le honeypot est null', () => {
        const result = detectSpam(null);
        expect(result).toBe(false);
    });

    test('ne détecte pas de spam si le honeypot est undefined', () => {
        const result = detectSpam(undefined);
        expect(result).toBe(false);
    });
});

describe('Validation complète du formulaire', () => {
    test('accepte un formulaire valide complet', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: 'jean.dupont@example.com',
            city: 'St Médard de Guizières',
            message: 'Bonjour, j\'aurais besoin d\'un devis pour une installation électrique.',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('accepte un formulaire sans email (optionnel)', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: '',
            city: 'Libourne',
            message: 'Bonjour, j\'aurais besoin d\'un devis.',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(true);
    });

    test('refuse un formulaire avec nom invalide', () => {
        const formData = {
            name: 'J',
            phone: '06 12 34 56 78',
            email: 'jean@example.com',
            city: 'Coutras',
            message: 'Message de test valide',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test('refuse un formulaire avec téléphone invalide', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '123',
            email: 'jean@example.com',
            city: 'Bordeaux',
            message: 'Message de test valide',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
    });

    test('refuse un formulaire avec email invalide', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: 'email-invalide',
            city: 'Paris',
            message: 'Message de test valide',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
    });

    test('refuse un formulaire avec message trop court', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: 'jean@example.com',
            city: 'Lyon',
            message: 'Court',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
    });

    test('refuse un formulaire avec tentative XSS', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: 'jean@example.com',
            city: 'Marseille',
            message: '<script>alert("XSS")</script>',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Caractères non autorisés détectés dans le formulaire.');
    });

    test('refuse un formulaire avec honeypot rempli (spam)', () => {
        const formData = {
            name: 'Jean Dupont',
            phone: '06 12 34 56 78',
            email: 'jean@example.com',
            city: 'Toulouse',
            message: 'Message de test valide',
            honeypot: 'spam content'
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
    });

    test('retourne plusieurs erreurs si plusieurs champs sont invalides', () => {
        const formData = {
            name: 'J',
            phone: '123',
            email: 'invalid-email',
            city: 'A',
            message: 'Court',
            honeypot: ''
        };
        const result = validateForm(formData);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
    });
});
