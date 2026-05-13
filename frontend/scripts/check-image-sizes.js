const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');

async function check(rel) {
  const full = path.join(ASSETS, rel);
  if (!fs.existsSync(full)) return;
  const meta = await sharp(full).metadata();
  const kb = Math.round(fs.statSync(full).size / 1024);
  console.log(`${kb}KB  ${meta.width}x${meta.height}  ${rel}`);
}

(async () => {
  const files = [
    'images/fruit.png',
    'shop/preview/preview-headphones-pink.png',
    'shop/preview/preview-cap-blue.png',
    'shop/preview/preview-scarf-rainbow.png',
    'shop/coin.png',
    'shop/preview/preview-hat-pink.png',
    'garden/garden-background.png',
    'shop/preview/preview-hat-purple.png',
    'shop/preview/preview-glasses-aviator-gold.png',
    'shop/preview/preview-glasses-round.png',
    'shop/preview/preview-bow-pink.png',
    'garden/tree-stage-3.png',
    'background.png',
    'garden/tree-stage-1.png',
    'garden/tree-stage-2.png',
    'shop/items/hat-beige.png',
    'shop/items/headphones-pink.png',
    'shop/items/scarf-rainbow.png',
    'shop/items/bow-pink.png',
    'shop/preview/preview-hat-beige.png',
    'garden/tree-stage-0.png',
    'images/cloud.png',
  ];
  for (const f of files) await check(f);
})();
