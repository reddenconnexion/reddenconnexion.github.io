/*
 * Curseur de comparaison « Avant / Après »
 * ----------------------------------------
 * Transforme chaque bloc .ba-slider en comparateur interactif : on fait glisser
 * la poignée (souris ou doigt) pour passer de la photo « avant » à la photo
 * « après ». Les styles sont dans css/before-after.css.
 *
 * Le HTML ne contient que les deux exemplaires de l'image comparative :
 *
 *   <div class="ba-slider" data-ba-slider>
 *     <picture class="ba-pane ba-after"> … <img alt="Description"> </picture>
 *     <picture class="ba-pane ba-before" aria-hidden="true"> … <img alt=""> </picture>
 *   </div>
 *
 * Ce script ajoute les étiquettes, la poignée et un curseur natif invisible
 * (flèches du clavier, lecteurs d'écran).
 *
 * window.RDCBeforeAfter.create(src, alt) fabrique un comparateur à la volée :
 * le carrousel de la page d'accueil s'en sert pour la photo agrandie.
 */
(function () {
  'use strict';

  var ARROWS =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="9 6 3 12 9 18"></polyline><polyline points="15 6 21 12 15 18"></polyline></svg>';

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function addLabel(el, className, text) {
    var label = document.createElement('span');
    label.className = 'ba-label ' + className;
    label.setAttribute('aria-hidden', 'true');
    label.textContent = text;
    el.appendChild(label);
  }

  function setup(el) {
    // Évite d'initialiser deux fois le même bloc
    if (!el || el.dataset.baReady === 'true') return;
    el.dataset.baReady = 'true';

    addLabel(el, 'ba-label-before', 'Avant');
    addLabel(el, 'ba-label-after', 'Après');

    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'ba-range';
    range.min = '0';
    range.max = '100';
    range.step = '1';
    range.value = '50';
    range.setAttribute('aria-label', 'Comparer avant et après');
    el.appendChild(range);

    // Placé après le curseur natif : le CSS affiche l'anneau de focus sur la poignée
    var handle = document.createElement('span');
    handle.className = 'ba-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.innerHTML = '<span class="ba-knob">' + ARROWS + '</span>';
    el.appendChild(handle);

    // Dès que le visiteur a manipulé le curseur, on ne joue plus l'animation d'invite
    var touched = false;

    function setPosition(value) {
      var pos = clamp(Math.round(value * 10) / 10);
      el.style.setProperty('--ba-pos', pos + '%');
      range.value = String(Math.round(pos));
      range.setAttribute('aria-valuetext', Math.round(pos) + ' % de la photo avant');
      // Masque l'étiquette quand sa photo est presque entièrement recouverte
      el.classList.toggle('ba-near-start', pos < 14);
      el.classList.toggle('ba-near-end', pos > 86);
    }

    function positionFromEvent(event) {
      var rect = el.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((event.clientX - rect.left) / rect.width) * 100;
    }

    // Clavier / lecteur d'écran
    range.addEventListener('input', function () {
      touched = true;
      setPosition(Number(range.value));
    });

    // Souris et tactile
    var drag = null;

    function startDrag(event) {
      drag.active = true;
      touched = true;
      el.classList.add('ba-dragging');
      try { el.setPointerCapture(event.pointerId); } catch (e) { /* pointeur déjà relâché */ }
    }

    el.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false };
      // Au doigt, on attend de savoir si le geste est horizontal (curseur)
      // ou vertical (défilement de la page) avant de bouger quoi que ce soit.
      if (event.pointerType !== 'touch') {
        startDrag(event);
        setPosition(positionFromEvent(event));
        event.preventDefault(); // pas de sélection de texte pendant le glissement
      }
    });

    el.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.active) {
        var dx = Math.abs(event.clientX - drag.x);
        var dy = Math.abs(event.clientY - drag.y);
        if (dx < 8 || dx <= dy) return;
        startDrag(event);
      }
      setPosition(positionFromEvent(event));
    });

    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      // Simple appui du doigt (sans glisser) : le curseur vient sous le doigt
      if (event.type === 'pointerup' && !drag.active) {
        touched = true;
        setPosition(positionFromEvent(event));
      }
      drag = null;
      el.classList.remove('ba-dragging');
    }

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // Un clic sur le comparateur ne doit pas déclencher l'élément qui le contient
    // (carte de la galerie, fond de la lightbox…)
    el.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    setPosition(50);

    // Invite : petit va-et-vient de la poignée la première fois que le bloc est visible
    if ('IntersectionObserver' in window && !prefersReducedMotion()) {
      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        var start = null;
        var duration = 1400;
        function frame(now) {
          if (touched) return;
          if (start === null) start = now;
          var t = Math.min(1, (now - start) / duration);
          setPosition(50 - 14 * Math.sin(t * 2 * Math.PI));
          if (t < 1) window.requestAnimationFrame(frame);
        }
        window.requestAnimationFrame(frame);
      }, { threshold: 0.6 });
      observer.observe(el);
    }
  }

  // Fabrique un comparateur à partir d'une image comparative (utilisé par la lightbox)
  function create(src, alt) {
    var el = document.createElement('div');
    el.className = 'ba-slider';

    var after = document.createElement('span');
    after.className = 'ba-pane ba-after';
    var afterImg = document.createElement('img');
    afterImg.src = src;
    afterImg.alt = alt || 'Comparatif avant/après';
    after.appendChild(afterImg);

    var before = document.createElement('span');
    before.className = 'ba-pane ba-before';
    before.setAttribute('aria-hidden', 'true');
    var beforeImg = document.createElement('img');
    beforeImg.src = src;
    beforeImg.alt = '';
    before.appendChild(beforeImg);

    el.appendChild(after);
    el.appendChild(before);
    setup(el);
    return el;
  }

  function init(root) {
    (root || document).querySelectorAll('.ba-slider').forEach(setup);
  }

  window.RDCBeforeAfter = { init: init, create: create };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
