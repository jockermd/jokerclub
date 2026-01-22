
import React, { useEffect } from 'react';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import { Bell, Heart, Repeat, MessageSquare, UserPlus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsAsRead, NotificationWithActor } from '@/api/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const NotificationIcon = ({ type }: { type: NotificationWithActor['type'] }) => {
    const commonClass = "h-6 w-6 shrink-0";
    switch (type) {
        case 'like': return <Heart className={`${commonClass} text-red-500`} />;
        case 'retweet': return <Repeat className={`${commonClass} text-green-500`} />;
        case 'reply': return <MessageSquare className={`${commonClass} text-blue-500`} />;
        case 'follow': return <UserPlus className={`${commonClass} text-mart-primary`} />;
        default: return <Bell className={`${commonClass} text-gray-500`} />;
    }
};

const NotificationText = ({ notification }: { notification: NotificationWithActor }) => {
    const actorName = notification.profiles?.full_name || notification.profiles?.username || 'Alguém';

    let actionText = '';
    
    switch (notification.type) {
        case 'like': actionText = 'curtiu seu tweet.'; break;
        case 'retweet': actionText = 'retweetou seu tweet.'; break;
        case 'reply': actionText = 'respondeu ao seu tweet.'; break;
        case 'follow': actionText = 'começou a seguir você.'; break;
        default: actionText = 'interagiu com você.';
    }

    return (
        <p className="text-white/90">
            <span className="font-bold text-white group-hover:underline">
                {actorName}
            </span>
            {' '}{actionText}
        </p>
    );
};

const Notifications = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const { data: notifications, isLoading, error } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        enabled: !!user,
    });

    const { mutate: markAsRead } = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    useEffect(() => {
        if (user) {
            markAsRead();
        }
    }, [user, markAsRead]);

    return (
        <div className="min-h-screen pb-16 md:pb-0">
            <ParticleBackground />
            <Navbar />

            <main className="container mx-auto px-4 py-6 max-w-3xl">
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <Bell className="h-8 w-8 text-mart-primary" />
                            <h1 className="text-2xl font-orbitron font-bold text-white">Notificações</h1>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                        </div>
                    ) : error ? (
                        <div className="h-60 flex flex-col items-center justify-center text-red-500">
                            <p className="text-lg mb-2">Erro ao carregar notificações</p>
                            <p className="text-sm">{error.message}</p>
                        </div>
                    ) : !notifications || notifications.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center text-white/60">
                            <Bell className="h-12 w-12 mb-4" />
                            <p className="text-lg mb-2">Nenhuma notificação ainda</p>
                            <p className="text-sm">Quando alguém interagir com seus tweets ou perfil, você verá aqui</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(notification => {
                                const destination = notification.tweet_id
                                    ? `/profile?highlight_tweet=${notification.tweet_id}`
                                    : `/profile/${notification.actor_id}`;

                                return (
                                    <Link key={notification.id} to={destination} className="block group">
                                        <div className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${!notification.is_read ? 'bg-white/10' : 'bg-transparent'} hover:bg-white/10`}>
                                            <NotificationIcon type={notification.type} />
                                            <div className="flex-1">
                                                <NotificationText notification={notification} />
                                                <p className="text-xs text-white/50 mt-1">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <MobileNavbar />
        </div>
    );
};

export default Notifications;
