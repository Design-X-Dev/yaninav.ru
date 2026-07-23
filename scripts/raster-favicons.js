/**
 * После изменения path в src/app/icon.svg перегенерируй растры для Safari / iOS / favicon.ico.
 * Запуск: npm run icons:raster
 *
 * ICO собирается без to-ico (уязвимое дерево request/jimp): PNG-вложения в стандартном ICONDIR.
 */
const fs = require('fs').promises;
const sharp = require('sharp');

async function pngFromSvg(size) {
  return sharp('src/app/icon.svg')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/** Minimal ICO container with embedded PNG images (Vista+). */
function pngBuffersToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = dataOffset;
  for (const png of pngBuffers) {
    // PNG IHDR: width/height at bytes 16–23 (big-endian)
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
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
  await fs.writeFile('src/app/favicon.ico', pngBuffersToIco(icoBuffers));

  process.stdout.write(
    'Wrote src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico\n',
  );
})();
