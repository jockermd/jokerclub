
-- Criar tabela para permissões de acesso a codeblocks borrados
CREATE TABLE public.codeblock_access_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codeblock_id UUID NOT NULL REFERENCES public.codeblocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(codeblock_id, user_id)
);

-- Habilitar RLS na tabela
ALTER TABLE public.codeblock_access_permissions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias permissões
CREATE POLICY "Users can view their own permissions" 
  ON public.codeblock_access_permissions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política: Admins podem ver todas as permissões
CREATE POLICY "Admins can view all permissions" 
  ON public.codeblock_access_permissions 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Política: Donos de codeblocks podem ver permissões dos seus codeblocks
CREATE POLICY "Codeblock owners can view permissions" 
  ON public.codeblock_access_permissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.codeblocks 
      WHERE id = codeblock_id AND created_by = auth.uid()
    )
  );

-- Política: Apenas admins podem inserir permissões
CREATE POLICY "Only admins can grant permissions" 
  ON public.codeblock_access_permissions 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política: Apenas admins podem deletar permissões
CREATE POLICY "Only admins can revoke permissions" 
  ON public.codeblock_access_permissions 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Comentário para clareza
COMMENT ON TABLE public.codeblock_access_permissions IS 'Tabela para gerenciar permissões de acesso específicas para codeblocks borrados';
