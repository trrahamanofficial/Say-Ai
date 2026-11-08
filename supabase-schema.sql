-- ==========================================================
-- SAY AI DATABASE SCHEMA FOR SUPABASE (PostgreSQL)
-- Complete schema with Row Level Security (RLS) & Seed Data
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'SAY AI User',
  plan TEXT NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  chat_used INTEGER DEFAULT 46,
  chat_limit INTEGER DEFAULT 50,
  images_used INTEGER DEFAULT 15,
  images_limit INTEGER DEFAULT 20,
  voice_used INTEGER DEFAULT 18,
  voice_limit INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.users_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  last_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat sessions"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 3. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in their sessions"
  ON public.chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.session_id AND user_id = auth.uid()
    )
  );

-- 4. Generated Images Table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Fantasy',
  image_url TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  dimensions TEXT DEFAULT '1024x1024',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public generated images"
  ON public.generated_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create and delete their own generated images"
  ON public.generated_images FOR ALL
  USING (auth.uid() = user_id);

-- 5. AI Providers Table (Admin Managed)
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  model TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  ping_ms INTEGER DEFAULT 45,
  status TEXT DEFAULT 'connected',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read enabled providers"
  ON public.ai_providers FOR SELECT
  TO authenticated
  USING (is_enabled = true);

-- 6. Trigger to create profile upon new auth.user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'SAY AI User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial default providers
INSERT INTO public.ai_providers (name, type, base_url, model, is_enabled, is_default, status, ping_ms)
VALUES
  ('Google Gemini Flash', 'gemini', 'https://generativelanguage.googleapis.com', 'gemini-3.8-flash', true, true, 'connected', 28),
  ('Cloudflare Workers AI', 'cloudflare', 'https://api.cloudflare.com/client/v4', '@cf/meta/llama-3.3-70b-instruct', true, false, 'connected', 42),
  ('OpenAI GPT-4o', 'openai', 'https://api.openai.com/v1', 'gpt-4o', false, false, 'disconnected', 0)
ON CONFLICT DO NOTHING;
