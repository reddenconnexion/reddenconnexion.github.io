/*
 * Interrupteur « Coupez le courant » du bloc d'accueil
 * -----------------------------------------------------
 * Un interrupteur posé sur la photo d'accueil. Quand le visiteur l'éteint :
 *   - le bloc d'accueil s'assombrit (classe .is-off sur .hero) ;
 *   - le texte habituel laisse place au message « Plus de courant ? » ;
 *   - le bouton d'appel « Panne urgente » se met à pulser.
 * Un second appui rallume tout. Rien n'est mémorisé : la page se recharge allumée.
 *
 * Toute l'apparence est dans les styles du bloc d'accueil d'index.html
 * (section « Interrupteur »). Sans JavaScript, l'interrupteur reste masqué.
 */
(function () {
  'use strict';

  function init() {
    var hero = document.querySelector('.hero');
    var wrap = document.getElementById('powerSwitchWrap');
    var button = document.getElementById('powerSwitch');
    var hint = document.getElementById('powerSwitchHint');
    if (!hero || !wrap || !button) return;

    function setPower(on) {
      hero.classList.toggle('is-off', !on);
      button.setAttribute('aria-checked', on ? 'true' : 'false');
      if (hint) hint.textContent = on ? 'Coupez le courant' : 'Rallumez';
    }

    button.addEventListener('click', function () {
      setPower(button.getAttribute('aria-checked') !== 'true');
      // Petit retour tactile sur les téléphones qui le permettent
      if (navigator.vibrate) navigator.vibrate(30);
    });

    setPower(true);
    wrap.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
