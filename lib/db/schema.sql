CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  details TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  angle TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT,
  scheduled_for TIMESTAMP,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);