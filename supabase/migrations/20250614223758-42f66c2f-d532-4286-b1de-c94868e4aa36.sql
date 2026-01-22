
-- Add consulting-related fields to the profiles table
ALTER TABLE public.profiles
ADD COLUMN is_consultant BOOLEAN DEFAULT false,
ADD COLUMN consultant_title TEXT,
ADD COLUMN consultant_bio TEXT,
ADD COLUMN hourly_rate INTEGER, -- Price in cents
ADD COLUMN availability_schedule JSONB;

-- Create a table for consultant skills
CREATE TABLE public.consultant_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(consultant_id, skill)
);

-- RLS for consultant_skills
ALTER TABLE public.consultant_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read skills" ON public.consultant_skills FOR SELECT USING (true);
CREATE POLICY "Consultants can manage their own skills" ON public.consultant_skills FOR ALL USING (auth.uid() = consultant_id) WITH CHECK (auth.uid() = consultant_id);

-- Create a table for consulting sessions
CREATE TABLE public.consulting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  meeting_link TEXT,
  client_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for consulting_sessions
ALTER TABLE public.consulting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view their sessions" ON public.consulting_sessions FOR SELECT USING (auth.uid() = consultant_id OR auth.uid() = client_id);
CREATE POLICY "Clients can create sessions" ON public.consulting_sessions FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update their sessions" ON public.consulting_sessions FOR UPDATE USING (auth.uid() = consultant_id OR auth.uid() = client_id) WITH CHECK (auth.uid() = consultant_id OR auth.uid() = client_id);


-- Create a table for consultant reviews
CREATE TABLE public.consultant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.consulting_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id) -- Only one review per session
);

-- RLS for consultant_reviews
ALTER TABLE public.consultant_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON public.consultant_reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can manage their own reviews" ON public.consultant_reviews FOR ALL USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
