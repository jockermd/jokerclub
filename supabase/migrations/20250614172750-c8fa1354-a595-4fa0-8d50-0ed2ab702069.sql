
-- Create a table for products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents (e.g., 5000 for R$50.00)
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to products
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
USING (true);

-- Create a table for orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Price in cents
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., pending, paid, failed
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own orders
CREATE POLICY "Users can select their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy to allow users to create their own orders
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert sample product data
INSERT INTO public.products (name, description, price, image_url)
VALUES
('SHEEPBRO INJECT', 'Este é um produto incrível que vai revolucionar sua vida. Compre agora e sinta a diferença.', 5000, 'https://jojocards.com.br/wp-content/uploads/2023/11/injet-sheep-min.png'),
('Joker Serum', 'Uma fórmula especial para um sorriso permanente. Use com cautela.', 9999, 'https://m.media-amazon.com/images/I/71i8t52u8vL._AC_UF1000,1000_QL80_.jpg'),
('Laughing Gas', 'Gás do riso de alta qualidade para festas e eventos. Não nos responsabilizamos por efeitos colaterais.', 2500, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0e_g5-dJvG0P5u7Y4x3Z7lW2y6r7e0K9Xw&s');

