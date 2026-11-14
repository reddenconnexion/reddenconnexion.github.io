/*
 * Section « Zone d'Intervention » : tableau des départs
 * -----------------------------------------------------
 * Les communes sont écrites dans index.html (liste .zone-liste). Ce script :
 *   - ajoute trois filtres par temps de trajet (15 min, 30 min, toutes) ;
 *   - une fois la carte chargée, affiche sur chaque ligne un bouton qui
 *     centre la carte sur la commune et ouvre sa fiche.
 *
 * La carte est créée par le script d'index.html, qui publie window.rdcZone
 * ({ map, markers }) puis l'événement « rdc:carte-prete ».
 * Styles dans css/zone.css. Sans JavaScript, la liste reste complète.
 */
(function () {
  'use strict';

  function init() {
    var panel = document.querySelector('[data-zone]');
    if (!panel || panel.dataset.zoneReady === 'true') return;
    panel.dataset.zoneReady = 'true';

    var rows = Array.prototype.slice.call(panel.querySelectorAll('.zone-depart'));
    var filters = panel.querySelector('.zone-filtres');
    if (!rows.length || !filters) return;

    function minutes(row) {
      return Number(row.getAttribute('data-minutes'));
    }

    // ----- Filtres par temps de trajet
    var steps = [
      { max: 15, label: '15 min' },
      { max: 30, label: '30 min' },
      { max: Infinity, label: 'Toutes' }
    ];

    var buttons = steps.map(function (step) {
      var count = rows.filter(function (row) { return minutes(row) <= step.max; }).length;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'zone-filtre';
      button.textContent = step.label + ' (' + count + ')';
      button.addEventListener('click', function () { apply(step.max); });
      filters.appendChild(button);
      return button;
    });

    function apply(max) {
      rows.forEach(function (row) { row.hidden = minutes(row) > max; });
      buttons.forEach(function (button, i) {
        button.setAttribute('aria-pressed', steps[i].max === max ? 'true' : 'false');
      });
    }

    filters.hidden = false;
    // Sur téléphone, on commence par les communes les plus proches pour garder la page courte
    var narrow = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    apply(narrow ? 15 : Infinity);

    // ----- Boutons « voir sur la carte », actifs quand la carte est prête
    function enableMapButtons() {
      var zone = window.rdcZone;
      if (!zone || !zone.map || !zone.markers) return;
      rows.forEach(function (row) {
        var name = row.getAttribute('data-ville');
        var marker = zone.markers[name];
        var button = row.querySelector('.zone-voir');
        if (!marker || !button || button.dataset.ready === 'true') return;
        button.dataset.ready = 'true';
        button.hidden = false;
        button.addEventListener('click', function () {
          zone.map.setView(marker.getLatLng(), 12);
          marker.openPopup();
          // Sur téléphone la carte est au-dessus de la liste : on y remonte
          var mapEl = document.getElementById('map');
          if (mapEl) {
            var rect = mapEl.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
              mapEl.scrollIntoView({ block: 'center' });
            }
          }
        });
      });
    }

    document.addEventListener('rdc:carte-prete', enableMapButtons);
    enableMapButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
