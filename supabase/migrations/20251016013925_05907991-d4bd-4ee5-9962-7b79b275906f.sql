-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  university TEXT NOT NULL,
  country TEXT,
  degree_type TEXT, -- masters, phd
  description TEXT,
  research_areas TEXT[],
  professors TEXT[],
  ranking INTEGER,
  tuition_range TEXT,
  tags TEXT[],
  source_links TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Programs are viewable by everyone (public data)
CREATE POLICY "Anyone can view programs"
  ON public.programs FOR SELECT
  USING (true);

-- Create saved_programs table (user saves)
CREATE TABLE public.saved_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Enable RLS on saved_programs
ALTER TABLE public.saved_programs ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved programs
CREATE POLICY "Users can view their own saved programs"
  ON public.saved_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved programs"
  ON public.saved_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved programs"
  ON public.saved_programs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved programs"
  ON public.saved_programs FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();