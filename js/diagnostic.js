/*
 * Diagnostic express « Une panne ? Que vérifier avant d'appeler »
 * ---------------------------------------------------------------
 * Le HTML contient les quatre fiches de vérification. Ce script n'en affiche
 * qu'une à la fois : le visiteur choisit sa situation dans la liste (clic,
 * doigt ou flèches du clavier) et la carte montre la fiche correspondante.
 * Une fiche marquée data-urgent fait passer la carte au rouge.
 *
 * Pour modifier un conseil, il suffit de changer le texte dans le HTML
 * (bloc <section id="diagnostic"> d'index.html). Pour ajouter une situation :
 * un bouton role="tab" dans la liste + une fiche role="tabpanel" dans la
 * carte, dans le même ordre.
 *
 * Les styles sont dans css/diagnostic.css. Sans JavaScript, les quatre
 * fiches restent affichées l'une sous l'autre.
 */
(function () {
  'use strict';

  function setup(root) {
    if (root.dataset.diagnosticReady === 'true') return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    var card = root.querySelector('.diagnostic-card');
    if (!tabs.length || tabs.length !== panels.length || !card) return;

    root.dataset.diagnosticReady = 'true';

    function select(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        // Une seule entrée dans l'ordre de tabulation ; les flèches font le reste
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      card.classList.toggle('is-urgent', panels[index].hasAttribute('data-urgent'));
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i, false);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });

    root.classList.add('is-ready');
    select(0, false);
  }

  function init() {
    document.querySelectorAll('[data-diagnostic]').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
