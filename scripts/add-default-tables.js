// Add default tables/resources for Pool's Arena
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pool_arena.db');

const defaultTables = [
  // Pool Tables
  { name: 'Pool Table 1', type: 'pool_table', capacity: 6, hourly_rate: 2000 },
  { name: 'Pool Table 2', type: 'pool_table', capacity: 6, hourly_rate: 2000 },
  { name: 'Pool Table 3', type: 'pool_table', capacity: 6, hourly_rate: 2000 },
  { name: 'Snooker Table', type: 'pool_table', capacity: 4, hourly_rate: 2500 },
  
  // Dining Tables
  { name: 'Dining Table 1', type: 'dining_table', capacity: 4, hourly_rate: 0 },
  { name: 'Dining Table 2', type: 'dining_table', capacity: 4, hourly_rate: 0 },
  { name: 'Dining Table 3', type: 'dining_table', capacity: 6, hourly_rate: 0 },
  { name: 'Bar Counter Seating', type: 'dining_table', capacity: 8, hourly_rate: 0 },
  
  // Event Spaces
  { name: 'VIP Lounge', type: 'event_space', capacity: 20, hourly_rate: 10000 },
  { name: 'Private Room', type: 'event_space', capacity: 15, hourly_rate: 8000 },
];

console.log('Adding default tables to Pool\'s Arena...\n');

db.serialize(() => {
  // Check if tables already exist
  db.get('SELECT COUNT(*) as count FROM resources', (err, row) => {
    if (err) {
      console.error('Error checking existing resources:', err);
      return;
    }
    
    if (row.count > 0) {
      console.log(`✓ Found ${row.count} existing resource(s) in database`);
      console.log('Skipping default table creation to avoid duplicates.');
      console.log('\nTo add more tables, use the Staff Dashboard:\n');
      console.log('  1. Go to http://localhost:3000/staff/login');
      console.log('  2. Login with: admin / admin123');
      console.log('  3. Click "Tables Management"');
      console.log('  4. Add new tables\n');
      db.close();
      return;
    }
    
    const stmt = db.prepare(`
      INSERT INTO resources (name, type, capacity, hourly_rate, is_active) 
      VALUES (?, ?, ?, ?, 1)
    `);
    
    defaultTables.forEach(table => {
      stmt.run(table.name, table.type, table.capacity, table.hourly_rate, (err) => {
        if (err) {
          console.error(`✗ Error adding ${table.name}:`, err.message);
        } else {
          console.log(`✓ Added: ${table.name} (${table.type}, capacity: ${table.capacity})`);
        }
      });
    });
    
    stmt.finalize(() => {
      console.log('\n✓ Default tables added successfully!');
      console.log('\nYou can now:');
      console.log('  • Make reservations at http://localhost:3000');
      console.log('  • Manage tables at http://localhost:3000/staff/login\n');
      db.close();
    });
  });
});
