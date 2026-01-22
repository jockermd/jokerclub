
-- This policy allows admins to view all consulting sessions
DROP POLICY IF EXISTS "Participants can view their sessions" ON public.consulting_sessions;
CREATE POLICY "Participants or admins can view sessions"
  ON public.consulting_sessions FOR SELECT
  USING (auth.uid() = consultant_id OR auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));

-- This policy allows admins to update any consulting session
DROP POLICY IF EXISTS "Participants can update their sessions" ON public.consulting_sessions;
CREATE POLICY "Participants or admins can update sessions"
  ON public.consulting_sessions FOR UPDATE
  USING (auth.uid() = consultant_id OR auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = consultant_id OR auth.uid() = client_id OR public.has_role(auth.uid(), 'admin'));
