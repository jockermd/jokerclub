
-- Adicionar coluna is_blurred na tabela codeblocks
ALTER TABLE public.codeblocks 
ADD COLUMN is_blurred BOOLEAN NOT NULL DEFAULT false;

-- Adicionar comentário para clareza
COMMENT ON COLUMN public.codeblocks.is_blurred IS 'Quando true, o conteúdo é exibido borrado para todos os usuários, mesmo sendo público';
