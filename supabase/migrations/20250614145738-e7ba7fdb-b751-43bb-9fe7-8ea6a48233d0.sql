
-- 1. Criar um tipo ENUM para as roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar a tabela para associar roles aos usuários
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Adicionar coluna de verificação na tabela de perfis
-- Definimos o padrão como FALSE para que os usuários existentes não sejam verificados
ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Adicionar coluna de post fixado na tabela de tweets
-- Definimos o padrão como FALSE para que os tweets existentes não sejam fixados
ALTER TABLE public.tweets ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Criar uma função para checar a role do usuário de forma segura
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 6. Habilitar Row Level Security (RLS) e criar políticas

-- Políticas para a tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Políticas para a tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para a tabela tweets
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tweets are public" ON public.tweets FOR SELECT USING (true);
CREATE POLICY "Users can create their own tweets" ON public.tweets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tweets" ON public.tweets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage any tweet" ON public.tweets FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Atribuir a role de 'admin' ao usuário especificado
-- Isso será executado de forma segura, sem gerar erro se o usuário já for admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'jokers.producer@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
