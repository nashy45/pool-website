// Central configuration: env vars and absolute data paths.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const fs = require('fs');

const DEFAULT_SECRET = 'change-this-to-a-secure-random-string-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');

// Everything that must survive restarts/redeploys lives under DATA_DIR
const DATA_DIR = path.resolve(process.env.DATA_DIR || __dirname);
const DB_PATH = path.join(DATA_DIR, 'pools-arena.db');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const QR_DIR = path.join(DATA_DIR, 'qr-codes');
const PUBLIC_DIR = path.join(__dirname, 'public');

for (const dir of [DATA_DIR, UPLOADS_DIR, QR_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

if (NODE_ENV === 'production' && (JWT_SECRET === DEFAULT_SECRET || JWT_SECRET === 'change-this-secret-in-production' || JWT_SECRET.length < 16)) {
  console.error('FATAL: set a strong JWT_SECRET in .env (e.g. `openssl rand -hex 32`) before running in production.');
  process.exit(1);
}

module.exports = {
  NODE_ENV,
  PORT,
  JWT_SECRET,
  PUBLIC_URL,
  DATA_DIR,
  DB_PATH,
  UPLOADS_DIR,
  QR_DIR,
  PUBLIC_DIR,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || ''
};
