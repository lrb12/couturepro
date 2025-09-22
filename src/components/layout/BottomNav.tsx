import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Package, Bell, Settings } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { unreadCount } = useAlerts();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/commandes', icon: Package, label: 'Commandes' },
    { path: '/alertes', icon: Bell, label: 'Alertes', badge: unreadCount },
    { path: '/parametres', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                isActive 
                  ? 'text-green-600' 
                  : 'text-gray-500 hover:text-green-600'
              } transition-colors duration-200`}
            >
              <Icon 
                size={20} 
                className={isActive ? 'text-green-600' : ''} 
              />
              <span className="text-xs mt-1 truncate">
                {label}
              </span>
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};