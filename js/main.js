/**
 * Script principal du site Red Den Connexion
 * Initialise tous les composants interactifs
 */

import { initContactForm } from './formHandler.js';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le formulaire de contact
    initContactForm();
});
