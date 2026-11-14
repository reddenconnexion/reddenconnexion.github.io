/*
 * Fil de progression sous le menu
 * -------------------------------
 * Ajoute sous la barre de navigation un fil fin qui se « charge » en rouge à
 * mesure que le visiteur descend dans la page : vide en haut, plein en bas.
 * Purement décoratif (masqué aux lecteurs d'écran). Styles dans css/fils.css.
 *
 * Ne s'active que si la barre de navigation reste fixée en haut de l'écran ;
 * sur une page courte, sans défilement, le fil n'est pas ajouté.
 */
(function () {
  'use strict';

  function init() {
    var header = document.querySelector('header');
    if (!header || header.querySelector('.fil-progression')) return;
    var position = window.getComputedStyle(header).position;
    if (position !== 'fixed' && position !== 'sticky') return;

    var wire = document.createElement('div');
    wire.className = 'fil-progression';
    wire.setAttribute('aria-hidden', 'true');
    var current = document.createElement('span');
    current.className = 'fil-progression-courant';
    wire.appendChild(current);
    header.appendChild(wire);

    var scheduled = false;

    function update() {
      scheduled = false;
      var root = document.documentElement;
      var max = root.scrollHeight - window.innerHeight;
      var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      current.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
      // Rien à parcourir : on masque le fil plutôt que de le laisser vide
      wire.style.display = max > 0 ? '' : 'none';
    }

    // Une mise à jour par image au plus, pour ne pas ralentir le défilement
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
