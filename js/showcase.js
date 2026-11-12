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

  function init() {
    document.querySelectorAll('.showcase-row').forEach(setupRow);
    setupLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
