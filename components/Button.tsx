
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
      break;
    case 'secondary':
      variantStyles = 'text-neutral-200 bg-neutral-700 hover:bg-neutral-600 focus:ring-emerald-500 border-neutral-600 hover:border-emerald-500';
      break;
    case 'danger': // Retain red for clear error indication
      variantStyles = 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500';
      break;
    case 'warning': // "Buy Me a Coffee" - Retains yellow for distinct CTA
      variantStyles = 'text-yellow-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-400';
      break;
  }

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Button = React.memo(ButtonComponent);
