// Add website_media table for gallery and hero management
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pools-arena.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Creating website_media table...');
  
  db.run(`
    CREATE TABLE IF NOT EXISTS website_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('hero_video', 'hero_poster', 'gallery', 'venue')),
      filename TEXT NOT NULL,
      original_filename TEXT,
      file_path TEXT NOT NULL,
      alt_text TEXT,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      file_size INTEGER,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('✓ website_media table created');
      
      // Insert initial gallery photos from owner
      const initialMedia = [
        {
          type: 'hero_poster',
          filename: 'poster.jpg',
          file_path: '/media/hero/poster.jpg',
          alt_text: "Pool's Arena Club & Bar interior with pool tables and lounge seating",
          display_order: 0
        },
        {
          type: 'gallery',
          filename: 'bar.jpg',
          file_path: '/media/gallery/bar.jpg',
          alt_text: "Pool's Arena bar area with drinks and seating",
          display_order: 1
        },
        {
          type: 'gallery',
          filename: 'pool-table.jpg',
          file_path: '/media/gallery/pool-table.jpg',
          alt_text: 'Professional pool table at Pool\'s Arena',
          display_order: 2
        },
        {
          type: 'gallery',
          filename: 'pool-lounge.jpg',
          file_path: '/media/gallery/pool-lounge.jpg',
          alt_text: "Pool's Arena lounge and gaming area",
          display_order: 3
        }
      ];
      
      const stmt = db.prepare(`
        INSERT INTO website_media (type, filename, file_path, alt_text, display_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      initialMedia.forEach(media => {
        stmt.run(media.type, media.filename, media.file_path, media.alt_text, media.display_order);
      });
      
      stmt.finalize(() => {
        console.log('✓ Initial media records inserted');
        console.log('\nMedia management table ready!');
        db.close();
      });
    }
  });
});
