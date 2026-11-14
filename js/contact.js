/*
 * Section « Contactez-moi » : voyants du formulaire de devis
 * ----------------------------------------------------------
 * Ajoute au-dessus du formulaire une rangée de voyants, un par champ
 * obligatoire. Chaque voyant passe au vert quand son champ est correctement
 * rempli ; quand tous le sont, le bouton d'envoi se met « sous tension ».
 *
 * Purement visuel : la validation et l'envoi restent gérés par
 * js/formHandler.js et par le navigateur. Les voyants sont masqués aux
 * lecteurs d'écran, qui annoncent déjà les champs obligatoires.
 * Styles dans css/contact.css.
 */
(function () {
  'use strict';

  function init() {
    var form = document.getElementById('contactForm');
    var strip = document.getElementById('contactVoyants');
    if (!form || !strip || form.dataset.voyantsReady === 'true') return;
    form.dataset.voyantsReady = 'true';

    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    if (!fields.length) return;

    var leds = fields.map(function (field) {
      var label = form.querySelector('label[for="' + field.id + '"]');
      var text = label ? label.textContent.replace('*', '').trim() : field.name;
      var led = document.createElement('span');
      led.className = 'contact-voyant';
      // Libellé court : « Décrivez votre projet » devient « Projet »
      led.textContent = field.getAttribute('data-voyant') || text;
      strip.appendChild(led);
      return led;
    });

    function refresh() {
      var allOk = true;
      fields.forEach(function (field, i) {
        var ok = field.value.trim() !== '' && field.validity.valid;
        leds[i].classList.toggle('is-ok', ok);
        if (!ok) allOk = false;
      });
      form.classList.toggle('is-pret', allOk);
    }

    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);

    form.classList.add('a-des-voyants');
    strip.hidden = false;
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
