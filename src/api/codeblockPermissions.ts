
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type CodeblockPermission = Database['public']['Tables']['codeblock_access_permissions']['Row'];
export type NewCodeblockPermission = Database['public']['Tables']['codeblock_access_permissions']['Insert'];

export const getCodeblockPermissions = async (codeblockId: string) => {
  const { data, error } = await supabase
    .from('codeblock_access_permissions')
    .select(`
      *,
      profiles!codeblock_access_permissions_user_id_fkey(username, full_name, avatar_url),
      granted_by_profile:profiles!codeblock_access_permissions_granted_by_fkey(username, full_name)
    `)
    .eq('codeblock_id', codeblockId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const grantCodeblockAccess = async (codeblockId: string, userId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('codeblock_access_permissions')
    .insert({
      codeblock_id: codeblockId,
      user_id: userId,
      granted_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const revokeCodeblockAccess = async (codeblockId: string, userId: string) => {
  const { error } = await supabase
    .from('codeblock_access_permissions')
    .delete()
    .eq('codeblock_id', codeblockId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

export const getUserCodeblockAccess = async (userId: string) => {
  const { data, error } = await supabase
    .from('codeblock_access_permissions')
    .select(`
      *,
      codeblocks(title, description, is_blurred)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const checkUserCodeblockAccess = async (codeblockId: string, userId?: string) => {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('codeblock_access_permissions')
    .select('id')
    .eq('codeblock_id', codeblockId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};
