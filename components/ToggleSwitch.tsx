import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: () => void;
  labelLeft: string;
  labelRight: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  titleLeft?: string;
  titleRight?: string;
}

const ToggleSwitchComponent: React.FC<ToggleSwitchProps> = ({ 
  isChecked, 
  onChange, 
  labelLeft, 
  labelRight, 
  iconLeft, 
  iconRight,
  titleLeft,
  titleRight
}) => {
  return (
    <div className="flex items-center justify-center space-x-1 p-1 bg-neutral-800 rounded-lg shadow-inner border border-emerald-700">
      <button 
        onClick={!isChecked ? onChange : undefined} 
        aria-pressed={!isChecked}
        title={titleLeft || labelLeft}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out
                    ${!isChecked ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-neutral-300 hover:bg-neutral-700/70 hover:text-emerald-400'}`}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {labelLeft}
      </button>
      
      <button 
        onClick={isChecked ? onChange : undefined} 
        aria-pressed={isChecked}
        title={titleRight || labelRight}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out
                    ${isChecked ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-neutral-300 hover:bg-neutral-700/70 hover:text-emerald-400'}`}
      >
        {iconRight && <span className="mr-2">{iconRight}</span>}
        {labelRight}
      </button>
    </div>
  );
};

export const ToggleSwitch = React.memo(ToggleSwitchComponent);
