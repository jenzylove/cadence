DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS businesses;

CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  platforms TEXT NOT NULL DEFAULT 'instagram,x,linkedin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  details TEXT,
  photo_urls TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  angle TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT,
  scheduled_for TEXT,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);