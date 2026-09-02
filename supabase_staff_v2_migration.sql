-- ═══════════════════════════════════════════════════════════════════════════════
-- StockFlow ERP / Restaurant POS — Staff Management Module V2 (PRO Upgrade)
-- PostgreSQL Migration Script (Zero Downtime / Non-Destructive)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Rules followed:
-- 1. IF NOT EXISTS on all tables, columns, constraints and indexes
-- 2. FK to employees table
-- 3. restaurant_id on every table for multi-tenant isolation across 20+ restaurants
-- 4. Feature flag setting entry for staff_management_v2
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 0: ENSURE EMPLOYEES TABLE EXISTS & ADD NEW COLUMNS SAFELY
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY DEFAULT ('emp-' || floor(random()*90000 + 10000)::text),
    restaurant_id TEXT NOT NULL DEFAULT 'default_restaurant',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    designation TEXT DEFAULT 'Staff',
    department TEXT DEFAULT 'General',
    base_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active',
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing employees table if not present
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS restaurant_id TEXT DEFAULT 'default_restaurant';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cnic VARCHAR(30) DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100) DEFAULT '';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary_type VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12,2) DEFAULT 0.00;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: ATTENDANCE_LOGS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Logs daily check-in, check-out and attendance status per employee per restaurant.

CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id TEXT PRIMARY KEY DEFAULT ('att-' || floor(random()*900000 + 100000)::text),
    restaurant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'halfday', 'leave')),
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_restaurant_employee_date UNIQUE (restaurant_id, employee_id, date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: SALARY_ADVANCES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Records advance payments given to employees, tracked for deduction in payroll.

CREATE TABLE IF NOT EXISTS public.salary_advances (
    id TEXT PRIMARY KEY DEFAULT ('adv-' || floor(random()*900000 + 100000)::text),
    restaurant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    reason TEXT DEFAULT '',
    deducted_in_month DATE NOT NULL, -- First day of deduction month (e.g. 2026-08-01)
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: PAYROLL_HISTORY TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores generated monthly payroll snapshot for audit, reports, and ledger sync.

CREATE TABLE IF NOT EXISTS public.payroll_history (
    id TEXT PRIMARY KEY DEFAULT ('pay-' || floor(random()*900000 + 100000)::text),
    restaurant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of payroll month (e.g. 2026-08-01)
    base_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    present_days INTEGER NOT NULL DEFAULT 0,
    absent_days INTEGER NOT NULL DEFAULT 0,
    bonus NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    advances NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_payroll_restaurant_emp_month UNIQUE (restaurant_id, employee_id, month)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: SALARY_VOUCHERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores salary vouchers generated with PDF link in Vercel Blob and payment status.

CREATE TABLE IF NOT EXISTS public.salary_vouchers (
    id TEXT PRIMARY KEY DEFAULT ('vch-' || floor(random()*900000 + 100000)::text),
    restaurant_id TEXT NOT NULL,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of payroll month (e.g. 2026-08-01)
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    voucher_no TEXT NOT NULL UNIQUE,
    pdf_url TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'paid')),
    paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: SETTINGS TABLE & FEATURE FLAG (staff_management_v2 = true)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'app_settings',
    restaurant_id TEXT NOT NULL DEFAULT 'default_restaurant',
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT 'true'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_restaurant_settings_key UNIQUE (restaurant_id, key)
);

-- Insert or update feature flag for default restaurant
INSERT INTO public.settings (id, restaurant_id, key, value, updated_at)
VALUES ('setting-staff-v2', 'default_restaurant', 'staff_management_v2', 'true'::jsonb, NOW())
ON CONFLICT (restaurant_id, key) 
DO UPDATE SET value = 'true'::jsonb, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: PERFORMANCE INDEXES (FOR 20+ MULTI-TENANT RESTAURANTS)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_employees_restaurant ON public.employees (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_restaurant_date ON public.attendance_logs (restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_restaurant_emp ON public.attendance_logs (restaurant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_advances_restaurant_month ON public.salary_advances (restaurant_id, deducted_in_month);
CREATE INDEX IF NOT EXISTS idx_advances_restaurant_emp ON public.salary_advances (restaurant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_restaurant_month ON public.payroll_history (restaurant_id, month);
CREATE INDEX IF NOT EXISTS idx_vouchers_restaurant_month ON public.salary_vouchers (restaurant_id, month);
CREATE INDEX IF NOT EXISTS idx_vouchers_restaurant_status ON public.salary_vouchers (restaurant_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7: ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Allow public all access employees') THEN
        CREATE POLICY "Allow public all access employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance_logs' AND policyname = 'Allow public all access attendance_logs') THEN
        CREATE POLICY "Allow public all access attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salary_advances' AND policyname = 'Allow public all access salary_advances') THEN
        CREATE POLICY "Allow public all access salary_advances" ON public.salary_advances FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payroll_history' AND policyname = 'Allow public all access payroll_history') THEN
        CREATE POLICY "Allow public all access payroll_history" ON public.payroll_history FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salary_vouchers' AND policyname = 'Allow public all access salary_vouchers') THEN
        CREATE POLICY "Allow public all access salary_vouchers" ON public.salary_vouchers FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public all access settings') THEN
        CREATE POLICY "Allow public all access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 8: ENABLE REALTIME SYNC (SUPABASE REALTIME)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.salary_advances;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.salary_vouchers;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE: 4 NEW TABLES CREATED, EMPLOYEES ENHANCED SAFELY.
-- ═══════════════════════════════════════════════════════════════════════════════
