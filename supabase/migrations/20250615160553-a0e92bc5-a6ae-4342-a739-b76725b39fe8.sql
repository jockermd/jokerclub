
-- Cria a tabela para armazenar os codeblocks
CREATE TABLE public.codeblocks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    language TEXT,
    category TEXT,
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona comentários para clareza
COMMENT ON TABLE public.codeblocks IS 'Armazena snippets de código, prompts e outros blocos de texto.';
COMMENT ON COLUMN public.codeblocks.language IS 'Ex: javascript, python, sql, etc.';
COMMENT ON COLUMN public.codeblocks.category IS 'Ex: Code, Prompt, Snippet, etc.';

-- Função para atualizar o timestamp 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION public.handle_codeblock_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função em cada atualização
CREATE TRIGGER on_codeblock_update
BEFORE UPDATE ON public.codeblocks
FOR EACH ROW
EXECUTE FUNCTION public.handle_codeblock_update();

-- Habilita a Segurança a Nível de Linha (RLS)
ALTER TABLE public.codeblocks ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (RLS Policies)

-- 1. Admins têm acesso total
CREATE POLICY "Allow admin full access"
ON public.codeblocks
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Usuários podem ver todos os codeblocks públicos
CREATE POLICY "Allow public read access to public codeblocks"
ON public.codeblocks
FOR SELECT
USING (is_public = true);

-- 3. Usuários podem ver seus próprios codeblocks privados
CREATE POLICY "Allow individual read access to own codeblocks"
ON public.codeblocks
FOR SELECT
USING (auth.uid() = created_by);

-- 4. Usuários logados podem criar codeblocks
CREATE POLICY "Allow authenticated users to insert"
ON public.codeblocks
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- 5. Usuários podem atualizar seus próprios codeblocks
CREATE POLICY "Allow individual update access"
ON public.codeblocks
FOR UPDATE
USING (auth.uid() = created_by);

-- 6. Usuários podem deletar seus próprios codeblocks
CREATE POLICY "Allow individual delete access"
ON public.codeblocks
FOR DELETE
USING (auth.uid() = created_by);
