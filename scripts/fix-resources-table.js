// Fix missing resources table in pools-arena database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pools-arena.db');

console.log('Checking resources table...\n');

db.serialize(() => {
  // Check if resources table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='resources'", (err, row) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }
    
    if (row) {
      console.log('✓ Resources table already exists');
      
      // Count existing resources
      db.get('SELECT COUNT(*) as count FROM resources', (err, countRow) => {
        if (err) {
          console.error('Error counting resources:', err);
        } else {
          console.log(`✓ Found ${countRow.count} resource(s) in database\n`);
          
          if (countRow.count === 0) {
            console.log('No resources found. Adding default tables...\n');
            addDefaultTables();
          } else {
            console.log('Resources exist. You can add more via Staff Dashboard.');
            db.close();
          }
        }
      });
    } else {
      console.log('✗ Resources table missing. Creating it now...\n');
      createResourcesTable();
    }
  });
});

function createResourcesTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('pool_table', 'dining_table', 'event_space')),
      capacity INTEGER DEFAULT 1,
      hourly_rate INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      qr_code_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
    CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
  `;
  
  db.exec(createTableSQL, (err) => {
    if (err) {
      console.error('✗ Error creating resources table:', err);
      db.close();
      return;
    }
    
    console.log('✓ Resources table created successfully!\n');
    console.log('Adding default tables...\n');
    addDefaultTables();
  });
}

function addDefaultTables() {
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
  
  const stmt = db.prepare(`
    INSERT INTO resources (name, type, capacity, hourly_rate, is_active) 
    VALUES (?, ?, ?, ?, 1)
  `);
  
  let count = 0;
  defaultTables.forEach(table => {
    stmt.run(table.name, table.type, table.capacity, table.hourly_rate, (err) => {
      if (err) {
        console.error(`✗ Error adding ${table.name}:`, err.message);
      } else {
        console.log(`✓ Added: ${table.name} (${table.type}, capacity: ${table.capacity})`);
      }
      count++;
      
      if (count === defaultTables.length) {
        finishSetup();
      }
    });
  });
  
  stmt.finalize();
}

function finishSetup() {
  console.log('\n✅ Setup complete!');
  console.log('\nYou can now:');
  console.log('  • Make reservations at http://localhost:3000');
  console.log('  • Manage tables at http://localhost:3000/staff/login');
  console.log('  • View/edit tables in "Tables Management" section\n');
  db.close();
}
