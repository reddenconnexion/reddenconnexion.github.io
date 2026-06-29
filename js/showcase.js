/*
 * Showcase « Ce que je fais pour vous, en images »
 * -------------------------------------------------
 * Le défilement en boucle (animation CSS translateX -50%) a besoin que chaque
 * rangée contienne ses tuiles EN DOUBLE. Plutôt que de devoir écrire chaque
 * tuile deux fois à la main dans index.html, ce script clone automatiquement
 * les tuiles visibles et ajoute la copie nécessaire à la boucle.
 *
 * => Pour ajouter une photo, il suffit d'ajouter UNE seule tuile dans le HTML
 *    (voir le commentaire dans index.html). Le reste est géré ici.
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
      // On vide les textes alternatifs des images dupliquées (évite les doublons)
      clone.querySelectorAll('img').forEach(function (img) {
        img.setAttribute('alt', '');
      });
      fragment.appendChild(clone);
    });

    row.appendChild(fragment);
    row.dataset.looped = 'true';
  }

  function init() {
    var rows = document.querySelectorAll('.showcase-row');
    rows.forEach(function (row) {
      setupRow(row);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
