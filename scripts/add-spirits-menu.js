// Add premium spirits/liquors to the menu
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pools-arena.db');
const db = new sqlite3.Database(dbPath);

// Premium spirits with estimated prices (adjust as needed)
const spirits = [
  { name: 'Black Label', price: 25000, description: 'Johnnie Walker Black Label - Premium Scotch Whisky' },
  { name: 'Monkey Shoulder', price: 22000, description: 'Smooth Blended Malt Scotch Whisky' },
  { name: 'Hennessy', price: 35000, description: 'Hennessy VS Cognac' },
  { name: "Jack Daniel's", price: 20000, description: 'Tennessee Whiskey' },
  { name: 'Don Julio Small', price: 30000, description: 'Premium Tequila - Small Bottle' },
  { name: 'Double Black', price: 28000, description: 'Johnnie Walker Double Black' },
  { name: 'Chivas 12 Years', price: 32000, description: 'Chivas Regal 12 Year Old Scotch' },
  { name: 'Chivas 18 Years', price: 55000, description: 'Chivas Regal 18 Year Old Scotch' },
  { name: 'Azur', price: 15000, description: 'Premium Vodka' },
  { name: 'Don Julio Long', price: 45000, description: 'Premium Tequila - Large Bottle' },
  { name: 'Belaire', price: 40000, description: 'Belaire Rosé Sparkling Wine' },
  { name: 'Agor Wine', price: 12000, description: 'Quality Red Wine' },
  { name: 'Blu Nun Champagne', price: 35000, description: 'German Sparkling Wine' },
  { name: 'Martell VS', price: 33000, description: 'Martell VS Cognac' },
  { name: 'Martell Blue Swift', price: 38000, description: 'Martell Blue Swift VSOP Cognac' }
];

db.serialize(() => {
  console.log('Adding premium spirits to menu...\n');
  
  // First, check if "Premium Spirits" category exists, if not create it
  db.get('SELECT id FROM menu_categories WHERE name = ?', ['Premium Spirits'], (err, category) => {
    if (err) {
      console.error('Error checking category:', err);
      db.close();
      return;
    }
    
    if (category) {
      // Category exists, use it
      insertSpirits(category.id);
    } else {
      // Create the category
      db.run(
        'INSERT INTO menu_categories (name, display_order) VALUES (?, ?)',
        ['Premium Spirits', 1],
        function(err) {
          if (err) {
            console.error('Error creating category:', err);
            db.close();
            return;
          }
          console.log('✓ Created "Premium Spirits" category\n');
          insertSpirits(this.lastID);
        }
      );
    }
  });
});

function insertSpirits(categoryId) {
  const stmt = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id, is_available, is_hidden)
    VALUES (?, ?, ?, ?, 1, 0)
  `);
  
  let count = 0;
  
  spirits.forEach((spirit, index) => {
    stmt.run(spirit.name, spirit.description, spirit.price, categoryId, function(err) {
      if (err) {
        console.error(`Error adding ${spirit.name}:`, err);
      } else {
        count++;
        console.log(`✓ Added: ${spirit.name} - ${spirit.price.toLocaleString()} FCFA`);
      }
      
      // Close when done with all items
      if (index === spirits.length - 1) {
        stmt.finalize(() => {
          console.log(`\n✅ Successfully added ${count} premium spirits!`);
          console.log('\nNote: Prices are estimated. Please update them in the dashboard:');
          console.log('Staff Dashboard → Menu → Edit each item to set correct prices\n');
          db.close();
        });
      }
    });
  });
}
