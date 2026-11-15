/*
 * Showcase « Ce que je fais pour vous, en images »
 * -------------------------------------------------
 * 1) Défilement en boucle : l'animation CSS (translateX -50%) a besoin que chaque
 *    rangée contienne ses tuiles EN DOUBLE. Plutôt que d'écrire chaque tuile deux
 *    fois à la main, ce script clone automatiquement les tuiles visibles.
 *    => Pour ajouter une photo, il suffit d'ajouter UNE seule tuile dans le HTML
 *       (voir le commentaire dans index.html). Le reste est géré ici.
 *
 * 2) Lightbox : un clic sur une photo l'affiche en grand. On réutilise la
 *    lightbox déjà présente dans la page (#lightbox / #lightbox-img), la même
 *    que la galerie plus bas. La fermeture (bouton ✕, clic sur le fond, touche
 *    Échap) est déjà gérée par le script principal d'index.html.
 *
 * 3) Photos « avant / après » : une tuile dont l'image porte data-avant-apres
 *    s'ouvre avec le curseur de comparaison à faire glisser (js/before-after.js)
 *    à la place de l'image fixe.
 *
 * 4) Défilement manuel : le script reprend la main sur l'animation CSS pour que
 *    chaque rangée puisse aussi être poussée à la main, sans arrêter la boucle :
 *    - glisser au doigt (mobile) ou à la souris (ordinateur), avec élan ;
 *    - balayage horizontal du pavé tactile (ou Maj + molette) ;
 *    - boutons ‹ › sous les rangées (et flèches du clavier sur ces boutons).
 *    Le défilement automatique reprend tout seul ensuite. Si le visiteur a
 *    demandé à réduire les animations, rien ne bouge seul mais le défilement
 *    manuel reste possible. Sans JavaScript, l'animation CSS d'origine s'applique.
 */
(function () {
  function setupRow(row) {
    // Évite de dupliquer deux fois (ex. si le script est exécuté plusieurs fois)
    if (row.dataset.looped === 'true') return;

    var tiles = Array.prototype.slice.call(row.children);
    if (tiles.length === 0) return;

    var fragment = document.createDocumentFragment();
    tiles.forEach(function (tile) {
      var clone = tile.cloneNode(true);
      // La copie est purement décorative : on la masque aux lecteurs d'écran
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('role');
      // On vide le alt des images dupliquées (évite les doublons pour les
      // lecteurs d'écran) mais on conserve le texte d'origine dans data-alt
      // pour le réutiliser comme légende de la lightbox.
      clone.querySelectorAll('img').forEach(function (img) {
        img.setAttribute('data-alt', img.getAttribute('alt') || '');
        img.setAttribute('alt', '');
      });
      fragment.appendChild(clone);
    });

    row.appendChild(fragment);
    row.dataset.looped = 'true';
  }

  function setupLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var caption = document.getElementById('lightbox-caption');
    // Si la lightbox de la page n'existe pas, on n'active pas le clic-pour-agrandir.
    if (!lightbox || !lightboxImg) return;

    function setCaption(text) {
      // La légende est masquée automatiquement en CSS quand elle est vide (:empty)
      if (caption) caption.textContent = text || '';
    }

    // Comparateur avant/après affiché à la place de l'image agrandie
    function clearCompare() {
      // Garde indispensable : cette fonction est appelée par l'observateur de
      // classe ci-dessous ; modifier la classe sans raison le relancerait en boucle.
      if (!lightbox.classList.contains('ba-open')) return;
      lightbox.querySelectorAll('.ba-slider').forEach(function (slider) {
        slider.remove();
      });
      lightbox.classList.remove('ba-open');
    }

    function showCompare(src, altText) {
      if (!window.RDCBeforeAfter) return; // script absent : on garde l'image fixe
      lightboxImg.parentNode.appendChild(window.RDCBeforeAfter.create(src, altText));
      lightbox.classList.add('ba-open');
    }

    // La fermeture est gérée ailleurs (bouton ✕, fond, Échap) : on surveille
    // simplement la classe « active » pour retirer le comparateur à ce moment-là.
    if ('MutationObserver' in window) {
      new MutationObserver(function () {
        if (!lightbox.classList.contains('active')) clearCompare();
      }).observe(lightbox, { attributes: true, attributeFilter: ['class'] });
    }

    // Délégation : un seul écouteur couvre toutes les photos (originaux + clones)
    document.addEventListener('click', function (e) {
      if (!e.target || !e.target.closest) return;

      var img = e.target.closest('.showcase-tile img');
      if (img) {
        // Texte alternatif (pour l'accessibilité de l'image agrandie)
        var altText = img.getAttribute('alt') || img.getAttribute('data-alt') || '';
        // Légende affichée sous la photo : on privilégie data-legende (texte de
        // contexte personnalisé), sinon on retombe sur le alt descriptif.
        var legende = img.getAttribute('data-legende') || altText;
        lightboxImg.src = img.getAttribute('src');
        lightboxImg.alt = altText || 'Photo de chantier';
        setCaption(legende); // texte de contexte affiché sous la photo
        clearCompare();
        if (img.hasAttribute('data-avant-apres')) {
          showCompare(img.getAttribute('src'), altText);
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
      }

      // La galerie existante (plus bas dans la page) réutilise la même lightbox
      // mais n'a pas de texte de contexte : on vide la légende pour éviter
      // qu'une légende du carrousel n'y reste affichée par erreur.
      if (e.target.closest('.gallery-image-wrapper')) {
        setCaption('');
        clearCompare();
      }
    });
  }


  // ---------------------------------------------------------------------------
  // Défilement manuel (glisser, pavé tactile, boutons)
  // ---------------------------------------------------------------------------
  var DRAG_THRESHOLD = 6;   // px avant de considérer que c'est un glissement (et pas un clic)
  var FRICTION = 4;         // freinage de l'élan (par seconde) : plus grand = s'arrête plus vite
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createRowController(row) {
    var direction = row.classList.contains('reverse') ? 1 : -1;
    var state = {
      row: row,
      x: 0,           // décalage actuel (px), toujours dans ]-loop, 0]
      loop: 0,        // largeur d'un jeu de tuiles (distance avant de boucler)
      speed: 0,       // vitesse automatique (px/s)
      momentum: 0,    // élan après un glissement ou un bouton (px/s)
      hovered: false,
      drag: null,
      suppressClick: false
    };

    function measure() {
      var first = row.children[0];
      var half = row.children.length / 2;
      var firstClone = row.children[half];
      if (!first || !firstClone) return;
      var oldLoop = state.loop;
      state.loop = firstClone.offsetLeft - first.offsetLeft;
      // La durée de l'animation CSS (qui varie selon la taille d'écran) donne la
      // vitesse : on la lit en réactivant brièvement l'animation (sans rendu).
      row.style.animation = '';
      var duration = parseFloat(getComputedStyle(row).animationDuration) || 70;
      row.style.animation = 'none';
      state.speed = reduceMotion ? 0 : state.loop / duration;
      if (oldLoop === 0) {
        state.x = direction === 1 ? -state.loop : 0;
      } else if (oldLoop !== state.loop) {
        state.x = state.x * (state.loop / oldLoop);
      }
      wrap();
      apply();
    }

    function wrap() {
      if (state.loop <= 0) return;
      while (state.x <= -state.loop) state.x += state.loop;
      while (state.x > 0) state.x -= state.loop;
    }

    function apply() {
      row.style.transform = 'translate3d(' + state.x + 'px,0,0)';
    }

    // ----- Glisser (souris, doigt, stylet)
    row.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      state.drag = {
        id: e.pointerId, startX: e.clientX, startY: e.clientY,
        lastX: e.clientX, lastT: performance.now(), originX: state.x,
        active: false, velocity: 0
      };
      state.momentum = 0;
    });

    row.addEventListener('pointermove', function (e) {
      var d = state.drag;
      if (!d || e.pointerId !== d.id) return;
      // Bouton relâché hors de la rangée : on abandonne le glissement
      if (e.pointerType === 'mouse' && e.buttons === 0) { state.drag = null; return; }
      var dx = e.clientX - d.startX;
      if (!d.active) {
        // Sur mobile, un mouvement plutôt vertical laisse la page défiler
        if (Math.abs(e.clientY - d.startY) > Math.abs(dx)) {
          if (Math.abs(e.clientY - d.startY) > DRAG_THRESHOLD) state.drag = null;
          return;
        }
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        d.active = true;
        row.classList.add('is-dragging');
        try { row.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      }
      var now = performance.now();
      var dt = (now - d.lastT) / 1000;
      if (dt > 0) d.velocity = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.velocity;
      d.lastX = e.clientX;
      d.lastT = now;
      state.x = d.originX + dx;
      wrap();
      apply();
      e.preventDefault();
    });

    function endDrag(e) {
      var d = state.drag;
      if (!d || e.pointerId !== d.id) return;
      state.drag = null;
      if (!d.active) return;
      row.classList.remove('is-dragging');
      // Un doigt resté immobile avant de lâcher ne relance pas d'élan
      var idle = performance.now() - d.lastT > 100;
      state.momentum = idle ? 0 : Math.max(-3000, Math.min(3000, d.velocity));
      // Le relâchement d'un glissement ne doit pas ouvrir la photo en grand
      state.suppressClick = true;
      setTimeout(function () { state.suppressClick = false; }, 0);
    }
    row.addEventListener('pointerup', endDrag);
    row.addEventListener('pointercancel', endDrag);

    row.addEventListener('click', function (e) {
      if (state.suppressClick) {
        e.stopPropagation();
        e.preventDefault();
        state.suppressClick = false;
      }
    }, true);

    // Empêche le « fantôme » de glisser-déposer natif des images
    row.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // ----- Pavé tactile / Maj + molette
    row.addEventListener('wheel', function (e) {
      var dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (!dx || Math.abs(dx) < Math.abs(e.shiftKey ? 0 : e.deltaY)) return;
      if (e.deltaMode === 1) dx *= 16; // molette en « lignes »
      state.momentum = 0;
      state.x -= dx;
      wrap();
      apply();
      e.preventDefault();
    }, { passive: false });

    // Pause au survol à la souris (comme avant) : clic confortable sur une photo
    row.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') state.hovered = true;
    });
    row.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') state.hovered = false;
    });

    state.measure = measure;
    // Pousse la rangée d'une distance donnée, avec un mouvement amorti
    state.push = function (distance) {
      state.momentum = distance * FRICTION;
    };
    state.step = function () {
      var tile = row.children[0];
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      return tile ? tile.offsetWidth + gap : 300;
    };
    state.tick = function (dt) {
      if (state.drag && state.drag.active) return;
      var move = 0;
      if (!state.hovered) move += direction * state.speed * dt;
      if (state.momentum) {
        move += state.momentum * dt;
        state.momentum *= Math.exp(-FRICTION * dt);
        if (Math.abs(state.momentum) < 5) state.momentum = 0;
      }
      if (!move) return;
      state.x += move;
      wrap();
      apply();
    };
    return state;
  }

  function makeNavButton(label, path, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'showcase-btn';
    button.setAttribute('aria-label', label);
    button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="' + path + '"></polyline></svg>';
    button.addEventListener('click', onClick);
    return button;
  }

  function setupManualScroll(section) {
    if (section.dataset.manual === 'true') return;
    var rows = Array.prototype.slice.call(section.querySelectorAll('.showcase-row'));
    if (!rows.length || !window.requestAnimationFrame) return;
    section.dataset.manual = 'true';
    section.classList.add('is-manual');

    var controllers = rows.map(createRowController);
    controllers.forEach(function (c) { c.measure(); });

    function pushAll(sign) {
      controllers.forEach(function (c) { c.push(sign * c.step()); });
    }

    // Boutons ‹ › : « suivant » fait avancer toutes les rangées vers la gauche
    var nav = document.createElement('div');
    nav.className = 'showcase-nav';
    nav.appendChild(makeNavButton('Faire défiler les photos vers la gauche', '15 6 9 12 15 18', function () { pushAll(1); }));
    nav.appendChild(makeNavButton('Faire défiler les photos vers la droite', '9 6 15 12 9 18', function () { pushAll(-1); }));
    nav.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { pushAll(1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { pushAll(-1); e.preventDefault(); }
    });
    section.appendChild(nav);

    var last = null;
    function frame(now) {
      var dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      controllers.forEach(function (c) { c.tick(dt); });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        controllers.forEach(function (c) { c.measure(); });
      }, 150);
    });
  }

  function init() {
    document.querySelectorAll('.showcase-row').forEach(setupRow);
    document.querySelectorAll('.showcase').forEach(setupManualScroll);
    setupLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
