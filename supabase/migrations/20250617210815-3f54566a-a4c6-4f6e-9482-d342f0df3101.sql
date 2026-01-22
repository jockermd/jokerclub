
-- Primeiro, remover os triggers existentes (caso existam)
DROP TRIGGER IF EXISTS on_new_like ON public.likes;
DROP TRIGGER IF EXISTS on_new_retweet ON public.retweets;
DROP TRIGGER IF EXISTS on_new_reply ON public.replies;
DROP TRIGGER IF EXISTS on_new_follow ON public.followers;

-- Agora recriar os triggers para o sistema de notificações

-- 1. Trigger para notificações de curtidas
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_like_notification();

-- 2. Trigger para notificações de retweets  
CREATE TRIGGER on_new_retweet
  AFTER INSERT ON public.retweets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_retweet_notification();

-- 3. Trigger para notificações de respostas
CREATE TRIGGER on_new_reply
  AFTER INSERT ON public.replies
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_reply_notification();

-- 4. Trigger para notificações de novos seguidores
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_follow_notification();

-- 5. Garantir que a tabela notifications está na publicação realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
