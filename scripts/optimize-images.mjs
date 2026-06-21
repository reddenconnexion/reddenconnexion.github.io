#!/usr/bin/env node
/**
 * Optimisation automatique des images
 * Red Den Connexion
 *
 * Pour chaque image matricielle (jpg/jpeg/png) du dépôt :
 *  - si elle est plus large que MAX_WIDTH, elle est redimensionnée ;
 *  - si elle dépasse MAX_BYTES (ou vient d'être redimensionnée), elle est
 *    ré-encodée pour réduire son poids ;
 *  - un fichier .webp jumeau est généré s'il n'existe pas déjà (on ne
 *    réécrit jamais un .webp existant, pour préserver les conversions
 *    faites à la main).
 *
 * Les favicons / icônes et les dossiers techniques sont ignorés.
 *
 * Usage :
 *   node scripts/optimize-images.mjs          # optimise et écrit les fichiers
 *   node scripts/optimize-images.mjs --check  # échoue si une image n'est pas optimisée (ne modifie rien)
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 2000;        // largeur max pour une image web
const MAX_BYTES = 800 * 1024;  // au-delà, on ré-encode pour alléger

const EXCLUDED_DIRS = new Set([
    'node_modules', '.git', 'coverage', 'playwright-report',
    'test-results', 'fonts'
]);
// Ne pas toucher aux favicons / icônes / logos de petite taille
const EXCLUDED_NAME = /favicon|icon|apple-touch|logofavicon/i;

const RASTER = new Set(['.jpg', '.jpeg', '.png']);
const checkMode = process.argv.includes('--check');

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) continue;
            out.push(...walk(join(dir, entry.name)));
        } else {
            out.push(join(dir, entry.name));
        }
    }
    return out;
}

function fmt(bytes) {
    return (bytes / 1024).toFixed(0) + ' Ko';
}

const root = process.cwd();
const files = walk(root).filter(f => RASTER.has(extname(f).toLowerCase()));

let changed = [];

for (const file of files) {
    if (EXCLUDED_NAME.test(basename(file))) continue;

    const ext = extname(file).toLowerCase();
    const buf = readFileSync(file);
    const meta = await sharp(buf).metadata();

    const needResize = meta.width > MAX_WIDTH;
    const oversize = buf.length > MAX_BYTES;

    // 1) Ré-encodage / redimensionnement de l'original si nécessaire
    if (needResize || oversize) {
        let pipeline = sharp(buf);
        if (needResize) pipeline = pipeline.resize({ width: MAX_WIDTH });
        if (ext === '.png') {
            pipeline = pipeline.png({ compressionLevel: 9, palette: true });
        } else {
            pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
        }
        const out = await pipeline.toBuffer();
        // On n'écrit que si on gagne réellement du poids (ou si on a redimensionné)
        if (needResize || out.length < buf.length) {
            if (checkMode) {
                changed.push(`${file} (${fmt(buf.length)} -> ~${fmt(out.length)})`);
            } else {
                writeFileSync(file, out);
                changed.push(`${file} : ${fmt(buf.length)} -> ${fmt(out.length)}`);
            }
        }
    }

    // 2) Génération du .webp jumeau s'il manque
    const webpPath = file.replace(/\.(jpe?g|png)$/i, '.webp');
    let webpExists = true;
    try { statSync(webpPath); } catch { webpExists = false; }

    if (!webpExists && (needResize || oversize || buf.length > 150 * 1024)) {
        const source = readFileSync(file); // version éventuellement déjà optimisée
        const webp = await sharp(source).resize({ width: Math.min(meta.width, MAX_WIDTH) }).webp({ quality: 80 }).toBuffer();
        if (checkMode) {
            changed.push(`${webpPath} (manquant, ~${fmt(webp.length)})`);
        } else {
            writeFileSync(webpPath, webp);
            changed.push(`${webpPath} : créé (${fmt(webp.length)})`);
        }
    }
}

if (changed.length === 0) {
    console.log('✅ Toutes les images sont déjà optimisées.');
    process.exit(0);
}

if (checkMode) {
    console.error('❌ Des images ne sont pas optimisées :');
    for (const c of changed) console.error('  - ' + c);
    console.error('\nLancez « npm run optimize:images » puis committez les fichiers générés.');
    process.exit(1);
}

console.log('🛠️  Images optimisées :');
for (const c of changed) console.log('  - ' + c);
