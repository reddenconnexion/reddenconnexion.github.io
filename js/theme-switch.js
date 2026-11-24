/**
 * Interrupteur de design : « Classique » (par défaut) ou « Alternatif »
 * (le style de la bâche de chantier).
 *
 * La feuille /css/theme-bache.css est présente sur chaque page mais désactivée
 * (attribut disabled). Ce script l'active si le visiteur a choisi le style
 * bâche, et ajoute un petit interrupteur flottant pour basculer.
 * Le choix est mémorisé sur l'appareil (localStorage) et suit le visiteur
 * de page en page. On peut aussi forcer un style par l'adresse :
 *   ?design=alternatif   ou   ?design=classique   (?design=bache reste accepté)
 * Sans JavaScript, le site garde son design classique.
 */
(function () {
    'use strict';
    var KEY = 'rdc-design';
    var link = document.getElementById('theme-bache');
    if (!link) return;

    function read() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function save(v) {
        try { localStorage.setItem(KEY, v); } catch (e) { /* navigation privée */ }
    }

    var param = null;
    try { param = new URLSearchParams(location.search).get('design'); } catch (e) { /* ancien navigateur */ }
    if (param === 'alternatif') param = 'bache';
    if (param === 'bache' || param === 'classique') save(param);

    var bache = (param || read()) === 'bache';

    function apply() {
        link.disabled = !bache;
        document.documentElement.setAttribute('data-design', bache ? 'bache' : 'classique');
    }
    apply();

    function build() {
        var style = document.createElement('style');
        style.textContent =
            '.design-switch{position:fixed;right:12px;bottom:20px;z-index:900;display:flex;align-items:center;gap:8px;' +
            'padding:7px 10px 7px 12px;border-radius:999px;border:2px solid #fff;background:#1a1a1a;color:#fff;' +
            'font:700 13px/1 "Segoe UI",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.45)}' +
            '.design-switch:focus-visible{outline:3px solid #ffc81a;outline-offset:3px}' +
            '.design-switch-track{position:relative;width:38px;height:20px;border-radius:999px;background:#ff3333;transition:background .2s}' +
            '.design-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}' +
            '.design-switch[aria-checked="true"] .design-switch-track{background:#ffc81a}' +
            '.design-switch[aria-checked="true"] .design-switch-knob{transform:translateX(18px);background:#120808}' +
            '@media (prefers-reduced-motion:reduce){.design-switch-track,.design-switch-knob{transition:none}}' +
            '@media print{.design-switch{display:none}}';
        document.head.appendChild(style);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'design-switch';
        btn.setAttribute('role', 'switch');
        btn.innerHTML = '<span class="design-switch-label"></span>' +
            '<span class="design-switch-track" aria-hidden="true"><span class="design-switch-knob"></span></span>';
        var label = btn.firstChild;

        function render() {
            btn.setAttribute('aria-checked', bache ? 'true' : 'false');
            btn.setAttribute('aria-label', 'Design alternatif');
            btn.title = bache ? 'Revenir au design classique' : 'Essayer le design alternatif';
            label.textContent = bache ? 'Design : alternatif' : 'Design : classique';
        }
        btn.addEventListener('click', function () {
            bache = !bache;
            save(bache ? 'bache' : 'classique');
            apply();
            render();
        });
        render();
        document.body.appendChild(btn);

        // Reste au-dessus du bandeau cookies et de la barre d'appel mobile
        function place() {
            var h = 0;
            ['#rdc-cookie-banner', '.mobile-call-bar'].forEach(function (sel) {
                var el = document.querySelector(sel);
                if (!el) return;
                var r = el.getBoundingClientRect();
                if (r.height && r.bottom >= window.innerHeight - 2) {
                    h = Math.max(h, window.innerHeight - r.top);
                }
            });
            btn.style.bottom = h ? (h + 12) + 'px' : '';
        }
        place();
        setTimeout(place, 1000);
        window.addEventListener('load', place);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, { passive: true });
        if (window.MutationObserver) {
            new MutationObserver(function () {
                place();
                // le bandeau peut changer de hauteur juste après son apparition
                setTimeout(place, 300);
                setTimeout(place, 1000);
            }).observe(document.body, { childList: true });
        }
    }

    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
})();
