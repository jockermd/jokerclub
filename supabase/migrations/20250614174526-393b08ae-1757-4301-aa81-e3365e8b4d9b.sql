
-- Create a policy to allow admins to insert new products
CREATE POLICY "Allow admins to insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a policy to allow admins to update products
CREATE POLICY "Allow admins to update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create a policy to allow admins to delete products
CREATE POLICY "Allow admins to delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
