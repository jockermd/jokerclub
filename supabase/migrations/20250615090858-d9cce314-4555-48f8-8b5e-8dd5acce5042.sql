
-- Adiciona a nova coluna JSONB para armazenar os detalhes do badge
ALTER TABLE public.profiles ADD COLUMN badge_details JSONB;

-- Migra os badges existentes para a nova estrutura.
-- Esta é uma migração simples que assume o texto do badge antigo como texto principal
-- e atribui uma cor e um ícone padrão.
UPDATE public.profiles
SET badge_details = jsonb_build_object(
    'text', custom_badge,
    'color', 'secondary',
    'icon', 'Star'
)
WHERE custom_badge IS NOT NULL;

-- Agora que os dados foram migrados, remove a coluna antiga
ALTER TABLE public.profiles DROP COLUMN custom_badge;

-- Adiciona um comentário à nova coluna para clareza
COMMENT ON COLUMN public.profiles.badge_details IS 'Armazena detalhes do badge personalizado como texto, cor e ícone em um objeto JSON.';
