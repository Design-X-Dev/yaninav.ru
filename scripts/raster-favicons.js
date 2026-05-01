/**
 * После изменения path в src/app/icon.svg перегенерируй растры для Safari / iOS / favicon.ico.
 * Запуск: npm run icons:raster
 */
const fs = require('fs').promises;
const sharp = require('sharp');
const toIco = require('to-ico');

async function pngFromSvg(size) {
  return sharp('src/app/icon.svg')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

(async () => {
  await sharp('src/app/icon.svg')
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile('src/app/icon.png');

  await sharp('src/app/icon.svg')
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile('src/app/apple-icon.png');

  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(icoSizes.map((s) => pngFromSvg(s)));
  await fs.writeFile('src/app/favicon.ico', await toIco(icoBuffers));

  process.stdout.write(
    'Wrote src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico\n',
  );
})();
