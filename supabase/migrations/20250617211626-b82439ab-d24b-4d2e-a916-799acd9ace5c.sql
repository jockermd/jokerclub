
-- Adicionar política RLS para permitir que as funções do sistema insiram notificações
-- Esta política permite inserções quando a função está executando com SECURITY DEFINER
CREATE POLICY "Allow system functions to insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Adicionar a tabela notifications à publicação realtime para atualizações em tempo real
ALTER publication supabase_realtime ADD TABLE public.notifications;
