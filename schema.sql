CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS license_requests (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  license_code TEXT,
  status TEXT DEFAULT 'pending',
  is_seen INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_number) REFERENCES orders(order_number)
);

CREATE INDEX idx_license_requests_status ON license_requests(status);
CREATE INDEX idx_license_requests_order_number ON license_requests(order_number);
