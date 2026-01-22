
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopJokers, TopUser } from '@/api/rankings';
import { Skeleton } from '../ui/skeleton';
import { Link } from 'react-router-dom';
import { CheckCircle, Award } from 'lucide-react';

const Medal = ({ rank }: { rank: number }) => {
  const medalConfig = {
    0: { color: 'text-yellow-400', shadow: 'drop-shadow(0 0 2px #facc15)' }, // Gold
    1: { color: 'text-gray-400', shadow: 'drop-shadow(0 0 2px #9ca3af)' }, // Silver
    2: { color: 'text-orange-800', shadow: 'drop-shadow(0 0 2px #9a3412)' }, // Bronze
  };

  const config = medalConfig[rank] || { color: 'text-white/50', shadow: 'none' };

  return <Award className={`h-5 w-5 ${config.color} transition-all duration-300 hover:scale-110 animate-pulse`} style={{ filter: config.shadow }} />;
};

const TopJokerItem = ({ user, rank }: { user: TopUser; rank: number }) => (
  <div 
    className="flex items-center space-x-3 group hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
    style={{ animationDelay: `${rank * 100}ms` }}
  >
    <div className="relative">
      <Medal rank={rank} />
      {rank < 3 && (
        <div className="absolute -inset-1 bg-gradient-to-r from-mart-primary/30 to-mart-accent/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}
    </div>
    <Link to={`/profile/${user.id}`} className="flex-shrink-0">
      <div className="relative">
        <img
          src={user.avatar_url || '/placeholder.svg'}
          alt={user.full_name || 'User avatar'}
          className="w-8 h-8 rounded-full object-cover border-2 border-mart-secondary hover:border-mart-primary transition-all duration-300 hover:scale-110 hover:rotate-3"
        />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-mart-primary to-mart-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
      </div>
    </Link>
    <div className="flex-1 min-w-0">
      <Link to={`/profile/${user.id}`} className="hover:text-mart-primary transition-colors duration-300">
        <p className="text-sm font-semibold text-white truncate flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
          {user.full_name || `@${user.username}`}
          {user.is_verified && <CheckCircle className="h-3 w-3 text-mart-primary flex-shrink-0 animate-pulse" />}
        </p>
      </Link>
      <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">
        Score: <span className="font-mono bg-gradient-to-r from-mart-primary to-mart-accent bg-clip-text text-transparent font-bold">{Math.round(user.total_score)}</span>
      </p>
    </div>
  </div>
);

const TopJokers = () => {
  const { data: topJokers, isLoading } = useQuery({
    queryKey: ['topJokers'],
    queryFn: getTopJokers,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in hover:shadow-2xl hover:shadow-mart-primary/10 transition-all duration-500 hover:scale-[1.02] group">
      <h3 className="text-lg font-orbitron font-bold text-white mb-4 bg-gradient-to-r from-white to-mart-primary bg-clip-text text-transparent group-hover:from-mart-primary group-hover:to-mart-accent transition-all duration-500">
        Top Jokers
      </h3>
      <div className="space-y-4">
        {isLoading && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
              <Skeleton className="h-5 w-5 rounded-md animate-[pulse_2s_ease-in-out_infinite]" />
              <Skeleton className="h-8 w-8 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                <Skeleton className="h-3 w-1/2 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          ))
        )}
        {topJokers && topJokers.length > 0 ? (
          topJokers.map((user, index) => <TopJokerItem key={user.id} user={user} rank={index} />)
        ) : !isLoading && (
          <p className="text-white/60 text-sm text-center animate-fade-in">No jokers yet. Be the first one!</p>
        )}
      </div>
    </div>
  );
};

export default TopJokers;
