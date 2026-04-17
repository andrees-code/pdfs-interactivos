import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [
  { size: 32, name: 'favicon-32x32.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 128, name: 'favicon.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

const svgFile = path.join('public', 'favicon-source.svg');
const publicDir = 'public';

async function generateFavicons() {
  try {
    console.log('Generating favicons from SVG...');

    for (const { size, name } of sizes) {
      await sharp(svgFile)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✓ Created ${name} (${size}x${size})`);
    }

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
