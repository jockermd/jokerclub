
-- 1. Create an enum type for notification types
CREATE TYPE public.notification_type AS ENUM ('like', 'retweet', 'reply', 'follow');

-- 2. Create the notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- The user who receives the notification
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- The user who performed the action
  tweet_id uuid REFERENCES public.tweets(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX ON public.notifications (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- Users can update the is_read status of their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create a function to handle new "like" notifications
CREATE OR REPLACE FUNCTION public.handle_new_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;

  -- Don't create a notification if the user likes their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'like');
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Create a trigger to call the function when a new like is inserted
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_like_notification();

-- 7. Create a function to handle new "retweet" notifications
CREATE OR REPLACE FUNCTION public.handle_new_retweet_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;
  
  -- Don't create a notification if the user retweets their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'retweet');
  END IF;

  RETURN NEW;
END;
$$;

-- 8. Create a trigger to call the function when a new retweet is inserted
CREATE TRIGGER on_new_retweet
  AFTER INSERT ON public.retweets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_retweet_notification();

-- 9. Create a function to handle new "reply" notifications
CREATE OR REPLACE FUNCTION public.handle_new_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;
  
  -- Don't create a notification if the user replies to their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'reply');
  END IF;

  RETURN NEW;
END;
$$;

-- 10. Create a trigger to call the function when a new reply is inserted
CREATE TRIGGER on_new_reply
  AFTER INSERT ON public.replies
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_reply_notification();

-- 11. Set replica identity for the new table for realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
