/*
 * Section « Pourquoi Me Choisir ? » : afficheurs
 * ----------------------------------------------
 * Quand une carte arrive à l'écran :
 *   - son bargraphe s'allume segment par segment (animation CSS) ;
 *   - si sa valeur est un nombre (attribut data-compte), elle défile de 0
 *     jusqu'à ce nombre.
 * Les valeurs finales sont écrites dans index.html : sans JavaScript, ou si
 * le visiteur a demandé moins d'animations, elles sont affichées telles quelles.
 * Styles dans css/pourquoi.css.
 */
(function () {
  'use strict';

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function count(el) {
    var target = Number(el.getAttribute('data-compte'));
    var prefix = el.getAttribute('data-prefixe') || '';
    if (!target || reduced()) return;
    var duration = 1100;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      // Ralentit en arrivant sur la valeur
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (t < 1) window.requestAnimationFrame(frame);
    }
    el.textContent = prefix + '0';
    window.requestAnimationFrame(frame);
  }

  function init() {
    var grid = document.querySelector('[data-pourquoi]');
    if (!grid || grid.dataset.pourquoiReady === 'true') return;
    grid.dataset.pourquoiReady = 'true';

    var items = Array.prototype.slice.call(grid.querySelectorAll('.why-item'));
    if (!items.length || !('IntersectionObserver' in window)) return;

    grid.classList.add('is-ready');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        entry.target.classList.add('is-vu');
        var value = entry.target.querySelector('[data-compte]');
        if (value) count(value);
      });
    }, { threshold: 0.4 });

    items.forEach(function (item) { observer.observe(item); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
