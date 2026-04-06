-- Supabase SQL schema for Zorvyn Finance Dashboard

CREATE TABLE IF NOT EXISTS public.users (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  password    text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'owner', 'viewer', 'analyst')),
  status      text NOT NULL CHECK (status IN ('active', 'inactive')),
  phone       text,
  company     text,
  address     text,
  department  text,
  join_date   date NOT NULL
);

CREATE TABLE IF NOT EXISTS public.records (
  id          text PRIMARY KEY,
  amount      numeric NOT NULL,
  type        text NOT NULL CHECK (type IN ('income', 'expense')),
  category    text NOT NULL,
  date        timestamptz NOT NULL,
  notes       text,
  created_by  text NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Optional: persist tokens (not required — tokens are stateless base64 in this app)
CREATE TABLE IF NOT EXISTS public.tokens (
  token       text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_records_type     ON public.records(type);
CREATE INDEX IF NOT EXISTS idx_records_category ON public.records(category);
CREATE INDEX IF NOT EXISTS idx_records_date     ON public.records(date);
CREATE INDEX IF NOT EXISTS idx_users_role       ON public.users(role);

-- Seed users (passwords are plaintext — for dev/demo only)
INSERT INTO public.users (id, name, email, password, role, status, phone, company, address, department, join_date)
VALUES
  ('admin-001',  'System Administrator', 'admin@zorvyn.com',  'admin123',  'admin',  'active', '+1-555-0101', 'Zorvyn Finance Corp',  '123 Admin Street, Tech City, TC 12345',    'IT Administration',    '2024-01-01'),
  ('owner-001',  'Business Owner',       'owner@zorvyn.com',  'owner123',  'owner',  'active', '+1-555-0102', 'Zorvyn Enterprises',   '456 Owner Avenue, Business City, BC 67890', 'Executive Management', '2024-01-15'),
  ('viewer-001', 'Data Viewer',          'viewer@zorvyn.com', 'viewer123', 'viewer', 'active', '+1-555-0103', 'Zorvyn Analytics',     '789 Viewer Blvd, Data City, DC 54321',      'Data Analysis',        '2024-02-01')
ON CONFLICT (id) DO NOTHING;
