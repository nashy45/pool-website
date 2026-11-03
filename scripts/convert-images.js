// Convert HEIC files to JPEG and optimize all images
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const files = fs.readdirSync(imagesDir);

console.log('Converting and optimizing images...\n');

// For HEIC files, we'll try to read them
// Note: HEIC conversion requires additional libraries, so we'll skip if not available
const imageFiles = files.filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.heic'].includes(ext);
});

let processed = 0;

imageFiles.forEach(async (file, index) => {
  const filePath = path.join(imagesDir, file);
  const ext = path.extname(file).toLowerCase();
  const baseName = path.basename(file, ext);
  
  // Skip logo
  if (file === 'logo.png') {
    console.log(`⏭️  Skipping logo.png`);
    processed++;
    if (processed === imageFiles.length) finish();
    return;
  }
  
  // For HEIC files, we'll note them but can't convert without additional tools
  if (ext === '.heic') {
    console.log(`⚠️  ${file} - HEIC format detected`);
    console.log(`   Please convert to JPG manually or use iPhone "Transfer to Mac or PC" setting to "Automatic" for JPG export`);
    processed++;
    if (processed === imageFiles.length) finish();
    return;
  }
  
  // For JPG/JPEG/PNG, optimize them
  try {
    const outputPath = path.join(imagesDir, `${baseName}-optimized.jpg`);
    
    await sharp(filePath)
      .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${file}`);
    console.log(`   → ${baseName}-optimized.jpg (saved ${savings}%)`);
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
  
  processed++;
  if (processed === imageFiles.length) {
    finish();
  }
});

function finish() {
  console.log('\n✅ Image processing complete!');
  console.log('\n📝 Note: HEIC files need manual conversion.');
  console.log('   On iPhone: Settings → Camera → Formats → "Most Compatible"');
  console.log('   Or use online converter: https://heic.to');
}
