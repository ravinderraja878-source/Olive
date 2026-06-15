-- Olive Prayer House Database Initialization SQL
-- Run this script in the Supabase SQL Editor to set up your tables and security policies.

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Weekly Programs Table
CREATE TABLE IF NOT EXISTS public.weekly_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery Media Table (Images and Videos)
CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. Enable Row-Level Security (RLS)
-- ==========================================

ALTER TABLE public.weekly_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Row-Level Security Policies
-- ==========================================

-- --- Policies for weekly_programs ---

-- Allow everyone (anonymous public) to read weekly programs
CREATE POLICY "Allow public read access to weekly_programs" 
ON public.weekly_programs 
FOR SELECT 
TO public 
USING (true);

-- Allow authenticated admin users full access to weekly_programs
CREATE POLICY "Allow authenticated users full access to weekly_programs" 
ON public.weekly_programs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- Policies for gallery_media ---

-- Allow everyone (anonymous public) to view gallery media
CREATE POLICY "Allow public read access to gallery_media" 
ON public.gallery_media 
FOR SELECT 
TO public 
USING (true);

-- Allow authenticated admin users full access to gallery_media
CREATE POLICY "Allow authenticated users full access to gallery_media" 
ON public.gallery_media 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- --- Policies for contact_messages ---

-- Allow everyone (anonymous public) to submit contact messages
CREATE POLICY "Allow public insert access to contact_messages" 
ON public.contact_messages 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow authenticated admin users full access to contact_messages
CREATE POLICY "Allow authenticated users full access to contact_messages" 
ON public.contact_messages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
