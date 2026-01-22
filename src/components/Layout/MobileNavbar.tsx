import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, Globe } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';
const MobileNavbar = () => {
  const location = useLocation();
  return <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-mart-dark/90 backdrop-blur-lg border-t border-white/10">
      <div className="grid grid-cols-5 h-16">
        <Link to="/" className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-mart-primary' : 'text-white'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center justify-center ${location.pathname === '/search' ? 'text-mart-primary' : 'text-white'}`}>
          <Globe className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link to="/products" className={`flex flex-col items-center justify-center ${location.pathname === '/products' ? 'text-mart-primary' : 'text-white'}`}>
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Loja</span>
        </Link>
        
        <NotificationBell />

        <Link to="/profile" className={`flex flex-col items-center justify-center ${location.pathname.includes('/profile') ? 'text-mart-primary' : 'text-white'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>;
};
export default MobileNavbar;