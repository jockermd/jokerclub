
-- Primeiro, vamos dropar e recriar as funções com logs de debug e lógica melhorada

-- 1. Função para notificações de curtidas
CREATE OR REPLACE FUNCTION public.handle_new_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  RAISE LOG 'Trigger de like executado para tweet_id: % user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;

  -- Don't create a notification if the user likes their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de like para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'like');
    
    RAISE LOG 'Notificação de like criada com sucesso';
  ELSE
    RAISE LOG 'Like próprio ignorado';
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
  RAISE LOG 'Trigger de retweet executado para tweet_id: % user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;
  
  -- Don't create a notification if the user retweets their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de retweet para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'retweet');
    
    RAISE LOG 'Notificação de retweet criada com sucesso';
  ELSE
    RAISE LOG 'Retweet próprio ignorado';
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
  RAISE LOG 'Trigger de reply executado para tweet_id: % user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Get the owner of the tweet
  SELECT user_id INTO tweet_owner_id FROM public.tweets WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;
  
  -- Don't create a notification if the user replies to their own tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de reply para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'reply');
    
    RAISE LOG 'Notificação de reply criada com sucesso';
  ELSE
    RAISE LOG 'Reply próprio ignorado';
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
  RAISE LOG 'Trigger de follow executado - follower_id: % followed_id: %', NEW.follower_id, NEW.followed_id;
  
  -- Create a notification for the user who was followed
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.followed_id, NEW.follower_id, 'follow');
  
  RAISE LOG 'Notificação de follow criada com sucesso';
  
  RETURN NEW;
END;
$$;

-- 5. Garantir que os triggers estão ativos
DROP TRIGGER IF EXISTS on_new_like ON public.likes;
DROP TRIGGER IF EXISTS on_new_retweet ON public.retweets;
DROP TRIGGER IF EXISTS on_new_reply ON public.replies;
DROP TRIGGER IF EXISTS on_new_follow ON public.followers;

CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_like_notification();

CREATE TRIGGER on_new_retweet
  AFTER INSERT ON public.retweets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_retweet_notification();

CREATE TRIGGER on_new_reply
  AFTER INSERT ON public.replies
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_reply_notification();

CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_follow_notification();

-- 6. Criar uma política RLS mais específica para permitir inserções do sistema
DROP POLICY IF EXISTS "Allow system functions to insert notifications" ON public.notifications;

CREATE POLICY "Allow system to insert notifications"
  ON public.notifications FOR INSERT
  TO public
  WITH CHECK (true);

-- 7. Garantir que a tabela está configurada para realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 8. Adicionar à publicação realtime (pode dar erro se já estiver adicionada, mas não é problema)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Tabela notifications já está na publicação realtime';
  END;
END $$;
