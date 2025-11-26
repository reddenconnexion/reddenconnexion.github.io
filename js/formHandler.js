/**
 * Gestionnaire du formulaire de contact
 * Red Den Connexion - Électricien St Médard de Guizières
 */

import { validateForm } from './formValidation.js';

/**
 * Affiche un message d'erreur dans le formulaire
 * @param {string} message - Le message à afficher
 */
export function showFormError(message) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;

    formMessage.style.display = 'block';
    formMessage.className = 'error';
    formMessage.style.background = '#f8d7da';
    formMessage.style.color = '#721c24';
    formMessage.style.border = '1px solid #f5c6cb';
    formMessage.textContent = '❌ ' + message;

    // Masquer après 5 secondes
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

/**
 * Affiche un message de succès dans le formulaire
 * @param {string} message - Le message à afficher
 */
export function showFormSuccess(message) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;

    formMessage.style.display = 'block';
    formMessage.className = 'success';
    formMessage.textContent = '✅ ' + message;

    // Masquer après 5 secondes
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

/**
 * Initialise le gestionnaire du formulaire de contact
 */
export function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Récupérer les valeurs du formulaire
        const formData = {
            name: document.getElementById('name')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            email: document.getElementById('email')?.value || '',
            city: document.getElementById('city')?.value || '',
            message: document.getElementById('message')?.value || '',
            honeypot: form.querySelector('[name="_gotcha"]')?.value || ''
        };

        // Valider le formulaire
        const validation = validateForm(formData);

        if (!validation.valid) {
            // Afficher la première erreur
            showFormError(validation.errors[0]);
            return false;
        }

        // Préparer la soumission
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';

        // Désactiver le bouton pendant l'envoi
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.style.opacity = '0.6';
        }

        // La validation a réussi, soumettre le formulaire de façon classique
        // (Formspree nécessite une soumission non-AJAX ou une clé API)
        form.submit();
    });
}
