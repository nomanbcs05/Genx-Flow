-- ═══════════════════════════════════════════════════════════════════════════════
-- StockFlow POS — Step 3: Test Restaurant Pilot Activation & Seed Script
-- Restaurant Tenant ID: 'test_restaurant_01' (or replace with your actual test ID)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. ACTIVATE FEATURE FLAG ONLY FOR TEST RESTAURANT
INSERT INTO public.settings (id, restaurant_id, key, value, updated_at)
VALUES ('setting-staff-v2-test', 'test_restaurant_01', 'staff_management_v2', 'true'::jsonb, NOW())
ON CONFLICT (restaurant_id, key) 
DO UPDATE SET value = 'true'::jsonb, updated_at = NOW();

-- 2. INSERT SAMPLE PILOT EMPLOYEES FOR TEST RESTAURANT
INSERT INTO public.employees (id, restaurant_id, name, designation, department, base_salary, salary_type, cnic, bank_account, status)
VALUES
  ('emp-test-01', 'test_restaurant_01', 'Muhammad Asif', 'Head Chef', 'Kitchen', 65000.00, 'monthly', '35201-1234567-1', 'PK36MEZN0000123456789012', 'active'),
  ('emp-test-02', 'test_restaurant_01', 'Zubair Tariq', 'POS Cashier & Floor Lead', 'Front Desk', 42000.00, 'monthly', '35202-9876543-3', 'PK45HABB0012345678901234', 'active'),
  ('emp-test-03', 'test_restaurant_01', 'Hamza Malik', 'Sous Chef', 'Kitchen', 48000.00, 'monthly', '35201-5544332-9', 'PK12BAHL0098765432101234', 'active'),
  ('emp-test-04', 'test_restaurant_01', 'Bilal Ahmed', 'Waiter / Service Captain', 'Service', 32000.00, 'monthly', '35201-7788990-5', 'PK99JSBL0011223344556677', 'active')
ON CONFLICT (id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  base_salary = EXCLUDED.base_salary,
  cnic = EXCLUDED.cnic,
  bank_account = EXCLUDED.bank_account;

-- 3. INSERT SAMPLE SALARY ADVANCE FOR TESTING DEDUCTION
INSERT INTO public.salary_advances (id, restaurant_id, employee_id, date, amount, reason, deducted_in_month, created_by)
VALUES
  ('adv-test-01', 'test_restaurant_01', 'emp-test-01', CURRENT_DATE, 5000.00, 'Emergency advance', DATE_TRUNC('month', CURRENT_DATE)::DATE, 'manager')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PILOT RESTAURANT SETUP READY!
-- ═══════════════════════════════════════════════════════════════════════════════
