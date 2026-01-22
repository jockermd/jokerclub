
-- Create retweets table
CREATE TABLE public.retweets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  tweet_id uuid NOT NULL REFERENCES public.tweets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(tweet_id, user_id)
);

-- Add unique constraint to likes table
ALTER TABLE public.likes ADD CONSTRAINT likes_tweet_id_user_id_key UNIQUE (tweet_id, user_id);

-- Enable RLS and add policies for retweets
ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to view retweets"
  ON public.retweets FOR SELECT USING (true);

CREATE POLICY "Allow users to create their own retweets"
  ON public.retweets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own retweets"
  ON public.retweets FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS and add policies for likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to view likes"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Allow users to create their own likes"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS and add policies for replies
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to view replies"
  ON public.replies FOR SELECT USING (true);

CREATE POLICY "Allow users to create their own replies"
  ON public.replies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own replies"
  ON public.replies FOR DELETE USING (auth.uid() = user_id);
