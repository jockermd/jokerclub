import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type ConsultingSessionWithProfiles = Tables<'consulting_sessions'> & {
  client: any;
  consultant: any;
};

export const getAllConsultingSessions = async (): Promise<ConsultingSessionWithProfiles[]> => {
  const { data, error } = await supabase
    .from('consulting_sessions')
    .select(`
      *,
      client:client_id(*),
      consultant:consultant_id(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all consulting sessions:', error);
    throw new Error(error.message);
  }

  return data as ConsultingSessionWithProfiles[];
};

export const updateConsultingSession = async (
  sessionId: string,
  updateData: TablesUpdate<'consulting_sessions'>
) => {
  const { data, error } = await supabase
    .from('consulting_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating consulting session:', error);
    throw new Error(error.message);
  }

  return data;
};

export type ConsultingCardSettings = Tables<'consulting_card_settings'>;

export const getConsultingCardSettings = async (): Promise<ConsultingCardSettings> => {
  const { data, error } = await supabase
    .from('consulting_card_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error fetching consulting card settings:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const updateConsultingCardSettings = async (
  updateData: Omit<TablesUpdate<'consulting_card_settings'>, 'id' | 'updated_at'>
) => {
  const { data, error } = await supabase
    .from('consulting_card_settings')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    console.error('Error updating consulting card settings:', error);
    throw new Error(error.message);
  }

  return data;
};
