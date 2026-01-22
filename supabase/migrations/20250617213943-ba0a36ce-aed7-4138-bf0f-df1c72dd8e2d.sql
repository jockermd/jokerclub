
-- Verificar se os triggers existem e recriá-los com as funções corretas
-- Primeiro, remover triggers existentes para garantir limpeza
DROP TRIGGER IF EXISTS on_new_like ON public.likes;
DROP TRIGGER IF EXISTS on_new_retweet ON public.retweets;
DROP TRIGGER IF EXISTS on_new_reply ON public.replies;
DROP TRIGGER IF EXISTS on_new_follow ON public.followers;

-- Recriar as funções de notificação com lógica completa e logs
CREATE OR REPLACE FUNCTION public.handle_new_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  RAISE LOG 'Trigger de like executado - tweet_id: %, user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Buscar o dono do tweet
  SELECT user_id INTO tweet_owner_id 
  FROM public.tweets 
  WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;

  -- Não criar notificação se o usuário curtiu o próprio tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de like para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'like');
    
    RAISE LOG 'Notificação de like criada com sucesso';
  ELSE
    RAISE LOG 'Like próprio ignorado - não criando notificação';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_retweet_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  RAISE LOG 'Trigger de retweet executado - tweet_id: %, user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Buscar o dono do tweet
  SELECT user_id INTO tweet_owner_id 
  FROM public.tweets 
  WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;
  
  -- Não criar notificação se o usuário retweetou o próprio tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de retweet para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'retweet');
    
    RAISE LOG 'Notificação de retweet criada com sucesso';
  ELSE
    RAISE LOG 'Retweet próprio ignorado - não criando notificação';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tweet_owner_id uuid;
BEGIN
  RAISE LOG 'Trigger de reply executado - tweet_id: %, user_id: %', NEW.tweet_id, NEW.user_id;
  
  -- Buscar o dono do tweet
  SELECT user_id INTO tweet_owner_id 
  FROM public.tweets 
  WHERE id = NEW.tweet_id;
  
  RAISE LOG 'Dono do tweet encontrado: %', tweet_owner_id;
  
  -- Não criar notificação se o usuário respondeu ao próprio tweet
  IF NEW.user_id <> tweet_owner_id THEN
    RAISE LOG 'Criando notificação de reply para user_id: %', tweet_owner_id;
    
    INSERT INTO public.notifications (user_id, actor_id, tweet_id, type)
    VALUES (tweet_owner_id, NEW.user_id, NEW.tweet_id, 'reply');
    
    RAISE LOG 'Notificação de reply criada com sucesso';
  ELSE
    RAISE LOG 'Reply próprio ignorado - não criando notificação';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE LOG 'Trigger de follow executado - follower_id: %, followed_id: %', NEW.follower_id, NEW.followed_id;
  
  -- Criar notificação para o usuário que foi seguido
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.followed_id, NEW.follower_id, 'follow');
  
  RAISE LOG 'Notificação de follow criada com sucesso';
  
  RETURN NEW;
END;
$$;

-- Recriar os triggers
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

-- Garantir que a política RLS permite inserções do sistema
DROP POLICY IF EXISTS "Allow system to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow system functions to insert notifications" ON public.notifications;

CREATE POLICY "Allow system to insert notifications"
  ON public.notifications FOR INSERT
  TO public
  WITH CHECK (true);

-- Garantir realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Adicionar à publicação realtime se ainda não estiver
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Tabela notifications já está na publicação realtime';
  END;
END $$;
