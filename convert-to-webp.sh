#!/bin/bash

##############################################
# Script de conversion en WebP
# Red Den Connexion - Performance Web
# Format WebP = 25-35% plus léger que JPG/PNG
##############################################

echo "🚀 Script de conversion WebP"
echo "====================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si cwebp est installé
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}❌ cwebp n'est pas installé${NC}"
    echo ""
    echo "Installation sur Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install webp"
    echo ""
    echo "Installation sur macOS:"
    echo "  brew install webp"
    echo ""
    exit 1
fi

# Créer un dossier pour les images WebP
WEBP_DIR="images-webp"

if [ ! -d "$WEBP_DIR" ]; then
    mkdir -p "$WEBP_DIR"
    echo -e "${BLUE}📁 Dossier WebP créé: $WEBP_DIR${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Conversion des images en WebP...${NC}"
echo ""

# Fonction pour convertir en WebP
convert_to_webp() {
    local file="$1"
    local filename=$(basename "$file")
    local name="${filename%.*}"
    local output="$WEBP_DIR/${name}.webp"

    # Obtenir la taille originale
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    local original_size_mb=$(echo "scale=2; $original_size / 1024 / 1024" | bc)

    # Convertir en WebP avec qualité 85
    cwebp -q 85 "$file" -o "$output" 2>/dev/null

    # Obtenir la nouvelle taille
    local new_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null)
    local new_size_mb=$(echo "scale=2; $new_size / 1024 / 1024" | bc)
    local reduction=$(echo "scale=1; (($original_size - $new_size) * 100) / $original_size" | bc)

    echo -e "${GREEN}✅ $filename → ${name}.webp${NC}"
    echo "   Original: ${original_size_mb}MB → WebP: ${new_size_mb}MB (${reduction}% de réduction)"
    echo ""
}

# Traiter tous les fichiers JPG et PNG
for file in *.jpg *.jpeg *.png; do
    if [ -f "$file" ] && [ "$file" != "*.jpg" ] && [ "$file" != "*.jpeg" ] && [ "$file" != "*.png" ]; then
        # Skip les logos (trop petits, pas besoin de WebP)
        if [[ "$file" != "logoredden.png" ]] && [[ "$file" != "logo.png" ]]; then
            convert_to_webp "$file"
        fi
    fi
done

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✨ Conversion WebP terminée !${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "📁 Images WebP disponibles dans: $WEBP_DIR"
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo "1. Copiez les images WebP dans votre dossier principal:"
echo "   cp $WEBP_DIR/* ."
echo ""
echo "2. Modifiez votre HTML pour utiliser <picture> avec fallback:"
echo '   <picture>'
echo '     <source srcset="image.webp" type="image/webp">'
echo '     <img src="image.jpg" alt="Description" loading="lazy">'
echo '   </picture>'
echo ""
echo "💡 Les navigateurs modernes chargeront WebP (plus léger)"
echo "   Les anciens navigateurs utiliseront JPG/PNG (fallback)"
echo ""
