
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUnreadNotificationCount } from '@/api/notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  const isActive = location.pathname === '/notifications';

  return (
    <Link 
      to="/notifications" 
      className={`relative flex flex-col items-center justify-center ${
        isActive ? 'text-mart-primary' : 'text-white'
      } hover:text-mart-primary transition-colors`}
    >
      <Bell className="h-5 w-5" />
      <span className="text-xs mt-1">Notifications</span>
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
