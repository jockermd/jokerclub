
-- Remove a verificação de limite de caracteres antiga da tabela de tweets
ALTER TABLE public.tweets DROP CONSTRAINT IF EXISTS tweets_content_check;

-- Adiciona uma nova verificação para garantir que o conteúdo do tweet não exceda 1200 caracteres
ALTER TABLE public.tweets ADD CONSTRAINT tweets_content_check CHECK (char_length(content) <= 1200);
