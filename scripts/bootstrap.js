// Idempotent database bootstrap: schema, defaults, first-run seed data, owner account.
// Runs automatically on server start; can also be run manually: `npm run bootstrap`.
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { menuData, defaultResources } = require('../db/seed-data');

function promisify(db) {
  return {
    get: (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (e, r) => (e ? rej(e) : res(r)))),
    run: (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res(this); })),
    exec: (sql) => new Promise((res, rej) => db.exec(sql, (e) => (e ? rej(e) : res())))
  };
}

async function bootstrap(db, log = console.log) {
  const q = promisify(db);

  // 1. Schema (all CREATE ... IF NOT EXISTS)
  await q.exec('PRAGMA foreign_keys = ON');
  await q.exec(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));

  // 2. Defaults
  await q.run('INSERT OR IGNORE INTO business_settings (id) VALUES (1)');
  const baseCategories = [['Meals', 1], ['Snacks', 2], ['Drinks', 3]];
  for (const [name, order] of baseCategories) {
    await q.run('INSERT OR IGNORE INTO menu_categories (name, display_order) VALUES (?, ?)', [name, order]);
  }

  // 3. Seed data, only into empty tables
  const { count: menuCount } = await q.get('SELECT COUNT(*) AS count FROM menu_items');
  if (menuCount === 0) {
    let added = 0;
    const names = Object.keys(menuData);
    await q.exec('BEGIN');
    try {
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        await q.run('INSERT OR IGNORE INTO menu_categories (name, display_order) VALUES (?, ?)', [name, baseCategories.length + 1 + i]);
        const { id: categoryId } = await q.get('SELECT id FROM menu_categories WHERE name = ?', [name]);
        for (const item of menuData[name]) {
          await q.run(
            'INSERT INTO menu_items (name, description, price, category_id, is_available, is_hidden) VALUES (?, ?, ?, ?, 1, 0)',
            [item.name, `Premium ${name}`, item.price, categoryId]
          );
          added++;
        }
      }
      await q.exec('COMMIT');
    } catch (err) {
      await q.exec('ROLLBACK');
      throw err;
    }
    log(`[bootstrap] Seeded ${added} menu items`);
  }

  const { count: resourceCount } = await q.get('SELECT COUNT(*) AS count FROM resources');
  if (resourceCount === 0) {
    for (const r of defaultResources) {
      await q.run('INSERT INTO resources (name, type, capacity, is_active) VALUES (?, ?, ?, 1)', [r.name, r.type, r.capacity]);
    }
    log(`[bootstrap] Seeded ${defaultResources.length} tables/resources`);
  }

  // 4. Owner account from env (only when no users exist)
  const { count: userCount } = await q.get('SELECT COUNT(*) AS count FROM users');
  if (userCount === 0) {
    const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = config;
    if (username && password) {
      if (username.length < 3 || password.length < 6) {
        log('[bootstrap] WARNING: ADMIN_USERNAME must be >= 3 chars and ADMIN_PASSWORD >= 6 chars; owner not created');
      } else {
        await q.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, bcrypt.hashSync(password, 10), 'owner']);
        log(`[bootstrap] Created owner account "${username}"`);
      }
    } else {
      log('[bootstrap] WARNING: no staff accounts exist. Set ADMIN_USERNAME/ADMIN_PASSWORD in .env and restart, or run `npm run create-admin`.');
    }
  }

  log('[bootstrap] Database ready');
}

module.exports = bootstrap;

if (require.main === module) {
  const db = new sqlite3.Database(config.DB_PATH);
  bootstrap(db)
    .then(() => db.close())
    .catch((err) => {
      console.error('[bootstrap] Failed:', err);
      db.close();
      process.exit(1);
    });
}
