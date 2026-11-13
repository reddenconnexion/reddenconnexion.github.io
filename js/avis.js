/*
 * Section « Ils Me Font Confiance » : avis affichés un par un
 * -----------------------------------------------------------
 * Le HTML contient tous les avis (liste .avis-slides). Ce script n'en montre
 * qu'un à la fois et ajoute les commandes : voyants (un par avis), compteur
 * et boutons poussoirs précédent / suivant. On peut aussi balayer du doigt
 * ou utiliser les flèches gauche / droite du clavier.
 *
 * Pour ajouter un avis : ajouter un <li class="avis-slide"> dans index.html,
 * son voyant se crée tout seul. Rien ne défile automatiquement.
 *
 * Les styles sont dans css/avis.css. Sans JavaScript, tous les avis restent
 * visibles en grille.
 */
(function () {
  'use strict';

  var CHEVRON_LEFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18"></polyline></svg>';
  var CHEVRON_RIGHT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"></polyline></svg>';

  function two(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function setup(root) {
    if (root.dataset.avisReady === 'true') return;

    var list = root.querySelector('.avis-slides');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.avis-slide'));
    if (!list || slides.length < 2) return;

    root.dataset.avisReady = 'true';
    var total = slides.length;
    var current = 0;

    // Les changements d'avis sont annoncés aux lecteurs d'écran
    list.setAttribute('aria-live', 'polite');

    // ----- Commandes
    var nav = document.createElement('div');
    nav.className = 'avis-nav';

    var leds = document.createElement('div');
    leds.className = 'avis-leds';

    var ledButtons = slides.map(function (slide, i) {
      var led = document.createElement('button');
      led.type = 'button';
      led.className = 'avis-led';
      led.setAttribute('aria-label', 'Avis ' + (i + 1) + ' sur ' + total);
      led.addEventListener('click', function () { show(i); });
      leds.appendChild(led);
      return led;
    });

    var count = document.createElement('span');
    count.className = 'avis-count';
    count.setAttribute('aria-hidden', 'true');

    var buttons = document.createElement('div');
    buttons.className = 'avis-buttons';

    function makeButton(className, label, icon, step) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'avis-btn ' + className;
      button.setAttribute('aria-label', label);
      button.innerHTML = icon;
      button.addEventListener('click', function () { show(current + step); });
      buttons.appendChild(button);
    }

    makeButton('avis-prev', 'Avis précédent', CHEVRON_LEFT, -1);
    makeButton('avis-next', 'Avis suivant', CHEVRON_RIGHT, 1);

    nav.appendChild(leds);
    nav.appendChild(count);
    nav.appendChild(buttons);
    root.appendChild(nav);

    // ----- Affichage d'un avis (l'index boucle dans les deux sens)
    function show(index) {
      current = (index + total) % total;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      ledButtons.forEach(function (led, i) {
        if (i === current) led.setAttribute('aria-current', 'true');
        else led.removeAttribute('aria-current');
      });
      count.textContent = two(current + 1) + ' / ' + two(total);
    }

    // Flèches du clavier quand le focus est sur une commande de la carte
    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { show(current + 1); event.preventDefault(); }
      else if (event.key === 'ArrowLeft') { show(current - 1); event.preventDefault(); }
    });

    // Balayage du doigt (ou glissement à la souris) sur le texte de l'avis
    var start = null;
    list.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    list.addEventListener('pointerup', function (event) {
      if (!start || event.pointerId !== start.id) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      show(current + (dx < 0 ? 1 : -1));
    });
    list.addEventListener('pointercancel', function () { start = null; });

    root.classList.add('is-ready');
    show(0);
  }

  function init() {
    document.querySelectorAll('[data-avis]').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
