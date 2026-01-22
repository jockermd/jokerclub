
import { Link, useLocation } from 'react-router-dom';
import { Home, LogOut, Globe, Search, User, ShieldCheck, ShoppingCart, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/api/profiles';
import { getUnreadNotificationCount } from '@/api/notifications';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => {
      if (!user?.id) return null;
      return getProfile(user.id);
    },
    enabled: !!user?.id,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadNotificationCount,
    enabled: !!user,
  });

  return (
    <nav className="sticky top-0 z-50 bg-mart-dark/80 backdrop-blur-lg border-b border-white/10 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-orbitron font-bold text-white">
          <span className="text-mart-primary glow-text">Joker</span>
          <span>club</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-white hover:text-mart-primary transition-colors ${
                location.pathname === '/' ? 'text-mart-primary' : ''
              }`}
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link 
              to="/search" 
              className={`text-white hover:text-mart-primary transition-colors ${
                location.pathname === '/search' ? 'text-mart-primary' : ''
              }`}
            >
              <Globe className="h-5 w-5" />
            </Link>
            <Link 
              to="/products" 
              className={`text-white hover:text-mart-primary transition-colors ${
                location.pathname === '/products' ? 'text-mart-primary' : ''
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link 
              to="/notifications" 
              className={`relative text-white hover:text-mart-primary transition-colors ${
                location.pathname === '/notifications' ? 'text-mart-primary' : ''
              }`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount !== undefined && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link 
              to="/profile" 
              className={`text-white hover:text-mart-primary transition-colors ${
                location.pathname.includes('/profile') ? 'text-mart-primary' : ''
              }`}
            >
              <User className="h-5 w-5" />
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-white hover:text-mart-primary transition-colors ${
                  location.pathname.startsWith('/admin') ? 'text-mart-primary' : ''
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                to="/profile" 
                className="w-8 h-8 rounded-full bg-mart-secondary text-white flex items-center justify-center overflow-hidden border-2 border-mart-primary hover:scale-110 transition-transform"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'User avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </span>
                )}
              </Link>
              <button onClick={signOut} className="text-white hover:text-mart-primary transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <Link 
                to="/login" 
                className="text-sm font-orbitron py-1.5 px-4 rounded bg-transparent border border-mart-primary text-mart-primary hover:bg-mart-primary/20 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-sm font-orbitron py-1.5 px-4 rounded bg-mart-primary text-white hover:bg-mart-primary/80 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
