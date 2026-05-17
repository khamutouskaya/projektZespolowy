const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');

// maxWidth: max long edge to resize to; null = no resize (just compress)
const targets = [
  // Coin shown at 18x18 logical px → @3x = 54px. Give 2x headroom.
  { file: 'shop/coin.png',                             maxWidth: 120 },

  // Shop previews shown at 220x170 in modal → @3x = 660x510. Give headroom.
  { file: 'shop/preview/preview-headphones-pink.png',  maxWidth: 700 },
  { file: 'shop/preview/preview-cap-blue.png',         maxWidth: 700 },
  { file: 'shop/preview/preview-scarf-rainbow.png',    maxWidth: 700 },
  { file: 'shop/preview/preview-hat-pink.png',         maxWidth: 700 },
  { file: 'shop/preview/preview-hat-purple.png',       maxWidth: 700 },
  { file: 'shop/preview/preview-glasses-aviator-gold.png', maxWidth: 700 },
  { file: 'shop/preview/preview-glasses-round.png',    maxWidth: 700 },
  { file: 'shop/preview/preview-bow-pink.png',         maxWidth: 700 },
  { file: 'shop/preview/preview-hat-beige.png',        maxWidth: 700 },

  // Shop item thumbnails shown at ~80x80 in list → @3x = 240px
  { file: 'shop/items/hat-beige.png',          maxWidth: 350 },
  { file: 'shop/items/headphones-pink.png',    maxWidth: 350 },
  { file: 'shop/items/scarf-rainbow.png',      maxWidth: 350 },
  { file: 'shop/items/bow-pink.png',           maxWidth: 350 },
  { file: 'shop/items/hat-pink.png',           maxWidth: 350 },
  { file: 'shop/items/hat-purple.png',         maxWidth: 350 },
  { file: 'shop/items/glasses-round.png',      maxWidth: 350 },
  { file: 'shop/items/cap-blue.png',           maxWidth: 350 },
  { file: 'shop/items/glasses-aviator-gold.png', maxWidth: 350 },

  // Fruit shown at ~200x200 on home screen → @3x = 600px
  { file: 'images/fruit.png',    maxWidth: 600 },

  // Garden trees shown at ~150x150 → @3x = 450px
  { file: 'garden/tree-stage-0.png', maxWidth: 500 },
  { file: 'garden/tree-stage-1.png', maxWidth: 500 },
  { file: 'garden/tree-stage-2.png', maxWidth: 500 },
  { file: 'garden/tree-stage-3.png', maxWidth: 500 },

  // Garden background — full screen portrait, keep dims but compress hard
  { file: 'garden/garden-background.png', maxWidth: 900 },

  // App background — full screen, 1024px wide is already OK for most phones
  { file: 'background.png',       maxWidth: 1080 },
  { file: 'images/background.png', maxWidth: 1080 },

  // Cloud — login 250x240, overlay 120x115 → @3x = 750px wide is plenty
  { file: 'images/cloud.png',    maxWidth: 750 },
  { file: 'cloud.png',           maxWidth: 750 },
];

async function compress(rel, maxWidth) {
  const full = path.join(ASSETS, rel);
  if (!fs.existsSync(full)) return;

  const before = fs.statSync(full).size;
  const img = sharp(full);
  const meta = await img.metadata();

  let pipeline = img;
  if (meta.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
  }

  const tmp = full + '.tmp';
  await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
    .toFile(tmp);

  const after = fs.statSync(tmp).size;

  // Only replace if we actually made it smaller
  if (after < before) {
    fs.renameSync(tmp, full);
    const saved = Math.round((1 - after / before) * 100);
    console.log(`✓ ${rel.padEnd(52)} ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB  (-${saved}%)`);
  } else {
    fs.unlinkSync(tmp);
    console.log(`– ${rel.padEnd(52)} ${Math.round(before/1024)}KB  (already optimal)`);
  }
}

(async () => {
  console.log('Compressing assets...\n');
  for (const { file, maxWidth } of targets) {
    await compress(file, maxWidth);
  }
  console.log('\nDone.');
})();
