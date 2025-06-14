
import React from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // any specific props here if needed
}

const TextAreaInputComponent: React.FC<TextAreaInputProps> = ({ className = '', ...props }) => {
  const baseStyles = "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed";
  const defaultStyles = "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:ring-emerald-500 focus:border-emerald-500 hover:border-neutral-600";
  
  return (
    <textarea
      className={`${baseStyles} ${defaultStyles} ${className}`}
      {...props}
    />
  );
};

export const TextAreaInput = React.memo(TextAreaInputComponent);
