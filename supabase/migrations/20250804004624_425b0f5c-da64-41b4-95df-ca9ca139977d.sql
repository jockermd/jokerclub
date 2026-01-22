
-- Adicionar coluna is_pinned na tabela products
ALTER TABLE public.products 
ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhorar performance nas consultas ordenadas
CREATE INDEX idx_products_pinned_created_at ON public.products (is_pinned DESC, created_at DESC);
