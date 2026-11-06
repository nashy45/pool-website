-- Users (Owner/Admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'owner' CHECK(role IN ('owner', 'admin', 'staff')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Business Settings
CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  business_name TEXT DEFAULT 'Pool''s Arena Club & Bar',
  phone TEXT DEFAULT '677685692',
  location TEXT DEFAULT 'Bonabéri, Douala, behind Ancien Sonel',
  opening_time TEXT DEFAULT '18:30',
  closing_time TEXT,
  opening_days TEXT DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
  mtn_merchant_code TEXT,
  orange_merchant_code TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  image_url TEXT,
  is_available INTEGER DEFAULT 1,
  is_hidden INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- Tables/Resources (Pool tables, dining tables, event spaces)
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pool_table', 'dining_table', 'event_space')),
  capacity INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  qr_code_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  table_id INTEGER,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('mtn_momo', 'orange_money', 'pay_at_venue')),
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES resources(id) ON DELETE SET NULL
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  menu_item_name TEXT NOT NULL,
  menu_item_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  resource_id INTEGER NOT NULL,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  group_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available, is_hidden);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_resource ON reservations(resource_id, date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Website media (hero / gallery management in staff dashboard)
CREATE TABLE IF NOT EXISTS website_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('hero_video', 'hero_poster', 'gallery', 'venue')),
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
