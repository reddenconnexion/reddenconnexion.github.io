#!/bin/bash

##############################################
# Script d'optimisation automatique d'images
# Red Den Connexion - Performance Web
##############################################

echo "🖼️  Script d'optimisation d'images"
echo "====================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick n'est pas installé${NC}"
    echo ""
    echo "Installation sur Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install imagemagick"
    echo ""
    echo "Installation sur macOS:"
    echo "  brew install imagemagick"
    echo ""
    exit 1
fi

# Vérifier si optipng est installé (optionnel mais recommandé)
if ! command -v optipng &> /dev/null; then
    echo -e "${YELLOW}⚠️  optipng n'est pas installé (optionnel mais recommandé)${NC}"
    echo "Pour l'installer:"
    echo "  Ubuntu/Debian: sudo apt install optipng"
    echo "  macOS: brew install optipng"
    echo ""
fi

# Créer un dossier pour les images optimisées
BACKUP_DIR="images-originales-backup"
OPTIMIZED_DIR="images-optimisees"

if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo -e "${BLUE}📁 Dossier de sauvegarde créé: $BACKUP_DIR${NC}"
fi

if [ ! -d "$OPTIMIZED_DIR" ]; then
    mkdir -p "$OPTIMIZED_DIR"
    echo -e "${BLUE}📁 Dossier d'images optimisées créé: $OPTIMIZED_DIR${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Recherche des images à optimiser...${NC}"
echo ""

# Fonction pour optimiser les JPG
optimize_jpg() {
    local file="$1"
    local filename=$(basename "$file")
    local backup="$BACKUP_DIR/$filename"
    local output="$OPTIMIZED_DIR/$filename"

    # Sauvegarder l'original
    if [ ! -f "$backup" ]; then
        cp "$file" "$backup"
    fi

    # Obtenir la taille originale
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    local original_size_mb=$(echo "scale=2; $original_size / 1024 / 1024" | bc)

    # Optimiser avec ImageMagick
    # -quality 85 : qualité JPEG (85% est un bon compromis)
    # -sampling-factor 4:2:0 : sous-échantillonnage chroma (standard web)
    # -strip : supprimer les métadonnées EXIF
    # -interlace Plane : JPEG progressif
    convert "$file" \
        -strip \
        -interlace Plane \
        -quality 85 \
        -sampling-factor 4:2:0 \
        "$output"

    # Obtenir la nouvelle taille
    local new_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null)
    local new_size_mb=$(echo "scale=2; $new_size / 1024 / 1024" | bc)
    local reduction=$(echo "scale=1; (($original_size - $new_size) * 100) / $original_size" | bc)

    echo -e "${GREEN}✅ $filename${NC}"
    echo "   Original: ${original_size_mb}MB → Optimisé: ${new_size_mb}MB (${reduction}% de réduction)"
    echo ""
}

# Fonction pour optimiser les PNG
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")
    local backup="$BACKUP_DIR/$filename"
    local output="$OPTIMIZED_DIR/$filename"

    # Sauvegarder l'original
    if [ ! -f "$backup" ]; then
        cp "$file" "$backup"
    fi

    # Obtenir la taille originale
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    local original_size_mb=$(echo "scale=2; $original_size / 1024 / 1024" | bc)

    # Optimiser avec ImageMagick
    convert "$file" \
        -strip \
        -define png:compression-level=9 \
        "$output"

    # Si optipng est disponible, optimiser encore plus
    if command -v optipng &> /dev/null; then
        optipng -quiet -o7 "$output" 2>/dev/null
    fi

    # Obtenir la nouvelle taille
    local new_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null)
    local new_size_mb=$(echo "scale=2; $new_size / 1024 / 1024" | bc)
    local reduction=$(echo "scale=1; (($original_size - $new_size) * 100) / $original_size" | bc)

    echo -e "${GREEN}✅ $filename${NC}"
    echo "   Original: ${original_size_mb}MB → Optimisé: ${new_size_mb}MB (${reduction}% de réduction)"
    echo ""
}

# Traiter tous les fichiers JPG
for file in *.jpg *.jpeg; do
    if [ -f "$file" ]; then
        optimize_jpg "$file"
    fi
done

# Traiter tous les fichiers PNG
for file in *.png; do
    if [ -f "$file" ]; then
        optimize_png "$file"
    fi
done

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✨ Optimisation terminée !${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "📁 Images optimisées disponibles dans: $OPTIMIZED_DIR"
echo "📁 Originaux sauvegardés dans: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Vérifiez la qualité des images optimisées"
echo "2. Si satisfait, remplacez les originaux:"
echo "   cp $OPTIMIZED_DIR/* ."
echo "3. Committez les nouvelles images optimisées"
echo ""
echo "💡 Conseil: Utilisez aussi le format WebP pour encore plus d'optimisation"
echo "   (convertissez avec: cwebp -q 85 image.jpg -o image.webp)"
echo ""
