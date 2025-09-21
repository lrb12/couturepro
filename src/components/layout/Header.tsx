import React from 'react';
import { Scissors } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'COUTUPRO', 
  showLogo = true 
}) => {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg">
      <div className="px-4 py-4">
        <div className="flex items-center justify-center">
          {showLogo && (
            <Scissors className="mr-3" size={28} />
          )}
          <h1 className="text-xl font-bold">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
};