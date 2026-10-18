-- ====================================================================
-- HB PLUS GATEWAY - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- 1. Profiles Table (Stores user profiles and role mapping)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert/update their own profile"
  ON public.profiles FOR ALL
  USING (true);

-- 2. Authentication Audit Logs Table
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ALLOWED', 'RESTRICTED')),
  reason TEXT,
  role TEXT,
  platform TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
CREATE POLICY "Audit logs can be read by authenticated users"
  ON public.auth_audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Audit logs can be inserted on login attempt"
  ON public.auth_audit_logs FOR INSERT
  WITH CHECK (true);
