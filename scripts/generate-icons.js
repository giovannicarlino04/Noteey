const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

const sizes = [16, 32, 48, 64, 128, 256, 512];
const inputFile = path.join(__dirname, '../assets/icon.svg');
const outputDir = path.join(__dirname, '../assets/icons');

// Assicurati che la directory di output esista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Genera PNG in varie dimensioni
async function generatePNGs() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
  }
}

// Genera ICO per Windows
async function generateICO() {
  const pngFiles = sizes.map(size => path.join(outputDir, `icon-${size}.png`));
  const icoBuffer = await pngToIco(pngFiles);
  fs.writeFileSync(path.join(outputDir, 'icon.ico'), icoBuffer);
}

// Genera ICNS per macOS
async function generateICNS() {
  // Per macOS, usiamo il PNG più grande
  fs.copyFileSync(
    path.join(outputDir, 'icon-512.png'),
    path.join(outputDir, 'icon.icns')
  );
}

async function generateIcons() {
  try {
    console.log('Generando icone...');
    await generatePNGs();
    await generateICO();
    await generateICNS();
    console.log('Icone generate con successo!');
  } catch (error) {
    console.error('Errore durante la generazione delle icone:', error);
  }
}

generateIcons(); 