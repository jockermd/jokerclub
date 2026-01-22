
-- Create a table to hold the settings for the consulting sidebar card
CREATE TABLE public.consulting_card_settings (
  id INT PRIMARY KEY DEFAULT 1,
  consultant_name TEXT,
  consultant_title TEXT,
  consultant_avatar_url TEXT,
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  custom_badge_text TEXT,
  skills TEXT[],
  availability_text TEXT,
  button_text TEXT,
  button_link TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Comments for clarity
COMMENT ON TABLE public.consulting_card_settings IS 'Stores the configuration for the dynamic consulting card in the sidebar.';
COMMENT ON COLUMN public.consulting_card_settings.id IS 'Singleton ID to ensure only one row of settings exists.';

-- Seed the table with some default data to prevent errors on the first render
INSERT INTO public.consulting_card_settings (id, consultant_name, consultant_title, consultant_avatar_url, rating, custom_badge_text, skills, availability_text, button_text, button_link)
VALUES (1, 'Nome do Consultor', 'Especialista em Projetos', 'public/placeholder.svg', 4.5, 'POPULAR', ARRAY['React', 'Node.js', 'UI/UX'], 'Disponível para novos projetos', 'Agende uma Chamada', '#');

-- Enable Row Level Security
ALTER TABLE public.consulting_card_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the settings, as the card is public
CREATE POLICY "Allow public read access to consulting card settings"
ON public.consulting_card_settings
FOR SELECT
USING (true);

-- Allow only users with the 'admin' role to make changes
CREATE POLICY "Allow admin write access to consulting card settings"
ON public.consulting_card_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

