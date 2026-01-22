
-- Enable Row Level Security on codeblocks table
ALTER TABLE public.codeblocks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view public codeblocks
CREATE POLICY "Anyone can view public codeblocks" 
ON public.codeblocks
FOR SELECT 
USING (is_public = true);

-- Policy 2: Users can view their own codeblocks (both public and private)
CREATE POLICY "Users can view own codeblocks" 
ON public.codeblocks
FOR SELECT 
USING (auth.uid() = created_by);

-- Policy 3: Admins can view all codeblocks
CREATE POLICY "Admins can view all codeblocks" 
ON public.codeblocks
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));
