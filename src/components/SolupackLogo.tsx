import React from 'react';
import logoImage from '../assets/images/solupack_logo_1785426115900.jpg';

interface SolupackLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white';
}

export default function SolupackLogo({ className = "h-16 w-full", variant = 'light' }: SolupackLogoProps) {
  return (
    <div className={`flex items-center justify-center p-2 rounded-lg transition-all ${
      variant === 'dark' 
        ? 'bg-slate-900/90 border border-slate-800' 
        : variant === 'white' 
          ? 'bg-white border border-slate-100 shadow-2xs' 
          : 'bg-white border border-slate-100'
    } ${className}`}>
      <img
        src={logoImage}
        alt="Solupack Innovative Packaging"
        className="max-h-full max-w-full object-contain rounded"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

