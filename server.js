const config = require('./config');
const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
const { PORT, JWT_SECRET, PUBLIC_URL, UPLOADS_DIR, QR_DIR, PUBLIC_DIR } = config;
const bootstrap = require('./scripts/bootstrap');

// Initialize database (schema/seed handled by bootstrap() before listen)
const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  console.log('Database connected: ' + config.DB_PATH);
});

// Delete a stored "/uploads/..." file from disk (bundled /media/... files are never touched)
const removeUploadedFile = (url) => {
  if (!url || !url.startsWith('/uploads/')) return;
  const file = path.join(UPLOADS_DIR, path.basename(url));
  if (fs.existsSync(file)) fs.unlinkSync(file);
};

// Database helper functions
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
  });
});

// Running behind a reverse proxy (Caddy)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check (used by Docker)
app.get('/healthz', (req, res) => {
  db.get('SELECT 1', (err) => err ? res.status(500).json({ ok: false }) : res.json({ ok: true }));
});

// Serve staff login page (BEFORE static middleware)
app.get('/staff/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'staff', 'login.html'));
});

// Serve staff dashboard (protected)
app.get('/staff/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'staff', 'dashboard.html'));
});

// Block old admin routes - return 404
app.get('/admin', (req, res) => {
  res.redirect('/');
});

app.get('/admin/*', (req, res) => {
  res.redirect('/');
});

// Static file serving (AFTER specific routes)
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/qr-codes', express.static(QR_DIR));

// PUBLIC ROUTES
app.get('/api/business-info', async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM business_settings WHERE id = 1');
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM menu_categories ORDER BY display_order');
    const items = await dbAll('SELECT mi.*, mc.name as category_name FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mi.is_hidden = 0 ORDER BY mc.display_order, mi.name');
    
    const menu = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }));
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resources', async (req, res) => {
  try {
    let query = 'SELECT * FROM resources WHERE is_active = 1';
    const params = [];
    
    if (req.query.type) {
      query += ' AND type = ?';
      params.push(req.query.type);
    }
    
    query += ' ORDER BY name';
    const resources = await dbAll(query, params);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, payment_method, items, table_id, notes } = req.body;
    
    console.log('📦 Order received:', { customer_name, items_count: items?.length });
    
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      console.log('   Checking item:', item);
      const menuItem = await dbGet('SELECT * FROM menu_items WHERE id = ? AND is_available = 1', [item.menu_item_id]);
      
      if (!menuItem) {
        console.log('   ❌ Menu item not found or unavailable:', item.menu_item_id);
        return res.status(400).json({ error: `Menu item not available (ID: ${item.menu_item_id})` });
      }
      
      console.log('   ✓ Found:', menuItem.name);
      
      const subtotal = menuItem.price * item.quantity;
      total += subtotal;
      orderItems.push({
        menu_item_id: menuItem.id,
        menu_item_name: menuItem.name,
        menu_item_price: menuItem.price,
        quantity: item.quantity,
        subtotal
      });
    }
    
    const order_number = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const orderResult = await dbRun(
      'INSERT INTO orders (order_number, customer_name, customer_phone, table_id, payment_method, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [order_number, customer_name, customer_phone, table_id || null, payment_method, total, notes || null]
    );
    
    for (const item of orderItems) {
      await dbRun(
        'INSERT INTO order_items (order_id, menu_item_id, menu_item_name, menu_item_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderResult.lastID, item.menu_item_id, item.menu_item_name, item.menu_item_price, item.quantity, item.subtotal]
      );
    }
    
    const settings = await dbGet('SELECT * FROM business_settings WHERE id = 1');
    
    res.status(201).json({
      id: orderResult.lastID,
      order_number,
      total_amount: total,
      payment_method,
      merchant_code: payment_method === 'mtn_momo' ? settings?.mtn_merchant_code : payment_method === 'orange_money' ? settings?.orange_merchant_code : null,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STAFF API ROUTES (Protected)
app.post('/api/staff/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {
      pending_orders: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['new'])).count,
      pending_reservations: (await dbGet('SELECT COUNT(*) as count FROM reservations WHERE status = ?', ['pending'])).count,
      menu_items: (await dbGet('SELECT COUNT(*) as count FROM menu_items WHERE is_hidden = 0')).count,
      active_tables: (await dbGet('SELECT COUNT(*) as count FROM resources WHERE is_active = 1')).count,
      today_orders: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE(\"now\")')).count,
      today_revenue: (await dbGet('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = DATE(\"now\") AND status NOT IN (\"cancelled\")')).total
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoints
app.get('/api/staff/analytics/revenue', authenticateToken, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 7;
    const query = `
      SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE DATE(created_at) >= DATE('now', '-${period} days')
        AND status NOT IN ('cancelled')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const data = await dbAll(query);
    
    // Fill in missing dates with 0 revenue
    const result = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.date === dateStr);
      result.push({
        date: dateStr,
        revenue: dayData ? dayData.revenue : 0
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/analytics/top-items', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const period = parseInt(req.query.period) || 30;
    
    const query = `
      SELECT 
        oi.menu_item_name as name,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) >= DATE('now', '-${period} days')
        AND o.status NOT IN ('cancelled')
      GROUP BY oi.menu_item_id, oi.menu_item_name
      ORDER BY total_sold DESC
      LIMIT ?
    `;
    
    const items = await dbAll(query, [limit]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/analytics/busiest-hours', authenticateToken, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 7;
    
    const query = `
      SELECT 
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as order_count
      FROM orders
      WHERE DATE(created_at) >= DATE('now', '-${period} days')
        AND status NOT IN ('cancelled')
      GROUP BY hour
      ORDER BY hour ASC
    `;
    
    const data = await dbAll(query);
    
    // Fill in all 24 hours
    const result = [];
    for (let i = 0; i < 24; i++) {
      const hourData = data.find(d => d.hour === i);
      result.push({
        hour: i,
        order_count: hourData ? hourData.order_count : 0
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/analytics/orders-by-table', authenticateToken, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    
    const query = `
      SELECT 
        COALESCE(r.name, 'Walk-in') as table_name,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM orders o
      LEFT JOIN resources r ON o.table_id = r.id
      WHERE DATE(o.created_at) >= DATE('now', '-${period} days')
        AND o.status NOT IN ('cancelled')
      GROUP BY o.table_id, table_name
      ORDER BY order_count DESC
      LIMIT 10
    `;
    
    const tables = await dbAll(query);
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/analytics/reservations-by-type', authenticateToken, async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    
    const query = `
      SELECT 
        resource_type as type,
        COUNT(*) as count,
        SUM(group_size) as total_guests
      FROM reservations
      WHERE DATE(date) >= DATE('now', '-${period} days')
      GROUP BY resource_type
      ORDER BY count DESC
    `;
    
    const types = await dbAll(query);
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/orders', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT o.*, r.name as table_name FROM orders o LEFT JOIN resources r ON o.table_id = r.id';
    const params = [];
    
    if (req.query.status) {
      query += ' WHERE o.status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT 100';
    const orders = await dbAll(query, params);
    
    for (const order of orders) {
      order.items = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/staff/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/staff/orders/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.payment_status, req.params.id]);
    res.json({ message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/reservations', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    
    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }
    
    if (req.query.date) {
      query += ' AND date = ?';
      params.push(req.query.date);
    }
    
    query += ' ORDER BY date DESC, start_time DESC LIMIT 100';
    const reservations = await dbAll(query, params);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/staff/reservations/:id/status', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Reservation status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/staff/reservations/:id', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/menu', authenticateToken, async (req, res) => {
  try {
    const items = await dbAll('SELECT mi.*, mc.name as category_name FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id ORDER BY mc.display_order, mi.name');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/menu-categories', authenticateToken, async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM menu_categories ORDER BY display_order');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff/menu', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;
    const image_url = req.file ? '/uploads/' + req.file.filename : null;
    
    const result = await dbRun(
      'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, parseInt(price), parseInt(category_id), image_url]
    );
    
    res.status(201).json({ id: result.lastID, message: 'Menu item added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/menu/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id, is_available, is_hidden } = req.body;
    const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    
    if (!item) return res.status(404).json({ error: 'Not found' });

    const parseFlag = (value, fallback) => {
      if (value === undefined) return fallback;
      return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
    };
    
    let image_url = item.image_url;
    if (req.file) {
      image_url = '/uploads/' + req.file.filename;
      removeUploadedFile(item.image_url);
    }
    
    await dbRun(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?, is_hidden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        name,
        description || null,
        parseInt(price),
        parseInt(category_id),
        image_url,
        parseFlag(is_available, item.is_available),
        parseFlag(is_hidden, item.is_hidden),
        req.params.id
      ]
    );
    
    res.json({ message: 'Menu item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/staff/menu/:id', authenticateToken, async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    removeUploadedFile(item?.image_url);
    
    await dbRun('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/resources', authenticateToken, async (req, res) => {
  try {
    const resources = await dbAll('SELECT * FROM resources ORDER BY type, name');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff/resources', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity } = req.body;
    const result = await dbRun('INSERT INTO resources (name, type, capacity) VALUES (?, ?, ?)', [name, type, parseInt(capacity)]);
    res.status(201).json({ id: result.lastID, message: 'Resource added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/resources/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity, is_active } = req.body;
    await dbRun('UPDATE resources SET name = ?, type = ?, capacity = ?, is_active = ? WHERE id = ?', [name, type, parseInt(capacity), is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Resource updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/staff/resources/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await dbGet('SELECT qr_code_url FROM resources WHERE id = ?', [req.params.id]);
    if (resource?.qr_code_url) {
      const qrFile = path.join(QR_DIR, path.basename(resource.qr_code_url));
      if (fs.existsSync(qrFile)) fs.unlinkSync(qrFile);
    }
    
    await dbRun('DELETE FROM resources WHERE id = ?', [req.params.id]);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff/resources/:id/generate-qr', authenticateToken, async (req, res) => {
  try {
    const resource = await dbGet('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    if (!resource) return res.status(404).json({ error: 'Not found' });
    
    const qrDir = QR_DIR;
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    
    const qrUrl = PUBLIC_URL + '?table=' + resource.id;
    const qrFilename = 'table-' + resource.id + '-' + Date.now() + '.png';
    const qrPath = path.join(qrDir, qrFilename);
    
    await QRCode.toFile(qrPath, qrUrl, { width: 400, margin: 2 });
    
    const qr_code_url = '/qr-codes/' + qrFilename;
    await dbRun('UPDATE resources SET qr_code_url = ? WHERE id = ?', [qr_code_url, resource.id]);
    
    res.json({ qr_code_url, message: 'QR code generated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM business_settings WHERE id = 1');
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/settings', authenticateToken, async (req, res) => {
  try {
    const { business_name, phone, location, opening_time, closing_time, opening_days, mtn_merchant_code, orange_merchant_code } = req.body;
    
    await dbRun(
      'UPDATE business_settings SET business_name = ?, phone = ?, location = ?, opening_time = ?, closing_time = ?, opening_days = ?, mtn_merchant_code = ?, orange_merchant_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [business_name, phone, location, opening_time, closing_time, opening_days, mtn_merchant_code, orange_merchant_code]
    );
    
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }
    
    const hashedPassword = bcrypt.hashSync(new_password, 10);
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Media Management Routes
app.get('/api/staff/media', authenticateToken, async (req, res) => {
  try {
    const type = req.query.type;
    let query = 'SELECT * FROM website_media WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY display_order ASC, created_at DESC';
    const media = await dbAll(query, params);
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff/media', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { type, alt_text, caption, display_order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate type
    const validTypes = ['hero_video', 'hero_poster', 'gallery', 'venue'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }
    
    const file_path = '/uploads/' + req.file.filename;
    
    const result = await dbRun(
      'INSERT INTO website_media (type, filename, original_filename, file_path, alt_text, caption, display_order, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type, req.file.filename, req.file.originalname, file_path, alt_text || '', caption || '', display_order || 0, req.file.size, req.file.mimetype]
    );
    
    // If it's a new hero poster or video, optimize/process it
    if (type === 'hero_poster' || type === 'gallery') {
      // TODO: Add image optimization here using Sharp
      console.log(`New ${type} uploaded, optimization recommended`);
    }
    
    res.status(201).json({ 
      id: result.lastID, 
      message: 'Media uploaded successfully',
      file_path 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff/media/:id', authenticateToken, async (req, res) => {
  try {
    const { alt_text, caption, display_order, is_active } = req.body;
    
    await dbRun(
      'UPDATE website_media SET alt_text = ?, caption = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [alt_text, caption, display_order, is_active ? 1 : 0, req.params.id]
    );
    
    res.json({ message: 'Media updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/staff/media/:id', authenticateToken, async (req, res) => {
  try {
    const media = await dbGet('SELECT * FROM website_media WHERE id = ?', [req.params.id]);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Delete uploaded file from filesystem
    removeUploadedFile(media.file_path);
    
    // Delete from database
    await dbRun('DELETE FROM website_media WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check reservation availability
app.post('/api/reservations/check-availability', async (req, res) => {
  try {
    const { resource_id, date, start_time, end_time } = req.body;
    
    // Check for overlapping reservations
    const overlapping = await dbAll(
      `SELECT * FROM reservations 
       WHERE resource_id = ? 
       AND date = ? 
       AND status NOT IN ('cancelled', 'declined')
       AND (
         (start_time <= ? AND end_time > ?) OR
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [resource_id, date, start_time, start_time, end_time, end_time, start_time, end_time]
    );
    
    res.json({ available: overlapping.length === 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { customer_name, customer_phone, resource_id, date, start_time, duration, group_size, notes } = req.body;
    
    const [hours, minutes] = start_time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const end_time = Math.floor(endMinutes / 60) + ':' + (endMinutes % 60).toString().padStart(2, '0');
    
    const resource = await dbGet('SELECT * FROM resources WHERE id = ? AND is_active = 1', [resource_id]);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    
    const reservation_number = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const result = await dbRun(
      'INSERT INTO reservations (reservation_number, customer_name, customer_phone, resource_id, resource_type, resource_name, date, start_time, end_time, duration, group_size, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reservation_number, customer_name, customer_phone, resource_id, resource.type, resource.name, date, start_time, end_time, duration, group_size, notes || null]
    );
    
    res.status(201).json({ id: result.lastID, reservation_number, message: 'Reservation submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start: prepare the database (schema, seed, owner), then listen
let server;
bootstrap(db)
  .then(() => {
    server = app.listen(PORT, () => {
      console.log("\nPool's Arena server running on port " + PORT);
      console.log('Public URL:  ' + PUBLIC_URL);
      console.log('Staff login: ' + PUBLIC_URL + '/staff/login\n');
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });

// Graceful shutdown (docker stop sends SIGTERM)
const shutdown = (signal) => {
  console.log(signal + ' received, shutting down...');
  const closeDb = () => db.close(() => process.exit(0));
  server ? server.close(closeDb) : closeDb();
  setTimeout(() => process.exit(0), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
