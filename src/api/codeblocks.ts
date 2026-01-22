
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Codeblock = Database['public']['Tables']['codeblocks']['Row'];
export type NewCodeblock = Database['public']['Tables']['codeblocks']['Insert'];
export type UpdateCodeblock = Database['public']['Tables']['codeblocks']['Update'];

export const getCodeblocks = async () => {
  const { data, error } = await supabase
    .from('codeblocks')
    .select('*, profiles (id, username, full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createCodeblock = async (codeblock: NewCodeblock) => {
  const { data, error } = await supabase
    .from('codeblocks')
    .insert(codeblock)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCodeblock = async (id: string, updates: UpdateCodeblock) => {
  const { data, error } = await supabase
    .from('codeblocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCodeblock = async (id: string) => {
  const { error } = await supabase.from('codeblocks').delete().eq('id', id);

  if (error) throw error;
  return id;
};
