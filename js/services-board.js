/*
 * Tableau des services
 * --------------------
 * Transforme la section « Mes Services » en tableau électrique : chaque carte
 * de service devient un disjoncteur ; on en enclenche un (clic, doigt ou
 * flèches du clavier) et sa fiche s'affiche dessous.
 *
 * Le script part des cartes .service-card déjà présentes dans le HTML : leur
 * contenu (texte, liens, pages locales) n'est pas modifié, seulement présenté
 * une fiche à la fois. Pour ajouter un service, il suffit d'ajouter une carte ;
 * l'attribut data-court donne le nom court écrit sous le disjoncteur et
 * data-calibre le calibre gravé dessus (C16 par défaut).
 *
 * Les styles sont dans css/services-board.css. Sans JavaScript, la section
 * reste la grille de cartes habituelle.
 */
(function () {
  'use strict';

  function element(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function setup(section) {
    if (section.dataset.boardReady === 'true') return;

    var grid = section.querySelector('.services-grid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.service-card'));
    if (cards.length < 2) return;

    section.dataset.boardReady = 'true';

    var intro = element('p', 'board-intro', 'Enclenchez un disjoncteur pour voir le détail du service.');
    var panel = element('div', 'board-panel');
    var rail = element('div', 'board-rail');
    rail.setAttribute('role', 'tablist');
    rail.setAttribute('aria-label', 'Mes services');

    var tabs = cards.map(function (card, i) {
      var code = 'Q' + (i + 1);
      var title = card.querySelector('h3');
      var label = card.getAttribute('data-court') || (title ? title.textContent.trim() : code);

      var tab = element('button', 'board-breaker');
      tab.type = 'button';
      tab.id = 'service-tab-' + (i + 1);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'service-panel-' + (i + 1));

      // Étiquette de repérage au-dessus du disjoncteur
      var codeEl = element('span', 'board-breaker-code', code);
      codeEl.setAttribute('aria-hidden', 'true');

      // Disjoncteur modulaire vu de face : borne, partie avant (calibre,
      // manette, voyant de position), borne. Purement décoratif.
      var module = element('span', 'board-breaker-module');
      module.setAttribute('aria-hidden', 'true');
      var nose = element('span', 'board-breaker-nose');
      var toggle = element('span', 'board-breaker-toggle');
      toggle.appendChild(element('span', 'board-breaker-lever'));
      nose.appendChild(element('span', 'board-breaker-rating', card.getAttribute('data-calibre') || 'C16'));
      nose.appendChild(toggle);
      nose.appendChild(element('span', 'board-breaker-state', 'OFF'));
      module.appendChild(element('span', 'board-breaker-terminal'));
      module.appendChild(nose);
      module.appendChild(element('span', 'board-breaker-terminal'));

      tab.appendChild(codeEl);
      tab.appendChild(module);
      tab.appendChild(element('span', 'board-breaker-label', label));
      rail.appendChild(tab);

      card.id = 'service-panel-' + (i + 1);
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-labelledby', tab.id);
      card.insertBefore(element('p', 'board-circuit', 'Circuit ' + code + ' · sous tension'), card.firstChild);

      return tab;
    });

    function select(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        // Une seule entrée dans l'ordre de tabulation ; les flèches font le reste
        tab.tabIndex = selected ? 0 : -1;
        tab.querySelector('.board-breaker-state').textContent = selected ? 'ON' : 'OFF';
        cards[i].classList.toggle('is-active', selected);
      });
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i, false);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });

    // Mise en place : le texte d'invite, puis le tableau qui contient la rangée
    // de disjoncteurs et la grille de fiches d'origine.
    grid.parentNode.insertBefore(intro, grid);
    grid.parentNode.insertBefore(panel, grid);
    panel.appendChild(rail);
    panel.appendChild(grid);

    section.classList.add('services-board', 'is-ready');
    select(0, false);
  }

  function init() {
    var section = document.getElementById('services');
    if (section) setup(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
