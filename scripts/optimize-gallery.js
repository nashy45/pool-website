// Optimize gallery images for web delivery
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const galleryDir = path.join(__dirname, '..', 'public', 'media', 'gallery');

const images = ['bar.jpg', 'pool-table.jpg', 'pool-lounge.jpg'];

async function optimizeGallery() {
  console.log('Optimizing gallery images...\n');
  
  for (const image of images) {
    const inputPath = path.join(galleryDir, image);
    const baseName = path.parse(image).name;
    
    try {
      const metadata = await sharp(inputPath).metadata();
      console.log(`${image}: ${metadata.width}x${metadata.height}`);
      
      // Large version (1200px wide) for lightbox
      await sharp(inputPath)
        .resize(1200, 900, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(path.join(galleryDir, `${baseName}-large.webp`));
      
      await sharp(inputPath)
        .resize(1200, 900, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(galleryDir, `${baseName}-large.jpg`));
      
      // Thumbnail (400px wide) for grid
      await sharp(inputPath)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 82 })
        .toFile(path.join(galleryDir, `${baseName}-thumb.webp`));
      
      await sharp(inputPath)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 82, progressive: true })
        .toFile(path.join(galleryDir, `${baseName}-thumb.jpg`));
      
      console.log(`✓ ${baseName}: 4 versions created\n`);
      
    } catch (error) {
      console.error(`Error processing ${image}:`, error);
    }
  }
  
  console.log('Gallery optimization complete!');
}

optimizeGallery();
