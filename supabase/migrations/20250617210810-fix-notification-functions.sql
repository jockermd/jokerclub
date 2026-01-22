
-- Atualizar as funções de notificação para garantir funcionamento correto

-- 1. Função para notificações de curtidas
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

-- 2. Função para notificações de retweets
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

-- 3. Função para notificações de respostas
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

-- 4. Função para notificações de novos seguidores
CREATE OR REPLACE FUNCTION public.handle_new_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a notification for the user who was followed
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.followed_id, NEW.follower_id, 'follow');
  
  RETURN NEW;
END;
$$;
