import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-primary block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-transparent border-0 border-b-2 py-4 focus:ring-0 transition-colors font-medium outline-none ${
            error 
              ? 'border-red-500 focus:border-red-500 text-red-500' 
              : 'border-slate-300 dark:border-slate-700 focus:border-primary'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';