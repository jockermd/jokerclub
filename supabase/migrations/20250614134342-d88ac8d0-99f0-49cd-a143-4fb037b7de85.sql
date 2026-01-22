
-- Adiciona a coluna para a foto de capa na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN cover_photo_url TEXT;

-- Cria um bucket no Storage para as mídias de perfil (avatar e capa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-media', 'profile-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']);

-- Define as políticas de segurança para o bucket de mídias de perfil

-- Permite que qualquer pessoa veja as imagens (leitura pública)
CREATE POLICY "Public read access for profile media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-media' );

-- Permite que usuários autenticados enviem suas próprias imagens
-- A política verifica se o ID do usuário na pasta corresponde ao ID do usuário autenticado
CREATE POLICY "Users can upload their own profile media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'profile-media' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Permite que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own profile media"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'profile-media' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Permite que usuários apaguem suas próprias imagens
CREATE POLICY "Users can delete their own profile media"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'profile-media' AND auth.uid() = (storage.foldername(name))[1]::uuid );
