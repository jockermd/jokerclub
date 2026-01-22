
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export const getUserRoles = async (userId: string): Promise<Tables<'user_roles'>[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user roles:', error);
    throw new Error(error.message);
  }

  return data || [];
};
