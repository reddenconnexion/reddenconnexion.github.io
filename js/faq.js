/*
 * Section « Questions Fréquentes »
 * --------------------------------
 * Chaque question est un bouton avec un petit interrupteur : on l'actionne
 * pour afficher ou masquer sa réponse. Les questions sont indépendantes
 * (plusieurs réponses peuvent rester ouvertes). Le bouton « général »,
 * au-dessus de la liste, ouvre ou ferme toutes les réponses d'un coup.
 *
 * Les questions et réponses sont écrites dans index.html. Pour en ajouter
 * une, copier un bloc <div class="faq-item"> en donnant de nouveaux numéros
 * aux attributs id / aria-controls / aria-labelledby.
 *
 * Les styles sont dans css/faq.css. Sans JavaScript, toutes les réponses
 * restent affichées.
 */
(function () {
  'use strict';

  function setup(container) {
    if (container.dataset.faqReady === 'true') return;

    var items = Array.prototype.slice.call(container.querySelectorAll('.faq-item'));
    if (!items.length) return;
    container.dataset.faqReady = 'true';

    var master = container.querySelector('.faq-master');

    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      var button = item.querySelector('.faq-question');
      if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    // Le bouton général reflète l'état : « tout éteindre » dès que tout est ouvert
    function refreshMaster() {
      if (!master) return;
      var allOpen = items.every(function (item) { return item.classList.contains('is-open'); });
      master.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
      master.textContent = allOpen ? 'Tout éteindre' : 'Tout allumer';
    }

    items.forEach(function (item) {
      var button = item.querySelector('.faq-question');
      if (!button) return;
      button.addEventListener('click', function () {
        setOpen(item, !item.classList.contains('is-open'));
        refreshMaster();
      });
    });

    if (master) {
      master.addEventListener('click', function () {
        var open = master.getAttribute('aria-pressed') !== 'true';
        items.forEach(function (item) { setOpen(item, open); });
        refreshMaster();
      });
      master.hidden = false;
    }

    // À l'ouverture : la première réponse est allumée, les autres repliées
    items.forEach(function (item, i) { setOpen(item, i === 0); });
    refreshMaster();
    container.classList.add('is-ready');
  }

  function init() {
    document.querySelectorAll('[data-faq]').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
