# 🔐 DNSSEC : OVH + Cloudflare - Guide Complet

## ⚠️ IMPORTANT : DÉSACTIVER le DNSSEC chez OVH !

**Réponse courte :** Non, il ne faut PAS rétablir le DNSSEC chez OVH. Au contraire, il faut le **DÉSACTIVER** !

---

## 🔍 Comprendre le Problème

### Qu'est-ce que le DNSSEC ?

**DNSSEC** = Sécurité DNS qui empêche les attaques de type "DNS spoofing" (usurpation DNS)

C'est comme un **"sceau de sécurité"** qui garantit que les enregistrements DNS n'ont pas été modifiés.

### Le Problème avec OVH + Cloudflare

**AVANT (avec nameservers OVH) :**
```
Domaine → Nameservers OVH → DNSSEC géré par OVH ✅
```

**APRÈS (avec nameservers Cloudflare) :**
```
Domaine → Nameservers Cloudflare → DNSSEC OVH ne correspond plus ❌
```

**Si vous laissez le DNSSEC OVH activé :**
- Les clés DNSSEC d'OVH sont encore enregistrées chez le registrar
- Mais vos nameservers pointent vers Cloudflare
- Les clés ne correspondent plus → **Votre site peut devenir inaccessible !**

---

## ✅ Solution : Gérer le DNSSEC correctement

### Étape 1 : DÉSACTIVER le DNSSEC chez OVH

**Quand le faire ?** AVANT de changer les nameservers (idéalement) ou juste après

#### Instructions OVH :

1. Se connecter sur https://www.ovh.com/manager/
2. Aller dans **Noms de domaine**
3. Cliquer sur votre domaine
4. Aller dans l'onglet **DNSSEC**
5. Si DNSSEC est **activé** :
   - Cliquer sur le bouton **"Supprimer le DNSSEC"** ou **"Désactiver"**
   - Confirmer
6. Si DNSSEC est déjà **désactivé** :
   - Parfait, rien à faire ! ✅

**⏱️ Délai de propagation :** 24-48h pour que la désactivation soit complète

---

### Étape 2 : Activer le DNSSEC chez Cloudflare (APRÈS validation nameservers)

**⚠️ Important :** Attendez d'avoir reçu l'email "Votre domaine est actif sur Cloudflare" !

#### Instructions Cloudflare :

1. Se connecter sur https://dash.cloudflare.com
2. Cliquer sur votre site
3. Dans le menu de gauche, aller dans **DNS** → **Settings**
4. Descendre jusqu'à la section **DNSSEC**
5. Cliquer sur **"Enable DNSSEC"** ou **"Activer DNSSEC"**

Cloudflare va afficher :
```
DS Record (à ajouter chez votre registrar) :

Key Tag     : 12345
Algorithm   : 13
Digest Type : 2
Digest      : 1234567890ABCDEF...
```

6. **Copier ces informations** (vous en aurez besoin pour OVH)

---

### Étape 3 : Ajouter le DS Record chez OVH

**⚠️ Ne le faire qu'APRÈS avoir activé DNSSEC chez Cloudflare !**

1. Retourner sur https://www.ovh.com/manager/
2. Aller dans **Noms de domaine**
3. Cliquer sur votre domaine
4. Aller dans l'onglet **DNSSEC**
5. Cliquer sur **"Ajouter un enregistrement DNSSEC"** ou **"Configurer"**
6. Choisir **"Configuration externe"** (car Cloudflare gère le DNSSEC, pas OVH)
7. Remplir avec les informations Cloudflare :
   ```
   Key Tag     : [valeur Cloudflare]
   Flag        : 257 (généralement)
   Algorithm   : [valeur Cloudflare]
   Public Key  : [digest Cloudflare]
   ```
8. Valider

**⏱️ Délai de propagation :** 24-48h

---

## 📋 Chronologie Complète (Ordre Correct)

### Option A : Si vous n'avez PAS ENCORE changé les nameservers

```
1. [OVH] Désactiver DNSSEC
   ⏱️ Attendre 24-48h

2. [Cloudflare] Ajouter votre site

3. [OVH] Changer les nameservers vers Cloudflare
   ⏱️ Attendre email Cloudflare (2-24h)

4. [Cloudflare] Activer DNSSEC
   → Récupérer le DS Record

5. [OVH] Ajouter le DS Record Cloudflare
   ⏱️ Attendre 24-48h

6. ✅ DNSSEC actif avec Cloudflare !
```

### Option B : Si vous avez DÉJÀ changé les nameservers

```
1. [OVH] Vérifier l'état du DNSSEC
   → Si activé : DÉSACTIVER immédiatement
   → Si désactivé : Parfait, continuer

2. Attendre email Cloudflare (2-24h)

3. [Cloudflare] Activer DNSSEC
   → Récupérer le DS Record

4. [OVH] Ajouter le DS Record Cloudflare

5. ✅ DNSSEC actif avec Cloudflare !
```

---

## ⚡ Recommandation : DNSSEC est-il obligatoire ?

**Non, le DNSSEC n'est PAS obligatoire** pour avoir A+ sur Security Headers.

### Avantages du DNSSEC :
- ✅ Protection contre DNS spoofing
- ✅ Meilleure sécurité globale
- ✅ Recommandé pour les sites sensibles

### Inconvénients :
- ⚠️ Configuration plus complexe
- ⚠️ Délais de propagation longs (24-48h)
- ⚠️ Si mal configuré, peut rendre le site inaccessible

### Mon conseil :

**Pour VOUS :**
1. **Désactiver le DNSSEC chez OVH** (pour éviter les problèmes)
2. **Configurer Cloudflare Workers et obtenir A+** (priorité #1)
3. **Une fois A+ obtenu**, vous pourrez activer DNSSEC chez Cloudflare si vous le souhaitez

**Ordre de priorité :**
```
1. Score A+ sur Security Headers     ← URGENT
2. Site fonctionnel et rapide        ← IMPORTANT
3. DNSSEC activé                     ← OPTIONNEL (mais bien)
```

---

## 🔧 Vérifier l'état actuel de votre DNSSEC

### Méthode 1 : Interface OVH

1. https://www.ovh.com/manager/
2. Noms de domaine → Votre domaine → Onglet **DNSSEC**
3. Vous voyez :
   - **"DNSSEC activé"** → Il faut le désactiver !
   - **"DNSSEC désactivé"** → Parfait, rien à faire

### Méthode 2 : Ligne de commande (pour les techniciens)

```bash
dig +dnssec votredomaine.fr
```

Si vous voyez `ad` (authenticated data) dans la réponse, DNSSEC est actif.

### Méthode 3 : Outil en ligne

Aller sur https://dnssec-analyzer.verisignlabs.com/
Entrer votre domaine et cliquer "Analyze"

---

## ❌ Symptômes d'un DNSSEC mal configuré

Si vous avez mal configuré le DNSSEC, vous pourriez voir :

- ❌ Site inaccessible (erreur DNS)
- ❌ `SERVFAIL` dans les requêtes DNS
- ❌ "This site can't be reached"
- ❌ Certains visiteurs peuvent accéder, d'autres non

**Solution d'urgence :**
1. Aller chez OVH
2. Désactiver DNSSEC immédiatement
3. Attendre 1-2h
4. Le site redevient accessible

---

## 📊 Résumé : Ce que vous devez faire

### Maintenant (URGENT) :
```
[ ] Se connecter à OVH
[ ] Aller dans DNSSEC
[ ] Vérifier l'état
[ ] Si activé → DÉSACTIVER
```

### Après avoir obtenu A+ (OPTIONNEL) :
```
[ ] Activer DNSSEC chez Cloudflare
[ ] Récupérer le DS Record
[ ] Ajouter le DS Record chez OVH
[ ] Attendre propagation (24-48h)
[ ] Tester avec dnssec-analyzer.verisignlabs.com
```

---

## 🎯 FAQ DNSSEC

### Le DNSSEC est-il nécessaire pour A+ ?
**Non.** Security Headers teste les headers HTTP, pas le DNSSEC.

### Cloudflare gère-t-il automatiquement le DNSSEC ?
**Non.** Vous devez l'activer manuellement ET ajouter le DS Record chez OVH.

### Si je ne fais rien avec DNSSEC ?
Si DNSSEC est désactivé chez OVH → Tout fonctionne normalement.
Si DNSSEC est activé chez OVH → Risque que le site devienne inaccessible.

### Je peux activer DNSSEC plus tard ?
**Oui !** Vous pouvez l'activer n'importe quand après avoir migré vers Cloudflare.

### DNSSEC ralentit-il mon site ?
**Non.** Impact négligeable sur les performances.

---

## ✅ Checklist Rapide

**AVANT de changer les nameservers :**
- [ ] Désactiver DNSSEC chez OVH

**APRÈS avoir obtenu A+ :**
- [ ] (Optionnel) Activer DNSSEC chez Cloudflare
- [ ] (Optionnel) Ajouter DS Record chez OVH

**En cas de problème :**
- [ ] Désactiver DNSSEC chez OVH immédiatement
- [ ] Attendre 1-2h
- [ ] Réessayer

---

## 🚀 Action Immédiate

**Ce que vous devez faire MAINTENANT :**

1. Aller sur https://www.ovh.com/manager/
2. Noms de domaine → Votre domaine → **DNSSEC**
3. **Si activé** → Cliquer "Désactiver" / "Supprimer"
4. **Si désactivé** → Parfait, continuer avec le guide OVH + Cloudflare Workers

Le DNSSEC chez Cloudflare, vous le ferez **PLUS TARD**, une fois A+ obtenu ! 🎯

---

## 📞 Besoin d'aide ?

Si vous avez des questions sur :
- L'état actuel de votre DNSSEC
- Comment le désactiver chez OVH
- Si vous devez l'activer chez Cloudflare maintenant

Dites-le moi ! Je vous guiderai ! 🚀
