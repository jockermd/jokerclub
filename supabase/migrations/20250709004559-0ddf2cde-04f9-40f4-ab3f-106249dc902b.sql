
-- Adicionar coluna is_available na tabela products
ALTER TABLE public.products 
ADD COLUMN is_available boolean NOT NULL DEFAULT true;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.products.is_available IS 'Indica se o produto está disponível para compra';
