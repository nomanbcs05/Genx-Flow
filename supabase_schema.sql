-- ═══════════════════════════════════════════════════════════
-- StockFlow ERP — Complete Supabase Setup Script
-- Run this ONCE in Supabase SQL Editor
-- URL: https://app.supabase.com → Your Project → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  cat TEXT NOT NULL DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 0,
  min INTEGER NOT NULL DEFAULT 10,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  purchase_rate NUMERIC(10,2) DEFAULT 0.00,
  vendor TEXT DEFAULT '',
  contact_vendor TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in_stock',
  wh TEXT NOT NULL DEFAULT 'WH-01',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  date TEXT NOT NULL,
  due TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending',
  items INTEGER NOT NULL DEFAULT 1,
  items_list JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  date TEXT NOT NULL,
  expected TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  items INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  payments_slot TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  orders INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  terms TEXT NOT NULL DEFAULT 'Net 30',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  product TEXT DEFAULT '',
  credit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  debit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  company TEXT DEFAULT '',
  email TEXT DEFAULT '',
  orders INTEGER DEFAULT 0,
  spend NUMERIC(12,2) DEFAULT 0.00,
  tier TEXT DEFAULT 'growth',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  time TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin',
  company TEXT NOT NULL DEFAULT 'StockFlow ERP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY (open access for anon key)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public all access products" ON public.products;
DROP POLICY IF EXISTS "Allow public all access invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public all access purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow public all access vendors" ON public.vendors;
DROP POLICY IF EXISTS "Allow public all access customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public all access activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public all access notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public all access expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public all access categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public all access users" ON public.users;

-- Create open-access policies (anon key can read/write all)
CREATE POLICY "Allow public all access products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- ENABLE REALTIME (instant cross-device sync)
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- ═══════════════════════════════════════════════════════════
-- DEFAULT USERS (login credentials)
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.users (id, name, email, password, role, company) VALUES
  ('usr-001', 'Bilal Shoukat', 'bilalshoukatcrm@gmail.com', 'crm1234', 'Admin', 'StockFlow ERP Platform'),
  ('usr-002', 'Sarah Kim', 'sarah@stockflow.io', 'admin123', 'Admin', 'StockFlow Technologies Inc.')
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- DEFAULT CATEGORIES
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.categories (id, name) VALUES
  ('CAT-001', 'Wheat'),
  ('CAT-002', 'Floor'),
  ('CAT-003', 'Flour / Atta'),
  ('CAT-004', 'Fine / Maida'),
  ('CAT-005', 'Electronics'),
  ('CAT-006', 'Furniture'),
  ('CAT-007', 'Stationery'),
  ('CAT-008', 'Accessories')
ON CONFLICT (name) DO NOTHING;
