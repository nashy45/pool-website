// Convert HEIC files to JPG using a different approach
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const files = fs.readdirSync(imagesDir);

console.log('🔄 Converting HEIC files to JPG...\n');

const heicFiles = files.filter(f => f.toLowerCase().endsWith('.heic'));

if (heicFiles.length === 0) {
  console.log('No HEIC files found.');
  process.exit(0);
}

console.log(`Found ${heicFiles.length} HEIC files:`);
heicFiles.forEach((f, i) => console.log(`${i + 1}. ${f}`));

console.log('\n⚠️  HEIC to JPG conversion requires manual steps:');
console.log('\n📱 Option 1: On iPhone');
console.log('   Settings → Camera → Formats → "Most Compatible"');
console.log('   Then re-share the photos (they will be JPG)');

console.log('\n💻 Option 2: Online Converter');
console.log('   1. Go to: https://heictojpg.com or https://heic.to');
console.log('   2. Upload your HEIC files');
console.log('   3. Download as JPG');
console.log('   4. Replace the HEIC files in public/images/');

console.log('\n🖼️  Option 3: Windows Photos App');
console.log('   1. Open each HEIC file in Windows Photos');
console.log('   2. Click "..." → "Save as"');
console.log('   3. Choose JPEG format');
console.log('   4. Save to public/images/');

console.log('\n📝 Files to convert:');
heicFiles.forEach(f => {
  console.log(`   ${f} → ${f.replace('.HEIC', '.jpg').replace('.heic', '.jpg')}`);
});

console.log('\n💡 Tip: Once converted, I can automatically optimize them for web!');
