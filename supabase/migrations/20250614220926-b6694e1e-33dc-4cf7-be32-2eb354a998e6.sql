
-- Enable Row Level Security on the followers table
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to see who follows whom
CREATE POLICY "Allow public read access to follower relationships"
  ON public.followers FOR SELECT USING (true);

-- Policy to allow authenticated users to follow other users (but not themselves)
CREATE POLICY "Allow authenticated users to follow others"
  ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id AND auth.uid() <> followed_id);

-- Policy to allow authenticated users to unfollow others
CREATE POLICY "Allow authenticated users to unfollow"
  ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- This function creates a notification when a user gets a new follower
CREATE OR REPLACE FUNCTION public.handle_new_follow_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create a notification for the user who was followed
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.followed_id, NEW.follower_id, 'follow');
  
  RETURN NEW;
END;
$function$
;

-- This trigger executes the function after a new follow relationship is created
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.followers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_follow_notification();

-- Fix/Add RLS policies for the notifications table for security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop any potentially insecure, pre-existing SELECT policy
DROP POLICY IF EXISTS "Allow anyone to view notifications" ON public.notifications;

-- Policy to ensure users can only see their own notifications
CREATE POLICY "Allow users to read their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Allow users to update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
