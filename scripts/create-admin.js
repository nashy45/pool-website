const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const config = require('../config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('\n=== Create Owner/Admin Account ===\n');

  const username = await question('Enter username: ');
  if (!username || username.length < 3) {
    console.error('❌ Username must be at least 3 characters');
    rl.close();
    return;
  }

  const password = await question('Enter password: ');
  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    rl.close();
    return;
  }

  const confirmPassword = await question('Confirm password: ');
  if (password !== confirmPassword) {
    console.error('❌ Passwords do not match');
    rl.close();
    return;
  }

  rl.close();

  try {
    const dbPath = config.DB_PATH;
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        return;
      }
      
      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert user
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'owner'],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              console.error('\n❌ Error: Username already exists');
            } else {
              console.error('\n❌ Error creating account:', err.message);
            }
          } else {
            console.log('\n✓ Owner account created successfully!');
            console.log(`✓ Username: ${username}`);
            console.log(`✓ User ID: ${this.lastID}`);
            console.log('\nYou can now log in at: ' + config.PUBLIC_URL + '/staff/login');
          }
          
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

createAdmin();
