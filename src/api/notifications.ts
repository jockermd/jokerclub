
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Notification = Tables<'notifications'>;
export type NotificationWithActor = Notification & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'username' | 'full_name' | 'avatar_url'> | null;
};

export const getNotifications = async (): Promise<NotificationWithActor[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id (id, username, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.message);
  }
  return (data as any) || [];
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread notification count:', error);
    throw new Error(error.message);
  }
  return count ?? 0;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if(userError || !userData.user) {
        throw new Error("User not found");
    }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userData.user.id)
    .eq('is_read', false);
    
  if (error) {
    console.error('Error marking notifications as read:', error);
    throw new Error(error.message);
  }
};
