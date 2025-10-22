# Configuration Google Maps pour Red Den Connexion

## Comment obtenir votre clé API Google Maps (GRATUIT)

### Étape 1 : Créer un compte Google Cloud
1. Allez sur : https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google (utilisez votre email Red Den Connexion si possible)
3. Acceptez les conditions d'utilisation

### Étape 2 : Créer un nouveau projet
1. Cliquez sur "Sélectionner un projet" en haut à gauche
2. Cliquez sur "Nouveau projet"
3. Nom du projet : **Red Den Connexion Website**
4. Cliquez sur "Créer"

### Étape 3 : Activer l'API Maps JavaScript
1. Dans le menu de gauche, allez dans **"API et services" > "Bibliothèque"**
2. Recherchez : **"Maps JavaScript API"**
3. Cliquez dessus puis cliquez sur **"ACTIVER"**

### Étape 4 : Créer une clé API
1. Dans le menu de gauche, allez dans **"API et services" > "Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** en haut
3. Sélectionnez **"Clé API"**
4. Votre clé API sera créée et affichée (elle ressemble à : `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. **COPIEZ cette clé** quelque part de sûr

### Étape 5 : Sécuriser votre clé API (IMPORTANT)
1. Sur la fenêtre de la clé créée, cliquez sur **"RESTREINDRE LA CLÉ"**
2. Dans "Restrictions liées au site web" :
   - Sélectionnez **"Références HTTP (sites web)"**
   - Ajoutez : `https://reddenconnexion.github.io/*`
   - Ajoutez aussi : `http://localhost/*` (pour tester en local)
3. Dans "Restrictions relatives aux API" :
   - Sélectionnez **"Restreindre la clé"**
   - Cochez uniquement **"Maps JavaScript API"**
4. Cliquez sur **"ENREGISTRER"**

### Étape 6 : Ajouter la clé dans votre site
1. Ouvrez le fichier `index.html`
2. Cherchez la ligne (tout en bas du fichier) :
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
   ```
3. Remplacez `YOUR_API_KEY` par votre clé API :
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&callback=initMap"></script>
   ```
4. Sauvegardez le fichier
5. Poussez les modifications sur GitHub

### Étape 7 : Activer la facturation (GRATUIT jusqu'à 28 000 chargements/mois)
Google demande une carte bancaire mais vous ne serez PAS facturé si vous restez sous la limite gratuite :
- **200$ de crédit gratuit par mois**
- **28 000 chargements de carte par mois = GRATUIT**
- Pour un site comme le vôtre, vous ne dépasserez jamais cette limite

1. Dans Google Cloud Console, allez dans **"Facturation"**
2. Cliquez sur **"Associer un compte de facturation"**
3. Créez un compte de facturation (carte bancaire demandée)
4. Vous recevrez 300$ de crédit gratuit pour essayer Google Cloud

**Note** : Vous pouvez définir des alertes pour être prévenu si vous approchez de la limite gratuite.

## Dépannage

### La carte ne s'affiche pas
- Vérifiez que vous avez bien remplacé `YOUR_API_KEY`
- Vérifiez que l'API Maps JavaScript est activée
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Attendez 1-2 minutes après avoir activé l'API (propagation)

### Message d'erreur "This page can't load Google Maps correctly"
- Vous devez activer la facturation sur Google Cloud (même si c'est gratuit)
- Vérifiez que la clé API n'est pas restreinte pour votre domaine

### La carte est grise
- L'API n'est pas activée ou la clé est invalide
- Vérifiez dans la console Google Cloud que "Maps JavaScript API" est activée

## Contact
Si vous avez besoin d'aide, n'hésitez pas à me contacter !

## Coût
✅ **100% GRATUIT** pour votre utilisation (site vitrine)
- Limite gratuite : 28 000 chargements/mois
- Votre site aura maximum quelques centaines de visiteurs/mois
- Vous êtes largement en dessous de la limite gratuite
