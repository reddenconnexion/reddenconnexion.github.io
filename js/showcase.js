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
    // Si la lightbox de la page n'existe pas, on n'active pas le clic-pour-agrandir.
    if (!lightbox || !lightboxImg) return;

    // Délégation : un seul écouteur couvre toutes les photos (originaux + clones)
    document.addEventListener('click', function (e) {
      var img = e.target && e.target.closest ? e.target.closest('.showcase-tile img') : null;
      if (!img) return;
      lightboxImg.src = img.getAttribute('src');
      lightboxImg.alt = img.getAttribute('alt') || img.getAttribute('data-alt') || 'Photo de chantier';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
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
