import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  // Couleurs optionnelles pour CTA
  bgColor?: string;
  textColor?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, bgColor = 'bg-white', textColor = 'text-black' }) => {
  return (
    <div
      className={`${bgColor} ${textColor} rounded-xl shadow-lg p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
