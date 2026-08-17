-- ========================================================
-- VIKSIT VYAPARI CIVIC PLATFORM - SUPABASE SQL SCHEMA
-- Run this script in Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Create Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stallName TEXT,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    joinedDate TEXT,
    feePaid BOOLEAN DEFAULT FALSE,
    svanidhiTier TEXT DEFAULT 'Pending Approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Violations Table
CREATE TABLE IF NOT EXISTS public.violations (
    id TEXT PRIMARY KEY,
    vendor_id TEXT,
    violation_type TEXT NOT NULL,
    location TEXT NOT NULL,
    inspector TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - Allow Public Read/Write
-- ========================================================

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Vendors" ON public.vendors;
CREATE POLICY "Public Read/Write Vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Alerts" ON public.alerts;
CREATE POLICY "Public Read/Write Alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read/Write Violations" ON public.violations;
CREATE POLICY "Public Read/Write Violations" ON public.violations FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- SEED INITIAL VENDORS DATA
-- ========================================================

INSERT INTO public.vendors (id, name, stallName, category, location, phone, status, lat, lng, joinedDate, feePaid, svanidhiTier)
VALUES 
('VV-2024-001', 'Ramesh Kumar', 'Ramesh Fresh Fruits', 'Perishable Produce', 'Zone A - Market Sq', '+91 98234 11290', 'approved', 21.1275, 79.0530, '12 Jan 2024', true, 'Tier 2 Approved'),
('VV-2024-042', 'Sunita Sharma', 'Sunita Fast Food & Snacks', 'Prepared Food', 'Zone B - VNIT Gate', '+91 97123 88401', 'approved', 21.1220, 79.0480, '18 Feb 2024', true, 'Tier 1 Approved'),
('VV-2024-089', 'Anil Patil', 'Nagpur Handloom Corner', 'Textiles & Goods', 'Zone C - Metro Corridor', '+91 94210 55920', 'pending', 21.1310, 79.0580, '02 Aug 2024', false, 'Pending'),
('VV-2024-115', 'Mohd Imran', 'Imran Tea & Refreshments', 'Beverages', 'Zone A - Station Rd', '+91 99812 33491', 'pending', 21.1180, 79.0520, '10 Aug 2024', false, 'Tier 1 Pending')
ON CONFLICT (id) DO NOTHING;
