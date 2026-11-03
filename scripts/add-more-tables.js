// Add more tables to pools-arena database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pools-arena.db');

console.log('Adding more tables to Pool\'s Arena...\n');

const newTables = [
  // More Pool Tables
  { name: 'Pool Table 2', type: 'pool_table', capacity: 6 },
  { name: 'Pool Table 3', type: 'pool_table', capacity: 6 },
  { name: 'Snooker Table', type: 'pool_table', capacity: 4 },
  
  // Dining Tables
  { name: 'Dining Table 1', type: 'dining_table', capacity: 4 },
  { name: 'Dining Table 2', type: 'dining_table', capacity: 4 },
  { name: 'Dining Table 3', type: 'dining_table', capacity: 6 },
  { name: 'Bar Counter Seating', type: 'dining_table', capacity: 8 },
  
  // Event Spaces
  { name: 'VIP Lounge', type: 'event_space', capacity: 20 },
  { name: 'Private Room', type: 'event_space', capacity: 15 },
];

const stmt = db.prepare(`
  INSERT INTO resources (name, type, capacity, is_active) 
  VALUES (?, ?, ?, 1)
`);

let count = 0;
let success = 0;

newTables.forEach(table => {
  stmt.run(table.name, table.type, table.capacity, (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        console.log(`⚠ Skipped: ${table.name} (already exists)`);
      } else {
        console.error(`✗ Error adding ${table.name}:`, err.message);
      }
    } else {
      console.log(`✓ Added: ${table.name} (${table.type}, capacity: ${table.capacity})`);
      success++;
    }
    count++;
    
    if (count === newTables.length) {
      finish(success);
    }
  });
});

stmt.finalize();

function finish(successCount) {
  console.log(`\n✅ Added ${successCount} new table(s)!`);
  console.log('\nYou can now:');
  console.log('  • Make reservations at http://localhost:3000/#reservations');
  console.log('  • Manage tables at http://localhost:3000/staff/login\n');
  db.close();
}
