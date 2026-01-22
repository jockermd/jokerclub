
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getPopularPosts } from '@/api/rankings';
import { Skeleton } from '@/components/ui/skeleton';

const PopularPosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['popularPosts'],
    queryFn: getPopularPosts,
  });

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in hover:shadow-2xl hover:shadow-mart-primary/10 transition-all duration-500 hover:scale-[1.02] group">
      <h3 className="text-lg font-orbitron font-bold text-white mb-4 bg-gradient-to-r from-white to-mart-primary bg-clip-text text-transparent group-hover:from-mart-primary group-hover:to-mart-accent transition-all duration-500">
        Posts Populares
      </h3>
      <div className="space-y-3">
        {isLoading && (
          <>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Skeleton className="h-4 w-5/6 animate-[pulse_2s_ease-in-out_infinite]" />
              <Skeleton className="h-3 w-1/4 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
            </div>
            <Separator className="bg-white/10 animate-fade-in" style={{ animationDelay: '200ms' }} />
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Skeleton className="h-4 w-4/5 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
              <Skeleton className="h-3 w-1/3 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
            </div>
            <Separator className="bg-white/10 animate-fade-in" style={{ animationDelay: '400ms' }} />
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Skeleton className="h-4 w-full animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.8s' }} />
              <Skeleton className="h-3 w-1/2 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
            </div>
          </>
        )}
        {!isLoading && posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <div 
                className="group hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <a href="#" className="text-white/80 hover:text-mart-primary transition-all duration-300 text-sm font-semibold block relative group-hover:translate-x-2">
                  <span className="relative pb-1">
                    {post.title.substring(0, 60) + (post.title.length > 60 ? '...' : '')}
                    <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-mart-primary to-mart-accent transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </a>
                <p className="text-xs mt-1 transition-all duration-300">
                  <span className="text-mart-primary">
                    #{post.tag}
                  </span>
                </p>
              </div>
              {index < posts.length - 1 && (
                <Separator 
                  className="bg-white/10 transition-all duration-300 hover:bg-mart-primary/30 animate-fade-in" 
                  style={{ animationDelay: `${index * 150 + 75}ms` }}
                />
              )}
            </React.Fragment>
          ))
        ) : !isLoading && (
            <p className="text-white/60 text-sm text-center animate-fade-in">Nenhum post popular no momento.</p>
        )}
      </div>
    </div>
  );
};

export default PopularPosts;
