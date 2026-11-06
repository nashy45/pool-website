// Kept for backwards compatibility: `npm run init-db` runs the idempotent bootstrap.
const sqlite3 = require('sqlite3');
const config = require('../config');
const bootstrap = require('./bootstrap');

const db = new sqlite3.Database(config.DB_PATH);
bootstrap(db)
  .then(() => db.close())
  .catch((err) => {
    console.error('Database init failed:', err);
    db.close();
    process.exit(1);
  });
