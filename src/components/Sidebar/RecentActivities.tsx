
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getGlobalRecentActivities, GlobalRecentActivity } from '@/api/activities';
import { Skeleton } from '../ui/skeleton';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationText = ({ activity }: { activity: GlobalRecentActivity }) => {
    const actorName = activity.actor_full_name || activity.actor_username || 'Alguém';

    let actionText = '';
    switch(activity.activity_type) {
        case 'like':
            actionText = 'curtiu um tweet.';
            break;
        case 'retweet':
            actionText = 'retweetou um tweet.';
            break;
        case 'reply':
            actionText = 'respondeu a um tweet.';
            break;
        case 'follow':
            actionText = 'começou a seguir um usuário.';
            break;
        default:
            actionText = 'interagiu.';
    }

    return (
        <span className="animate-fade-in">
            <strong className="font-semibold text-white/90 bg-gradient-to-r from-mart-primary to-mart-accent bg-clip-text text-transparent transition-all duration-300">
                {actorName}
            </strong> 
            <span className="ml-1">{actionText}</span>
        </span>
    );
}

const RecentActivities = () => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['globalRecentActivities'],
        queryFn: getGlobalRecentActivities,
    });

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in hover:shadow-2xl hover:shadow-mart-primary/10 transition-all duration-500 hover:scale-[1.02] group">
      <h3 className="text-lg font-orbitron font-bold text-white mb-4 bg-gradient-to-r from-white to-mart-primary bg-clip-text text-transparent group-hover:from-mart-primary group-hover:to-mart-accent transition-all duration-500">
        Atividades Recentes
      </h3>
      <div className="space-y-3">
        {isLoading && (
            <div className="space-y-3">
                <Skeleton className="h-8 w-full animate-[pulse_2s_ease-in-out_infinite] animate-fade-in" />
                <Separator className="bg-white/10 animate-fade-in" style={{ animationDelay: '150ms' }} />
                <Skeleton className="h-8 w-4/5 animate-[pulse_2s_ease-in-out_infinite] animate-fade-in" style={{ animationDelay: '300ms' }} />
                <Separator className="bg-white/10 animate-fade-in" style={{ animationDelay: '450ms' }} />
                <Skeleton className="h-8 w-full animate-[pulse_2s_ease-in-out_infinite] animate-fade-in" style={{ animationDelay: '600ms' }} />
            </div>
        )}
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <Link to={`/profile/${activity.actor_id}`} className="block">
                <div 
                  className="text-white/70 text-sm hover:text-white transition-all duration-300 group hover:bg-white/5 rounded-lg p-2 -m-2 hover:scale-[1.02] animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mart-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <NotificationText activity={activity} />
                    <p className="text-xs text-white/50 mt-1 group-hover:text-mart-primary/70 transition-colors duration-300">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              </Link>
              {index < activities.length - 1 && (
                <Separator 
                  className="bg-white/10 transition-all duration-300 hover:bg-mart-primary/30 animate-fade-in" 
                  style={{ animationDelay: `${index * 120 + 60}ms` }}
                />
              )}
            </React.Fragment>
          ))
        ) : !isLoading && (
            <p className="text-white/60 text-sm text-center animate-fade-in">Nenhuma atividade recente.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
