(function () {
    'use strict';

    var STORAGE_KEY = 'rdc_cookie_consent_v1';
    var EXPIRY_MS = 365 * 24 * 60 * 60 * 1000;

    function readConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return null;
            if (typeof data.expires !== 'number' || Date.now() > data.expires) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return data.choice === 'accept' || data.choice === 'refuse' ? data.choice : null;
        } catch (e) {
            return null;
        }
    }

    function writeConsent(choice) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                choice: choice,
                expires: Date.now() + EXPIRY_MS,
                ts: Date.now()
            }));
        } catch (e) {}
    }

    function injectStyles() {
        if (document.getElementById('rdc-cookie-styles')) return;
        var css = ''
            + '#rdc-cookie-banner{'
            +   'position:fixed;left:0;right:0;bottom:0;z-index:99999;'
            +   'background:#1a1a1a;color:#f5f5f5;'
            +   'box-shadow:0 -6px 24px rgba(0,0,0,.35);'
            +   'border-top:3px solid #ff3333;'
            +   'padding:1rem 1.25rem calc(1rem + env(safe-area-inset-bottom,0px));'
            +   'font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;font-size:.92rem;line-height:1.5;'
            +   'animation:rdc-cb-up .35s ease-out;'
            + '}'
            + '@keyframes rdc-cb-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}'
            + '#rdc-cookie-banner .rdc-cb-inner{'
            +   'max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:1rem;'
            + '}'
            + '#rdc-cookie-banner .rdc-cb-text{flex:1 1 320px;min-width:0}'
            + '#rdc-cookie-banner .rdc-cb-text strong{color:#ff9999}'
            + '#rdc-cookie-banner a{color:#ff9999;text-decoration:underline}'
            + '#rdc-cookie-banner a:hover{color:#fff}'
            + '#rdc-cookie-banner .rdc-cb-actions{display:flex;gap:.5rem;flex-wrap:wrap}'
            + '#rdc-cookie-banner button{'
            +   'cursor:pointer;border:none;border-radius:6px;padding:.7rem 1.1rem;'
            +   'font-weight:700;font-size:.9rem;transition:transform .1s,opacity .2s;'
            +   'font-family:inherit;'
            + '}'
            + '#rdc-cookie-banner button:active{transform:scale(.97)}'
            + '#rdc-cookie-banner .rdc-cb-accept{background:linear-gradient(135deg,#ff3333 0%,#cc0000 100%);color:#fff}'
            + '#rdc-cookie-banner .rdc-cb-accept:hover{opacity:.92}'
            + '#rdc-cookie-banner .rdc-cb-refuse{background:transparent;color:#ddd;border:1px solid #555}'
            + '#rdc-cookie-banner .rdc-cb-refuse:hover{background:#2d2d2d;color:#fff}'
            + '@media (max-width:640px){'
            +   '#rdc-cookie-banner{padding:.85rem .9rem calc(.85rem + env(safe-area-inset-bottom,0px))}'
            +   '#rdc-cookie-banner .rdc-cb-inner{flex-direction:column;align-items:stretch;gap:.7rem}'
            +   '#rdc-cookie-banner .rdc-cb-actions{justify-content:stretch}'
            +   '#rdc-cookie-banner .rdc-cb-actions button{flex:1}'
            + '}';
        var style = document.createElement('style');
        style.id = 'rdc-cookie-styles';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    function buildBanner() {
        var banner = document.createElement('div');
        banner.id = 'rdc-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'Consentement aux cookies et services tiers');

        var inner = document.createElement('div');
        inner.className = 'rdc-cb-inner';

        var text = document.createElement('div');
        text.className = 'rdc-cb-text';
        text.innerHTML = '<strong>Respect de votre vie privée.</strong> '
            + 'Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement. '
            + 'La miniature de notre vidéo YouTube et la carte interactive (OpenStreetMap/CARTO) chargent du contenu depuis des serveurs tiers. '
            + 'Aucun cookie publicitaire ni traceur analytique n’est utilisé. '
            + '<a href="/confidentialite.html">En savoir plus</a>.';

        var actions = document.createElement('div');
        actions.className = 'rdc-cb-actions';

        var refuse = document.createElement('button');
        refuse.type = 'button';
        refuse.className = 'rdc-cb-refuse';
        refuse.textContent = 'Refuser';
        refuse.setAttribute('aria-label', 'Refuser le chargement des services tiers');

        var accept = document.createElement('button');
        accept.type = 'button';
        accept.className = 'rdc-cb-accept';
        accept.textContent = 'Accepter';
        accept.setAttribute('aria-label', 'Accepter le chargement des services tiers');

        actions.appendChild(refuse);
        actions.appendChild(accept);
        inner.appendChild(text);
        inner.appendChild(actions);
        banner.appendChild(inner);

        return { banner: banner, accept: accept, refuse: refuse };
    }

    function dismiss(banner) {
        banner.style.transition = 'transform .25s ease-in, opacity .25s ease-in';
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 280);
    }

    function init() {
        if (readConsent() !== null) return;

        injectStyles();
        var built = buildBanner();
        document.body.appendChild(built.banner);

        built.accept.addEventListener('click', function () {
            writeConsent('accept');
            dismiss(built.banner);
        });

        built.refuse.addEventListener('click', function () {
            writeConsent('refuse');
            dismiss(built.banner);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
