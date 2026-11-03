const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pools-arena.db');

const testId = 18;

console.log('Testing menu item availability query...\n');

// Test with AND is_available = 1
db.get('SELECT * FROM menu_items WHERE id = ? AND is_available = 1', [testId], (err, row) => {
  console.log('Query: SELECT * FROM menu_items WHERE id = ? AND is_available = 1');
  if (err) {
    console.error('Error:', err);
  } else if (row) {
    console.log('✅ FOUND:', row.name);
    console.log('   is_available:', row.is_available, '(Type:', typeof row.is_available, ')');
  } else {
    console.log('❌ NOT FOUND - This is the problem!');
  }
  
  // Test without availability check
  db.get('SELECT * FROM menu_items WHERE id = ?', [testId], (err2, row2) => {
    console.log('\nQuery: SELECT * FROM menu_items WHERE id = ?');
    if (err2) {
      console.error('Error:', err2);
    } else if (row2) {
      console.log('✅ FOUND:', row2.name);
      console.log('   is_available:', row2.is_available, '(Type:', typeof row2.is_available, ')');
      console.log('   is_hidden:', row2.is_hidden);
    }
    
    db.close();
  });
});
