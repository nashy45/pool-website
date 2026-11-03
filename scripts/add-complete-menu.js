// Add complete menu with correct prices from Pool's Arena
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pools-arena.db');
const db = new sqlite3.Database(dbPath);

// Complete menu organized by categories
const menuData = {
  'Whiskey': [
    { name: 'Baileys', price: 25000 },
    { name: 'Ballantines', price: 25000 },
    { name: 'Belvedere Vodka', price: 50000 },
    { name: 'Black label JW', price: 35000 },
    { name: 'Chivas 12 year', price: 35000 },
    { name: 'Black label 1L JW', price: 50000 },
    { name: 'Chivas 12 year 1L', price: 50000 },
    { name: 'Hennessy', price: 50000 },
    { name: 'Glenmorangie 10 year', price: 40000 },
    { name: 'Glenmorangie 12 year', price: 55000 },
    { name: 'Glenmorangie 14 years', price: 60000 },
    { name: 'Glenmorangie 18 years', price: 110000 },
    { name: 'Gold label JW', price: 60000 },
    { name: 'Double black 1L', price: 60000 },
    { name: 'Chivas 18 years 70cl', price: 80000 },
    { name: 'Jonny walker 18 years', price: 80000 },
    { name: 'Hennessy V.S.O.P', price: 80000 },
    { name: 'Hennessy X.O 70CL', price: 250000 },
    { name: 'Blue label', price: 250000 },
    { name: 'Chivas 25 years', price: 250000 },
    { name: 'Blue label 1L', price: 450000 },
    { name: 'Hennessy X.X.O', price: 1000000 }
  ],
  'Tequila': [
    { name: 'Azur', price: 400000 },
    { name: 'Volcan XA', price: 500000 },
    { name: 'Don Julio Reposado', price: 200000 },
    { name: 'Don Julio', price: 400000 }
  ],
  'Champagne': [
    { name: 'Veuve de Vernay', price: 25000 },
    { name: 'Blu Nun', price: 25000 },
    { name: 'Pizzolato', price: 35000 },
    { name: 'Troullard', price: 60000 },
    { name: 'Moet', price: 60000 },
    { name: 'Veuve cliquot', price: 60000 },
    { name: 'Bellaire rose light', price: 75000 },
    { name: 'Moet Rose', price: 70000 },
    { name: 'Ruinard brut', price: 80000 },
    { name: 'Ruinard blanc', price: 85000 },
    { name: 'Don Perignon', price: 300000 },
    { name: 'Crystal', price: 300000 },
    { name: 'Armand de brignac', price: 450000 },
    { name: 'Ace of Spade', price: 40000 },
    { name: 'Brugal', price: 50000 },
    { name: 'Moet Rose', price: 50000 },
    { name: 'Moet Brut', price: 90000 },
    { name: 'Ruinart', price: 60000 },
    { name: 'Moet Brut 1.5L', price: 70000 },
    { name: 'Moet Magnum', price: 90000 },
    { name: 'Moet Rose Magnum', price: 70000 },
    { name: 'Veuve Clicquot Brut', price: 70000 },
    { name: 'Don Perignon', price: 80000 },
    { name: 'Piper Heidsieck', price: 80000 },
    { name: 'Armand de Brignac', price: 100000 },
    { name: 'Veuve Rose', price: 100000 },
    { name: 'Ruinart Blanc', price: 120000 },
    { name: 'Cristal', price: 350000 },
    { name: 'Armand de Brignac Gold', price: 800000 },
    { name: 'Armand de Brignac Rose', price: 300000 }
  ],
  'Cocktail': [
    { name: 'My way', price: 6500 },
    { name: 'Sex on the beach', price: 6500 },
    { name: 'Dolcevita', price: 6500 },
    { name: 'Mojito exotique', price: 6500 },
    { name: 'Pina canada', price: 6500 }
  ],
  'Non Alcoholic': [
    { name: 'Mojito', price: 5000 },
    { name: 'Bella Luna', price: 5000 },
    { name: 'Fruit punch', price: 5000 },
    { name: 'Zanzilmood', price: 5000 },
    { name: 'Mikadonia', price: 5000 },
    { name: 'Special mix', price: 4500 }
  ],
  'Premium Spirits': [
    { name: 'Absolut Vodka', price: 30000 },
    { name: 'Martell', price: 90000 },
    { name: 'Monkey Shoulder', price: 30000 },
    { name: 'Campari', price: 30000 },
    { name: 'Chivas Regal', price: 40000 },
    { name: 'Black Label', price: 40000 },
    { name: 'Jack Daniels', price: 40000 },
    { name: 'Hennessy VS', price: 50000 },
    { name: 'Gordon Gin', price: 60000 },
    { name: 'Ciroc', price: 80000 },
    { name: 'Patron', price: 60000 },
    { name: 'Grey Goose', price: 60000 },
    { name: 'Martell Blue Swift', price: 70000 },
    { name: 'Monkey 47', price: 70000 },
    { name: 'Tia Maria', price: 80000 },
    { name: 'Remy Martin VSOP', price: 60000 },
    { name: 'Hennessy VSOP', price: 90000 },
    { name: 'Chivas 18 year', price: 90000 },
    { name: 'Remy Martin XO', price: 120000 },
    { name: 'Don Julio 1942', price: 90000 },
    { name: 'Belaire Rose', price: 250000 },
    { name: 'Don Julio Long Bottle', price: 100000 },
    { name: 'Ciroc Magnum', price: 120000 },
    { name: 'Veuve Rose', price: 150000 },
    { name: 'Cristal', price: 350000 },
    { name: 'Armand de Brignac', price: 500000 },
    { name: 'Blue Label', price: 250000 }
  ],
  'Shisha/Hookah': [
    { name: 'Shisha - Mango Tango', price: 5000 },
    { name: 'Shisha - Ice Lemon', price: 5000 },
    { name: 'Shisha - Love 66', price: 5000 }
  ]
};

db.serialize(() => {
  console.log('🍷 Adding complete Pool\'s Arena menu with correct prices...\n');
  
  let categoriesProcessed = 0;
  const categoryNames = Object.keys(menuData);
  
  // Process each category
  categoryNames.forEach((categoryName, catIndex) => {
    // Check if category exists
    db.get('SELECT id FROM menu_categories WHERE name = ?', [categoryName], (err, category) => {
      if (err) {
        console.error(`Error checking category ${categoryName}:`, err);
        return;
      }
      
      const processItems = (categoryId) => {
        const items = menuData[categoryName];
        let itemsAdded = 0;
        
        console.log(`\n📁 ${categoryName.toUpperCase()}`);
        console.log('─'.repeat(50));
        
        // First, delete any existing items in this category to avoid duplicates
        db.run('DELETE FROM menu_items WHERE category_id = ?', [categoryId], (err) => {
          if (err) console.error(`Error clearing ${categoryName}:`, err);
          
          const stmt = db.prepare(`
            INSERT INTO menu_items (name, description, price, category_id, is_available, is_hidden)
            VALUES (?, ?, ?, ?, 1, 0)
          `);
          
          items.forEach((item, itemIndex) => {
            const description = `Premium ${categoryName}`;
            stmt.run(item.name, description, item.price, categoryId, function(err) {
              if (err) {
                console.error(`  ❌ ${item.name}:`, err.message);
              } else {
                itemsAdded++;
                console.log(`  ✓ ${item.name.padEnd(30)} ${item.price.toLocaleString().padStart(10)} FCFA`);
              }
              
              // If last item in category
              if (itemIndex === items.length - 1) {
                stmt.finalize(() => {
                  console.log(`  → Added ${itemsAdded}/${items.length} items`);
                  
                  categoriesProcessed++;
                  if (categoriesProcessed === categoryNames.length) {
                    finishImport();
                  }
                });
              }
            });
          });
        });
      };
      
      if (category) {
        // Category exists, use it
        processItems(category.id);
      } else {
        // Create new category
        db.run(
          'INSERT INTO menu_categories (name, display_order) VALUES (?, ?)',
          [categoryName, catIndex],
          function(err) {
            if (err) {
              console.error(`Error creating category ${categoryName}:`, err);
              categoriesProcessed++;
              if (categoriesProcessed === categoryNames.length) finishImport();
              return;
            }
            processItems(this.lastID);
          }
        );
      }
    });
  });
});

function finishImport() {
  console.log('\n' + '═'.repeat(50));
  console.log('✅ MENU IMPORT COMPLETE!');
  console.log('═'.repeat(50));
  console.log('\n📊 Summary:');
  
  db.get('SELECT COUNT(*) as total FROM menu_items', [], (err, row) => {
    if (!err) {
      console.log(`   Total items in menu: ${row.total}`);
    }
    
    db.all('SELECT mc.name, COUNT(mi.id) as count FROM menu_categories mc LEFT JOIN menu_items mi ON mc.id = mi.category_id GROUP BY mc.id ORDER BY mc.display_order', [], (err, rows) => {
      if (!err) {
        rows.forEach(r => {
          console.log(`   ${r.name}: ${r.count} items`);
        });
      }
      
      console.log('\n🎉 Your menu is ready!');
      console.log('   View it at: http://localhost:3000');
      console.log('   Manage it at: Staff Dashboard → Menu\n');
      
      db.close();
    });
  });
}
