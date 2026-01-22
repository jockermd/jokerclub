
-- Security Cleanup: This migration drops all existing, potentially conflicting RLS policies
-- on core tables and recreates a single, consolidated, and secure set of policies.

-- To avoid errors, we drop all policies first before recreating them.
-- The policy names are fetched from the existing migration files.

-- ========= Drop Existing Policies =========

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Tweets
DROP POLICY IF EXISTS "Tweets are viewable by authenticated users." ON public.tweets;
DROP POLICY IF EXISTS "Users can create their own tweets." ON public.tweets;
DROP POLICY IF EXISTS "Users can update their own tweets." ON public.tweets;
DROP POLICY IF EXISTS "Users can delete their own tweets." ON public.tweets;
DROP POLICY IF EXISTS "Tweets are public" ON public.tweets;
DROP POLICY IF EXISTS "Admins can manage any tweet" ON public.tweets;

-- Likes
DROP POLICY IF EXISTS "Likes are viewable by authenticated users." ON public.likes;
DROP POLICY IF EXISTS "Users can insert their own likes." ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes." ON public.likes;
DROP POLICY IF EXISTS "Allow anyone to view likes" ON public.likes;
DROP POLICY IF EXISTS "Allow users to create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.likes;

-- Followers
DROP POLICY IF EXISTS "Follow relationships are viewable by authenticated users." ON public.followers;
DROP POLICY IF EXISTS "Users can follow other users." ON public.followers;
DROP POLICY IF EXISTS "Users can unfollow other users." ON public.followers;
DROP POLICY IF EXISTS "Allow public read access to follower relationships" ON public.followers;
DROP POLICY IF EXISTS "Allow authenticated users to follow others" ON public.followers;
DROP POLICY IF EXISTS "Allow authenticated users to unfollow" ON public.followers;

-- Replies
DROP POLICY IF EXISTS "Replies are viewable by authenticated users." ON public.replies;
DROP POLICY IF EXISTS "Users can create their own replies." ON public.replies;
DROP POLICY IF EXISTS "Users can update their own replies." ON public.replies;
DROP POLICY IF EXISTS "Users can delete their own replies." ON public.replies;
DROP POLICY IF EXISTS "Allow anyone to view replies" ON public.replies;

-- Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anyone to view notifications" ON public.notifications;

-- ========= Create Consolidated Policies =========

-- --- Profiles Table ---
CREATE POLICY "Profiles are publicly viewable." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile, and admins can update any." ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- --- Tweets Table ---
CREATE POLICY "Tweets are publicly viewable." ON public.tweets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tweets." ON public.tweets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tweets, and admins can update any." ON public.tweets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own tweets, and admins can delete any." ON public.tweets
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- --- Likes Table ---
CREATE POLICY "Likes are publicly viewable." ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts." ON public.likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes." ON public.likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- --- Followers Table ---
CREATE POLICY "Follower relationships are publicly viewable." ON public.followers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow other users." ON public.followers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id AND auth.uid() <> followed_id);

CREATE POLICY "Authenticated users can unfollow users." ON public.followers
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);


-- --- Replies Table ---
CREATE POLICY "Replies are publicly viewable." ON public.replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies." ON public.replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies." ON public.replies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies." ON public.replies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- --- Notifications Table ---
CREATE POLICY "Users can read their own notifications." ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications." ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications." ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- --- Consulting Sessions Table ---
-- The existing policies are good, just adding a DELETE policy.
CREATE POLICY "Participants can delete their sessions." ON public.consulting_sessions
  FOR DELETE USING (auth.uid() = consultant_id OR auth.uid() = client_id);
