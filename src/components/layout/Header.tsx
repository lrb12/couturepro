import React from 'react';
import { Scissors } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'COUTUPRO', 
  showLogo = true 
}) => {
  const { settings } = useSettings();

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-700 text-white shadow-lg" style={{
      background: settings ? `linear-gradient(to right, ${settings.accentColor || '#0F2A44'}, ${settings.primaryColor || '#0A3764'})` : undefined
    }}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-center">
          {showLogo && (
            <>
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="w-8 h-8 mr-3 rounded-full object-cover"
                />
              ) : (
                <Scissors className="mr-3" size={28} />
              )}
            </>
          )}
          <h1 className="text-xl font-bold">
            {showLogo && settings?.atelierName ? settings.atelierName : title}
          </h1>
        </div>
      </div>
    </header>
  );
};