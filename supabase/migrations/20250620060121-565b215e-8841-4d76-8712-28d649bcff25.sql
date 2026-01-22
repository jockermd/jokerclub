
-- Adicionar coluna links na tabela codeblocks
ALTER TABLE public.codeblocks 
ADD COLUMN links TEXT[] DEFAULT NULL;

-- Criar bucket para arquivos dos codeblocks
INSERT INTO storage.buckets (id, name, public)
VALUES ('codeblock-files', 'codeblock-files', true);

-- Criar política para permitir upload de arquivos dos codeblocks
CREATE POLICY "Allow authenticated users to upload codeblock files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'codeblock-files' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir visualização de arquivos dos codeblocks
CREATE POLICY "Allow public read access to codeblock files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'codeblock-files');

-- Criar política para permitir atualização de arquivos próprios
CREATE POLICY "Allow users to update their own codeblock files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'codeblock-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Criar política para permitir deletar arquivos próprios
CREATE POLICY "Allow users to delete their own codeblock files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'codeblock-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
