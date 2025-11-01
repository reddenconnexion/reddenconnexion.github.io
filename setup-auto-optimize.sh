#!/bin/bash

##############################################
# Installation du Git Hook d'optimisation
# Red Den Connexion - Configuration automatique
##############################################

echo "🔧 Installation du Git Hook d'optimisation automatique"
echo "======================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier qu'on est dans un repo git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erreur: Pas dans un dépôt Git${NC}"
    echo "Exécutez ce script depuis la racine de votre projet Git"
    exit 1
fi

# Vérifier si ImageMagick est installé
echo -e "${BLUE}🔍 Vérification des dépendances...${NC}"
echo ""

MISSING_DEPS=0

if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick n'est pas installé${NC}"
    MISSING_DEPS=1
else
    echo -e "${GREEN}✅ ImageMagick installé${NC}"
fi

if ! command -v optipng &> /dev/null; then
    echo -e "${YELLOW}⚠️  optipng n'est pas installé (optionnel mais recommandé)${NC}"
else
    echo -e "${GREEN}✅ optipng installé${NC}"
fi

echo ""

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "${YELLOW}📦 Installation des dépendances nécessaires:${NC}"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install imagemagick optipng"
    echo ""
    echo "macOS:"
    echo "  brew install imagemagick optipng"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    echo ""
fi

# Créer le dossier hooks s'il n'existe pas
if [ ! -d ".git/hooks" ]; then
    mkdir -p .git/hooks
    echo -e "${BLUE}📁 Création du dossier .git/hooks${NC}"
fi

# Copier le hook pre-commit
HOOK_SOURCE="git-hooks/pre-commit-optimize-images"
HOOK_DEST=".git/hooks/pre-commit"

# Vérifier que le fichier source existe
if [ ! -f "$HOOK_SOURCE" ]; then
    echo -e "${RED}❌ Erreur: Fichier source du hook introuvable${NC}"
    echo "   Attendu: $HOOK_SOURCE"
    exit 1
fi

# Copier depuis le fichier source
cp "$HOOK_SOURCE" "$HOOK_DEST"
echo -e "${GREEN}✅ Hook pre-commit copié depuis $HOOK_SOURCE${NC}"

# Rendre le hook exécutable
chmod +x "$HOOK_DEST"
echo -e "${GREEN}✅ Hook pre-commit rendu exécutable${NC}"
echo ""

# Vérifier l'installation
if [ -x "$HOOK_DEST" ]; then
    echo -e "${GREEN}✨ Installation réussie !${NC}"
    echo ""
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}🎉 Git Hook activé avec succès !${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""
    echo "📋 Fonctionnement:"
    echo "   → Chaque fois que vous faites 'git commit'"
    echo "   → Le hook détecte automatiquement les images JPG/PNG"
    echo "   → Les compresse avant de les committer"
    echo "   → Affiche le gain de poids"
    echo ""
    echo "💡 Exemples:"
    echo "   git add nouvelle-image.jpg"
    echo "   git commit -m 'Ajout image'"
    echo "   → L'image sera automatiquement optimisée ✨"
    echo ""
    echo "⚠️  Pour bypasser l'optimisation (déconseillé):"
    echo "   git commit --no-verify -m 'Message'"
    echo ""
    echo "🔍 Tester le hook maintenant:"
    echo "   1. Ajoutez une image: cp une-image.jpg test.jpg"
    echo "   2. Stagez-la: git add test.jpg"
    echo "   3. Committez: git commit -m 'Test'"
    echo "   → Le hook devrait optimiser test.jpg automatiquement"
    echo ""
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
fi
