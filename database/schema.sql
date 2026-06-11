-- ============================================================
-- RestaurantOS Database Schema
-- PostgreSQL 14+
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,             -- bcrypt hashed
  phone       VARCHAR(20),
  address     TEXT,
  role        VARCHAR(20) DEFAULT 'customer'      -- 'customer' | 'admin'
              CHECK (role IN ('customer', 'admin')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  icon        VARCHAR(50),                        -- emoji or icon name
  display_order INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MENU ITEMS TABLE
-- ============================================================
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   INT REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(200) UNIQUE NOT NULL,
  description   TEXT,
  price         DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost_price    DECIMAL(10, 2) DEFAULT 0,        -- for profit calc
  image_url     VARCHAR(500),
  is_veg        BOOLEAN DEFAULT FALSE,
  is_available  BOOLEAN DEFAULT TRUE,
  is_featured   BOOLEAN DEFAULT FALSE,
  spice_level   INT DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
  prep_time_min INT DEFAULT 15,                  -- estimated prep time
  calories      INT,
  tags          TEXT[],                          -- ['bestseller', 'new', 'spicy']
  rating        DECIMAL(2,1) DEFAULT 0.0,
  rating_count  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menu_category ON menu_items(category_id);
CREATE INDEX idx_menu_featured ON menu_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_menu_available ON menu_items(is_available);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number    VARCHAR(20) UNIQUE NOT NULL,    -- e.g. ORD-20240312-0001
  status          VARCHAR(30) DEFAULT 'pending'
                  CHECK (status IN (
                    'pending', 'confirmed', 'preparing',
                    'out_for_delivery', 'delivered', 'cancelled'
                  )),
  -- Pricing
  subtotal        DECIMAL(10, 2) NOT NULL,
  tax_amount      DECIMAL(10, 2) DEFAULT 0,
  delivery_fee    DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount    DECIMAL(10, 2) NOT NULL,
  -- Delivery
  delivery_address TEXT NOT NULL,
  delivery_name   VARCHAR(100),
  delivery_phone  VARCHAR(20),
  delivery_notes  TEXT,
  -- Payment
  payment_method  VARCHAR(30) DEFAULT 'cod'      -- 'cod' | 'razorpay' | 'stripe'
                  CHECK (payment_method IN ('cod', 'razorpay', 'stripe')),
  payment_status  VARCHAR(20) DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id      VARCHAR(200),                  -- external payment reference
  -- Timestamps
  estimated_delivery TIMESTAMP,
  delivered_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  -- Snapshot of item at time of order
  item_name   VARCHAR(200) NOT NULL,
  item_image  VARCHAR(500),
  unit_price  DECIMAL(10, 2) NOT NULL,
  quantity    INT NOT NULL CHECK (quantity > 0),
  subtotal    DECIMAL(10, 2) NOT NULL,
  -- Customization notes
  special_instructions TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- ORDER STATUS HISTORY TABLE (for tracking)
-- ============================================================
CREATE TABLE order_status_history (
  id          SERIAL PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      VARCHAR(30) NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  menu_item_id  UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_approved   BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ORDER NUMBER SEQUENCE FUNCTION
-- ============================================================
CREATE SEQUENCE order_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  seq_num INT;
  order_num VARCHAR;
BEGIN
  seq_num := nextval('order_seq');
  order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;
