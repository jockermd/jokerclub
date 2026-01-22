
-- Criar função para gerar username único com numeração sequencial
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_username text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    username_candidate text;
    counter integer := 1;
BEGIN
    -- Primeiro tenta o username base
    username_candidate := base_username;
    
    -- Se não existir, retorna o username base
    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE username = username_candidate) THEN
        RETURN username_candidate;
    END IF;
    
    -- Se existir, adiciona números sequenciais até encontrar um disponível
    LOOP
        username_candidate := base_username || LPAD(counter::text, 2, '0');
        
        -- Verifica se este username está disponível
        IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE username = username_candidate) THEN
            RETURN username_candidate;
        END IF;
        
        counter := counter + 1;
        
        -- Proteção contra loop infinito (máximo 999 usuários com mesmo base)
        IF counter > 999 THEN
            -- Fallback: adiciona timestamp para garantir unicidade
            RETURN base_username || '_' || EXTRACT(EPOCH FROM NOW())::bigint::text;
        END IF;
    END LOOP;
END;
$$;

-- Atualizar a função handle_new_user para usar o gerador de username único
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
    
    -- Inserir o perfil com username único
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
        'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/avatar-1749985269137.png',
        'https://fafywhojwgfajsssvkux.supabase.co/storage/v1/object/public/profile-media/e1151c86-dd5a-481f-bac3-99790403835e/cover-1749985438249.png',
        '{"icon": "Flame", "text": "New Joker", "color": "green"}'::jsonb
    );
    
    return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
