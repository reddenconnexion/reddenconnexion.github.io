/**
 * Module de validation du formulaire de contact
 * Red Den Connexion - Électricien St Médard de Guizières
 */

/**
 * Valide un nom (prénom ou nom de famille)
 * @param {string} name - Le nom à valider
 * @returns {{valid: boolean, error: string}} - Résultat de la validation
 */
export function validateName(name) {
    const trimmedName = name ? name.trim() : '';

    if (trimmedName.length < 2) {
        return {
            valid: false,
            error: 'Le nom doit contenir au moins 2 caractères.'
        };
    }

    if (trimmedName.length > 100) {
        return {
            valid: false,
            error: 'Le nom ne peut pas dépasser 100 caractères.'
        };
    }

    return { valid: true, error: '' };
}

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Le numéro de téléphone à valider
 * @returns {{valid: boolean, error: string}} - Résultat de la validation
 */
export function validatePhone(phone) {
    const trimmedPhone = phone ? phone.trim() : '';

    // Accepte les formats: 0612345678, 06 12 34 56 78, +33612345678, etc.
    const phoneRegex = /^[0-9\s\+\-\(\)]{10,20}$/;

    if (!phoneRegex.test(trimmedPhone)) {
        return {
            valid: false,
            error: 'Veuillez entrer un numéro de téléphone valide.'
        };
    }

    return { valid: true, error: '' };
}

/**
 * Valide une adresse email
 * @param {string} email - L'email à valider
 * @param {boolean} required - Si l'email est obligatoire (false par défaut)
 * @returns {{valid: boolean, error: string}} - Résultat de la validation
 */
export function validateEmail(email, required = false) {
    const trimmedEmail = email ? email.trim() : '';

    // Si l'email n'est pas requis et qu'il est vide, c'est valide
    if (!required && trimmedEmail.length === 0) {
        return { valid: true, error: '' };
    }

    // Si l'email est renseigné, il doit être valide
    if (trimmedEmail.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return {
                valid: false,
                error: 'Veuillez entrer une adresse email valide.'
            };
        }
    }

    return { valid: true, error: '' };
}

/**
 * Valide le message du formulaire
 * @param {string} message - Le message à valider
 * @returns {{valid: boolean, error: string}} - Résultat de la validation
 */
export function validateMessage(message) {
    const trimmedMessage = message ? message.trim() : '';

    if (trimmedMessage.length < 10) {
        return {
            valid: false,
            error: 'Le message doit contenir au moins 10 caractères.'
        };
    }

    if (trimmedMessage.length > 2000) {
        return {
            valid: false,
            error: 'Le message ne peut pas dépasser 2000 caractères.'
        };
    }

    return { valid: true, error: '' };
}

/**
 * Détecte les tentatives d'injection XSS dans le contenu
 * @param {string} content - Le contenu à vérifier
 * @returns {boolean} - true si du contenu dangereux est détecté
 */
export function detectXSS(content) {
    const dangerousPatterns = /<script|javascript:|onerror=|onload=/i;
    return dangerousPatterns.test(content);
}

/**
 * Vérifie si le honeypot anti-spam a été rempli
 * @param {string} honeypotValue - La valeur du champ honeypot
 * @returns {boolean} - true si du spam est détecté
 */
export function detectSpam(honeypotValue) {
    return !!(honeypotValue && honeypotValue.length > 0);
}

/**
 * Valide un nom de ville
 * @param {string} city - La ville à valider
 * @returns {{valid: boolean, error: string}} - Résultat de la validation
 */
export function validateCity(city) {
    const trimmedCity = city ? city.trim() : '';

    if (trimmedCity.length < 2) {
        return {
            valid: false,
            error: 'Le nom de la ville doit contenir au moins 2 caractères.'
        };
    }

    if (trimmedCity.length > 100) {
        return {
            valid: false,
            error: 'Le nom de la ville ne peut pas dépasser 100 caractères.'
        };
    }

    return { valid: true, error: '' };
}

/**
 * Valide tous les champs du formulaire
 * @param {Object} formData - Les données du formulaire
 * @param {string} formData.name - Le nom
 * @param {string} formData.phone - Le téléphone
 * @param {string} formData.email - L'email
 * @param {string} formData.city - La ville
 * @param {string} formData.message - Le message
 * @param {string} formData.honeypot - Le champ honeypot
 * @returns {{valid: boolean, errors: string[]}} - Résultat de la validation
 */
export function validateForm(formData) {
    const errors = [];

    // Vérification anti-spam
    if (detectSpam(formData.honeypot)) {
        console.warn('Spam détecté');
        return { valid: false, errors: ['Spam détecté'] };
    }

    // Validation du nom
    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
        errors.push(nameValidation.error);
    }

    // Validation du téléphone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
        errors.push(phoneValidation.error);
    }

    // Validation de l'email
    const emailValidation = validateEmail(formData.email, false);
    if (!emailValidation.valid) {
        errors.push(emailValidation.error);
    }

    // Validation de la ville
    const cityValidation = validateCity(formData.city);
    if (!cityValidation.valid) {
        errors.push(cityValidation.error);
    }

    // Validation du message
    const messageValidation = validateMessage(formData.message);
    if (!messageValidation.valid) {
        errors.push(messageValidation.error);
    }

    // Vérification XSS sur tous les champs
    const allContent = `${formData.name} ${formData.phone} ${formData.email} ${formData.city} ${formData.message}`;
    if (detectXSS(allContent)) {
        errors.push('Caractères non autorisés détectés dans le formulaire.');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}
