-- StockFlow ERP — Supabase Database Schema & Seed Script

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cat TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  min INTEGER NOT NULL DEFAULT 10,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
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
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
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
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  orders INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  tier TEXT NOT NULL DEFAULT 'growth',
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

-- Enable Row Level Security (RLS) and grant permissive access for client-side API operations
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access products" ON public.products;
DROP POLICY IF EXISTS "Allow public all access invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public all access purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow public all access vendors" ON public.vendors;
DROP POLICY IF EXISTS "Allow public all access customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public all access activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public all access notifications" ON public.notifications;

CREATE POLICY "Allow public all access products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- INITIAL SEED DATA
INSERT INTO public.products (id, sku, name, cat, qty, min, price, status, wh) VALUES
  ('P001', 'ELC-MON-4K-27', 'ProVision 4K Monitor 27"', 'Electronics', 142, 20, 449.99, 'in_stock', 'WH-01'),
  ('P002', 'ELC-KBD-MX-SLV', 'MX Mechanical Keyboard Pro', 'Electronics', 8, 15, 149.99, 'low_stock', 'WH-01'),
  ('P003', 'FRN-CHR-ERG-BLK', 'ErgoFlow Pro Office Chair', 'Furniture', 0, 5, 589.00, 'out_of_stock', 'WH-02'),
  ('P004', 'ELC-HPH-ANC-700', 'QuietMax ANC Headphones', 'Electronics', 234, 30, 279.99, 'in_stock', 'WH-01'),
  ('P005', 'FRN-DSK-STD-OAK', 'StandUp Desk Pro 60" Oak', 'Furniture', 12, 8, 799.00, 'in_stock', 'WH-02'),
  ('P006', 'ELC-WEB-4K-WHT', 'StreamCam 4K Webcam', 'Electronics', 6, 20, 139.99, 'low_stock', 'WH-01'),
  ('P007', 'STA-NTB-B6-BLU', 'Premium Notebook B6 Blue', 'Stationery', 1240, 200, 12.99, 'in_stock', 'WH-03'),
  ('P008', 'ELC-HUB-C7-SLV', 'USB-C Hub 7-in-1', 'Electronics', 89, 25, 59.99, 'in_stock', 'WH-01'),
  ('P009', 'ELC-MSE-WL-GRY', 'Precision Wireless Mouse', 'Electronics', 67, 30, 89.99, 'in_stock', 'WH-01'),
  ('P010', 'FRN-LMP-DSK-WHT', 'ArcLight LED Desk Lamp', 'Furniture', 43, 15, 69.99, 'in_stock', 'WH-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invoices (id, customer, date, due, amount, status, items) VALUES
  ('INV-2024-0847', 'Meridian Technologies Ltd.', 'Dec 18, 2024', 'Jan 17, 2025', 12840.00, 'paid', 8),
  ('INV-2024-0846', 'Apex Solutions Group', 'Dec 17, 2024', 'Jan 16, 2025', 5620.50, 'pending', 4),
  ('INV-2024-0845', 'Blue Horizon Corp.', 'Dec 16, 2024', 'Dec 30, 2024', 3890.00, 'overdue', 3),
  ('INV-2024-0844', 'NovaStar Retail Inc.', 'Dec 15, 2024', 'Jan 14, 2025', 28450.00, 'paid', 15),
  ('INV-2024-0843', 'Quantum Dynamics LLC', 'Dec 14, 2024', 'Jan 13, 2025', 7200.00, 'pending', 6),
  ('INV-2024-0842', 'Vertex Global Partners', 'Dec 13, 2024', 'Jan 12, 2025', 15980.00, 'draft', 11),
  ('INV-2024-0841', 'Clearview Systems Inc.', 'Dec 12, 2024', 'Jan 11, 2025', 4320.00, 'paid', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.purchase_orders (id, vendor, date, expected, amount, items, status) VALUES
  ('PO-2024-0234', 'TechSource Global', 'Dec 18, 2024', 'Dec 28, 2024', 48200.00, 12, 'approved'),
  ('PO-2024-0233', 'Pinnacle Supplies Co.', 'Dec 17, 2024', 'Dec 25, 2024', 12840.00, 6, 'received'),
  ('PO-2024-0232', 'Metro Office Distributors', 'Dec 16, 2024', 'Dec 26, 2024', 8950.00, 9, 'in_transit'),
  ('PO-2024-0231', 'Summit Electronics', 'Dec 14, 2024', 'Dec 24, 2024', 31700.00, 15, 'received'),
  ('PO-2024-0230', 'Cornerstone Logistics', 'Dec 12, 2024', 'Dec 22, 2024', 5600.00, 3, 'draft')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vendors (id, name, contact, email, orders, spend, status, terms) VALUES
  ('V001', 'TechSource Global', 'David Huang', 'dhuang@techsource.com', 18, 284200.00, 'active', 'Net 30'),
  ('V002', 'Pinnacle Supplies Co.', 'Lisa Moreno', 'l.moreno@pinnacle.co', 12, 128400.00, 'active', 'Net 15'),
  ('V003', 'Metro Office Distributors', 'Tom Bradley', 't.bradley@metrooffice.com', 8, 67800.00, 'active', 'Net 30'),
  ('V004', 'Summit Electronics', 'Priya Sharma', 'p.sharma@summitelec.io', 21, 412600.00, 'active', 'Net 45'),
  ('V005', 'Cornerstone Logistics', 'Ryan Walsh', 'r.walsh@cornerstone.net', 5, 28000.00, 'inactive', 'Net 30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (id, name, company, email, orders, spend, status, tier) VALUES
  ('CUS-001', 'Alexandra Chen', 'Meridian Technologies', 'a.chen@meridiantech.com', 24, 84920.00, 'active', 'enterprise'),
  ('CUS-002', 'Marcus Williams', 'Apex Solutions Group', 'm.williams@apexgroup.io', 18, 52340.00, 'active', 'professional'),
  ('CUS-003', 'Sophia Patel', 'Blue Horizon Corp.', 's.patel@bluehorizon.com', 7, 18600.00, 'at_risk', 'growth'),
  ('CUS-004', 'James O''Brien', 'NovaStar Retail Inc.', 'jobrien@novastar.retail', 41, 241800.00, 'active', 'enterprise'),
  ('CUS-005', 'Yuki Tanaka', 'Quantum Dynamics LLC', 'y.tanaka@qdynamics.co', 12, 38200.00, 'active', 'professional'),
  ('CUS-006', 'Elena Novak', 'Vertex Global Partners', 'e.novak@vertexglobal.eu', 9, 29450.00, 'inactive', 'growth')
ON CONFLICT (id) DO NOTHING;

-- 8. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin',
  company TEXT NOT NULL DEFAULT 'StockFlow ERP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access users" ON public.users;
CREATE POLICY "Allow public all access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.users (id, name, email, password, role, company) VALUES
  ('usr-001', 'Bilal Shoukat', 'bilalshoukatcrm@gmail.com', 'crm1234', 'Admin', 'StockFlow ERP Platform'),
  ('usr-002', 'Sarah Kim', 'sarah@stockflow.io', 'admin123', 'Admin', 'StockFlow Technologies Inc.')
ON CONFLICT (email) DO NOTHING;
