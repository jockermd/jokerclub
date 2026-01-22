
-- Atualizar URLs padrão para usuários existentes sem foto
UPDATE public.profiles 
SET avatar_url = 'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/657399ce-421c-46b1-9c9c-9c28253e59b6/avatar-1751631720285.jpg'
WHERE avatar_url = 'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/avatar-1749985269137.png'
   OR avatar_url IS NULL;

UPDATE public.profiles 
SET cover_photo_url = 'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/657399ce-421c-46b1-9c9c-9c28253e59b6/cover-1751631637769.png'  
WHERE cover_photo_url = 'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/cover-1749985438249.png'
   OR cover_photo_url IS NULL;

-- Atualizar a função para novos usuários com as novas URLs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username text;
    unique_username text;
BEGIN
    -- Extrair username base dos metadados ou do email
    base_username := COALESCE(
        new.raw_user_meta_data->>'user_name',
        LOWER(SPLIT_PART(new.email, '@', 1))
    );
    
    -- Gerar username único
    unique_username := public.generate_unique_username(base_username);
    
    -- Inserir o perfil com username único e novas URLs padrão
    INSERT INTO public.profiles (
        id, 
        username, 
        full_name, 
        avatar_url, 
        cover_photo_url, 
        badge_details
    )
    VALUES (
        new.id,
        unique_username,
        new.raw_user_meta_data->>'full_name',
        'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/657399ce-421c-46b1-9c9c-9c28253e59b6/avatar-1751631720285.jpg',
        'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/657399ce-421c-46b1-9c9c-9c28253e59b6/cover-1751631637769.png',
        '{"icon": "Flame", "text": "New Joker", "color": "green"}'::jsonb
    );
    
    return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
