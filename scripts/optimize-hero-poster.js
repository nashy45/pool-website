// Optimize hero poster image for web delivery
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '..', 'public', 'media', 'hero', 'poster.jpg');
const outputDir = path.join(__dirname, '..', 'public', 'media', 'hero');

async function optimizeHeroPoster() {
  console.log('Optimizing hero poster image...');
  
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`Original: ${metadata.width}x${metadata.height}, ${metadata.format}, ${(metadata.size / 1024).toFixed(1)}KB`);
    
    // Desktop version (1920px wide, WebP + JPG)
    await sharp(inputPath)
      .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, 'poster-desktop.webp'));
    console.log('✓ Desktop WebP created');
    
    await sharp(inputPath)
      .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(outputDir, 'poster-desktop.jpg'));
    console.log('✓ Desktop JPG created');
    
    // Tablet version (1024px wide)
    await sharp(inputPath)
      .resize(1024, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 82 })
      .toFile(path.join(outputDir, 'poster-tablet.webp'));
    console.log('✓ Tablet WebP created');
    
    await sharp(inputPath)
      .resize(1024, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 82, progressive: true })
      .toFile(path.join(outputDir, 'poster-tablet.jpg'));
    console.log('✓ Tablet JPG created');
    
    // Mobile version (768px wide)
    await sharp(inputPath)
      .resize(768, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, 'poster-mobile.webp'));
    console.log('✓ Mobile WebP created');
    
    await sharp(inputPath)
      .resize(768, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 80, progressive: true })
      .toFile(path.join(outputDir, 'poster-mobile.jpg'));
    console.log('✓ Mobile JPG created');
    
    console.log('\nHero poster optimization complete!');
    console.log('Generated 6 optimized versions with WebP + JPG fallbacks');
    
  } catch (error) {
    console.error('Error optimizing poster:', error);
  }
}

optimizeHeroPoster();
