import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`card-on-blue rounded-xl shadow-lg p-4 ${onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
