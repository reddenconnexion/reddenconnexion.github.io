# 🎯 Guide Complet : OVH + Cloudflare Workers → Score A+

## 📋 Votre Configuration

- ✅ Domaine chez OVH
- ✅ Compte Cloudflare existant
- ✅ Option A : GitHub Pages + Cloudflare Workers
- 🎯 Objectif : Score A+ sur securityheaders.com

**Temps total : 20 minutes + attente nameservers (2-24h)**

---

## 🚀 PARTIE 1 : Ajouter votre site à Cloudflare

### Étape 1.1 : Se connecter à Cloudflare

1. Aller sur https://dash.cloudflare.com
2. Se connecter avec votre compte existant

### Étape 1.2 : Ajouter votre site

1. Sur le dashboard, cliquer sur **"Ajouter un site"** ou **"Add a site"** (bouton bleu en haut à droite)
2. Entrer votre nom de domaine (exemple : `reddenconnexion.fr`)
3. Cliquer sur **"Ajouter un site"**

### Étape 1.3 : Choisir le plan Free

1. Cloudflare va afficher les plans disponibles :
   ```
   Free        0 €/mois     [Sélectionner]
   Pro        20 €/mois
   Business  200 €/mois
   ```
2. Cliquer sur **"Sélectionner"** sous **Free (0 €/mois)**
3. Cliquer sur **"Continuer"**

### Étape 1.4 : Scanner les DNS

Cloudflare va automatiquement scanner vos DNS actuels (ça prend 30 secondes)

Vous verrez quelque chose comme :
```
Type    Nom    Contenu                      Proxy
A       @      185.199.108.153             ☁️ Proxied
CNAME   www    reddenconnexion.github.io   ☁️ Proxied
```

**Important :** Vérifier que le nuage orange (☁️) est activé (Proxied) = Cloudflare est actif

Si tout est bon, cliquer sur **"Continuer"**

---

## 🔧 PARTIE 2 : Changer les Nameservers chez OVH

### Étape 2.1 : Récupérer les nameservers Cloudflare

Cloudflare va afficher une page avec vos **2 nameservers** :

```
Remplacer vos nameservers par :

1️⃣ carter.ns.cloudflare.com
2️⃣ maya.ns.cloudflare.com

(Les noms exacts varient, notez les vôtres !)
```

**⚠️ IMPORTANT :** Copiez ces 2 nameservers, vous en aurez besoin !

**Ne fermez PAS cette page Cloudflare**, gardez-la ouverte dans un onglet.

### Étape 2.2 : Se connecter à OVH

1. Ouvrir un **nouvel onglet**
2. Aller sur https://www.ovh.com/manager/
3. Se connecter avec votre identifiant OVH

### Étape 2.3 : Accéder à votre domaine

1. Dans le menu de gauche, cliquer sur **"Noms de domaine"** ou **"Web Cloud"** puis **"Noms de domaine"**
2. Cliquer sur votre domaine (ex: `reddenconnexion.fr`)

Vous arrivez sur la page de gestion de votre domaine.

### Étape 2.4 : Modifier les serveurs DNS

1. En haut de la page, cliquer sur l'onglet **"Serveurs DNS"**

Vous verrez les serveurs DNS actuels d'OVH, quelque chose comme :
```
dnsXXX.ovh.net
nsXXX.ovh.net
```

2. Cliquer sur le bouton **"Modifier les serveurs DNS"** (à droite)

3. Une fenêtre s'ouvre avec 2 options :
   ```
   ⚪ Utiliser les serveurs DNS d'OVH
   ⚪ Utiliser d'autres serveurs DNS
   ```

4. Sélectionner **"Utiliser d'autres serveurs DNS"**

5. Vous verrez 2 champs pour entrer les nameservers :
   ```
   Serveur DNS n°1 : [________________]
   Serveur DNS n°2 : [________________]
   ```

6. **Copier-coller** les nameservers Cloudflare (de l'étape 2.1) :
   ```
   Serveur DNS n°1 : carter.ns.cloudflare.com
   Serveur DNS n°2 : maya.ns.cloudflare.com
   ```
   (Utilisez VOS nameservers Cloudflare, pas ces exemples !)

7. Cliquer sur **"Appliquer la configuration"**

8. OVH affiche un avertissement :
   ```
   ⚠️ La modification des serveurs DNS peut prendre jusqu'à 48h
   ```

9. Cliquer sur **"Valider"**

**✅ C'EST FAIT !** Les nameservers sont changés chez OVH.

### Étape 2.5 : Confirmer à Cloudflare

1. Retourner sur l'onglet **Cloudflare**
2. En bas de la page, cliquer sur **"Terminé, vérifier les nameservers"**
3. Cloudflare affiche :
   ```
   🔄 Vérification en cours...
   Nous vérifions que vos nameservers ont été changés.
   Vous recevrez un email quand ce sera actif (2-24h)
   ```
4. Cliquer sur **"Terminer"**

**⏱️ ATTENTE :** Vous allez recevoir un email de Cloudflare dans les 2 à 24h avec le sujet :
```
"[Votre domaine] est maintenant actif sur Cloudflare"
```

**Pendant ce temps :**
- ✅ Votre site continue de fonctionner normalement
- ✅ Vous pouvez déjà préparer le Worker (Partie 3)

---

## 🛡️ PARTIE 3 : Créer le Cloudflare Worker (Headers de sécurité)

**⚠️ IMPORTANT :** Attendez de recevoir l'email de confirmation Cloudflare avant de faire cette partie !

Une fois que vous avez reçu l'email "Votre domaine est actif sur Cloudflare" :

### Étape 3.1 : Accéder à Workers

1. Dans le dashboard Cloudflare (https://dash.cloudflare.com)
2. Dans le menu de gauche, cliquer sur **"Workers & Pages"**
3. Cliquer sur **"Create application"** ou **"Créer une application"**
4. Cliquer sur **"Create Worker"** ou **"Créer un Worker"**

### Étape 3.2 : Nommer le Worker

1. Cloudflare propose un nom aléatoire (ex: `bitter-sun-1234`)
2. **Renommer en :** `security-headers`
3. Cliquer sur **"Deploy"** ou **"Déployer"**

Le Worker est créé avec un code par défaut.

### Étape 3.3 : Modifier le code du Worker

1. Cliquer sur **"Edit code"** ou **"Modifier le code"** (bouton bleu)
2. Vous arrivez dans l'éditeur de code

**Vous voyez du code JavaScript existant → TOUT SUPPRIMER**

3. **Sélectionner tout** (Ctrl+A)
4. **Supprimer** (Delete)
5. **Copier-coller ce code COMPLET** :

```javascript
export default {
  async fetch(request, env, ctx) {
    // Récupérer la réponse originale de GitHub Pages
    const response = await fetch(request);

    // Créer une nouvelle réponse avec les headers de sécurité
    const newResponse = new Response(response.body, response);

    // ========================================
    // HEADERS DE SÉCURITÉ POUR SCORE A+
    // ========================================

    // 1. Content Security Policy (Protection contre XSS)
    newResponse.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://formspree.io; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://formspree.io https://*.tile.openstreetmap.org; frame-ancestors 'none'"
    );

    // 2. X-Frame-Options (Empêche le site d'être chargé dans une iframe)
    newResponse.headers.set('X-Frame-Options', 'DENY');

    // 3. X-Content-Type-Options (Empêche le sniffing MIME)
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');

    // 4. Referrer Policy (Politique de referrer stricte)
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 5. Permissions Policy (Restreint les APIs sensibles)
    newResponse.headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
    );

    // 6. Strict-Transport-Security (Force HTTPS - HSTS)
    newResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // Retourner la réponse avec tous les headers de sécurité
    return newResponse;
  },
};
```

6. Cliquer sur **"Save and Deploy"** ou **"Enregistrer et déployer"** (en haut à droite)

**✅ Worker créé !** Mais il n'est pas encore actif sur votre site.

### Étape 3.4 : Configurer une Route (Activer le Worker)

1. Cliquer sur la flèche **← retour** (en haut à gauche)
2. Vous revenez à la liste des Workers
3. Cliquer sur votre Worker **`security-headers`**
4. Cliquer sur l'onglet **"Settings"** ou **"Paramètres"**
5. Descendre jusqu'à la section **"Triggers"** ou **"Déclencheurs"**
6. Dans la sous-section **"Routes"**, cliquer sur **"Add route"** ou **"Ajouter une route"**

7. Une fenêtre s'ouvre :
   ```
   Route : [_____________________]
   Zone  : [Sélectionner votre site]
   ```

8. **Dans "Route" :** Entrer `votredomaine.com/*`

   **Exemples :**
   ```
   reddenconnexion.fr/*
   ```

   **⚠️ Important :** Remplacez par VOTRE domaine + `/*` à la fin

9. **Dans "Zone" :** Sélectionner votre site dans le menu déroulant

10. Cliquer sur **"Save"** ou **"Enregistrer"**

**🎉 LE WORKER EST ACTIF !**

---

## ✅ PARTIE 4 : Activer HTTPS et optimisations

### Étape 4.1 : Configurer SSL/TLS

1. Dans le dashboard Cloudflare, cliquer sur votre site
2. Dans le menu de gauche, cliquer sur **"SSL/TLS"**
3. Dans **"Overview"**, sélectionner le mode **"Full"**
   ```
   ⚪ Off
   ⚪ Flexible
   ⚙️ Full          ← Sélectionner celui-ci
   ⚪ Full (strict)
   ```

### Étape 4.2 : Activer "Always Use HTTPS"

1. Toujours dans **"SSL/TLS"**, cliquer sur **"Edge Certificates"**
2. Descendre jusqu'à **"Always Use HTTPS"**
3. **Activer** le bouton (il devient bleu)

### Étape 4.3 : Activer HSTS

1. Dans la même page, descendre jusqu'à **"HTTP Strict Transport Security (HSTS)"**
2. Cliquer sur **"Enable HSTS"** ou **"Activer HSTS"**
3. Une fenêtre s'ouvre avec plusieurs options :
   ```
   Max Age           : [12 mois]
   Include subdomains: ✅
   Preload           : ✅
   No-Sniff          : ✅
   ```
4. Laisser les valeurs par défaut
5. Cliquer sur **"Save"** ou **"Enregistrer"**

**✅ CONFIGURATION TERMINÉE !**

---

## 🧪 PARTIE 5 : Tester le Score A+

### Étape 5.1 : Attendre la propagation

**Attendre 5 minutes** pour que les changements se propagent.

### Étape 5.2 : Vider le cache du navigateur

1. Ouvrir votre site dans le navigateur
2. Appuyer sur **Ctrl + Shift + R** (ou Cmd + Shift + R sur Mac)
3. Cela force le rechargement complet

### Étape 5.3 : Vérifier les headers (optionnel)

**Méthode navigateur :**
1. Appuyer sur **F12** (outils développeur)
2. Aller dans l'onglet **"Network"** ou **"Réseau"**
3. Rafraîchir la page (F5)
4. Cliquer sur la première ligne (votre page HTML)
5. Aller dans **"Headers"** ou **"En-têtes"**
6. Chercher dans **"Response Headers"** :
   ```
   content-security-policy: default-src 'self'; ...
   x-frame-options: DENY
   x-content-type-options: nosniff
   strict-transport-security: max-age=31536000; ...
   ```

Si vous voyez ces headers → **ÇA FONCTIONNE !** ✅

### Étape 5.4 : Tester sur Security Headers

1. Aller sur https://securityheaders.com
2. Entrer votre domaine (ex: `reddenconnexion.fr`)
3. Cliquer sur **"Scan"**

**Résultat attendu :**
```
🎉 Score : A+
```

Avec tous les headers en vert :
- ✅ Content-Security-Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ Strict-Transport-Security

**🎊 FÉLICITATIONS ! VOUS AVEZ A+ !**

---

## 📊 Récapitulatif : Qu'avez-vous fait ?

```
AVANT :
Visiteur → reddenconnexion.fr → GitHub Pages → Score F ❌

APRÈS :
Visiteur → reddenconnexion.fr
         → Cloudflare (+ headers sécurité via Worker)
         → GitHub Pages
         → Score A+ ✅
```

**Ce qui a changé :**
- ✅ Nameservers OVH → Cloudflare (tout le trafic passe par Cloudflare)
- ✅ Worker ajoute 6 headers de sécurité
- ✅ GitHub Pages continue d'héberger votre site (rien ne change côté code)
- ✅ Bonus : CDN Cloudflare (site plus rapide)
- ✅ Bonus : Protection DDoS gratuite

**Ce qui n'a PAS changé :**
- ✅ Votre workflow GitHub (git push, etc.)
- ✅ Votre code
- ✅ Votre domaine
- ✅ L'URL de votre site

---

## 🔧 Dépannage

### Je n'ai pas reçu l'email de Cloudflare

**Délai normal :** 2 à 24h

**Vérifier :**
1. Vérifier les spams
2. Se connecter à Cloudflare et voir si le site est "Actif"
3. Si après 48h rien, contacter le support Cloudflare

### Le score reste F après configuration

**Solutions :**
1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Attendre 5-10 minutes
3. Vérifier que la route du Worker est bien : `votredomaine.com/*`
4. Vérifier que le Worker est bien "Déployé" (pas de brouillon)

### Mon site affiche une erreur 520/522

**Cause :** Problème de connexion Cloudflare → GitHub Pages

**Solution :**
1. Aller dans **SSL/TLS** → **Overview**
2. Passer en mode **"Flexible"** au lieu de "Full"
3. Attendre 2 minutes
4. Tester le site

### Les headers n'apparaissent pas

**Vérifier :**
1. Le Worker est bien "Deployed" (pas "Draft")
2. La route existe bien dans "Triggers" → "Routes"
3. La route est : `votredomaine.com/*` (avec l'étoile)
4. Le site Cloudflare est "Active"

---

## 💰 Coûts

**Total : 0€**

Le plan Cloudflare Free inclut :
- ✅ 100 000 requêtes Workers/jour (largement suffisant)
- ✅ CDN mondial illimité
- ✅ SSL/TLS gratuit
- ✅ Protection DDoS
- ✅ Analytiques basiques

Pour un site d'électricien, vous ne dépasserez jamais les limites gratuites.

---

## 🎯 Checklist Complète

### Phase 1 : Cloudflare + OVH (20 minutes)
- [ ] Ajouter le site à Cloudflare
- [ ] Choisir plan Free
- [ ] Récupérer les 2 nameservers Cloudflare
- [ ] Se connecter à OVH
- [ ] Modifier les serveurs DNS
- [ ] Entrer les nameservers Cloudflare
- [ ] Confirmer à Cloudflare

### Phase 2 : Attente (2-24h)
- [ ] Recevoir l'email "Votre domaine est actif sur Cloudflare"

### Phase 3 : Worker (10 minutes)
- [ ] Créer un Worker
- [ ] Le nommer `security-headers`
- [ ] Copier-coller le code JavaScript
- [ ] Sauvegarder et déployer
- [ ] Ajouter une route : `votredomaine.com/*`

### Phase 4 : SSL/TLS (5 minutes)
- [ ] Mode SSL : Full
- [ ] Activer "Always Use HTTPS"
- [ ] Activer HSTS

### Phase 5 : Test
- [ ] Attendre 5 minutes
- [ ] Vider cache navigateur
- [ ] Tester sur securityheaders.com
- [ ] **Voir le score A+** 🎉

---

## 📞 Besoin d'aide ?

Si vous bloquez à une étape :
1. Notez le numéro de l'étape (ex: "Je bloque à 3.4")
2. Faites une capture d'écran si possible
3. Dites-moi où vous êtes bloqué

Je vous aiderai à débloquer la situation ! 🚀

---

## 🎊 Prochaine Étape

Une fois que vous avez A+, pensez à :
- Tester toutes les pages de votre site
- Vérifier que la carte Leaflet fonctionne toujours
- Vérifier que le formulaire de contact fonctionne
- Faire une nouvelle vidéo TikTok avec le score A+ ! 😎
