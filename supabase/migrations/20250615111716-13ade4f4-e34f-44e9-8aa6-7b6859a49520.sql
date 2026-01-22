
-- Atualiza a função para definir valores padrão para avatar, capa e badge de novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, cover_photo_url, badge_details)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'full_name',
    'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/avatar-1749985269137.png',
    'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/cover-1749985438249.png',
    '{"icon": "Flame", "text": "New Joker", "color": "green"}'::jsonb
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
