import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    // Clases base compartidas
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Variantes de diseño extraídas de tus HTML
    const variants = {
      primary: 'bg-primary text-white hover:scale-[1.02] shadow-lg shadow-primary/20',
      outline: 'bg-transparent border-2 border-primary/20 text-primary dark:text-white hover:border-primary/50',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    };

    // Tamaños extraídos de tus HTML
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-full',
      md: 'px-5 py-2 text-sm rounded-full',
      lg: 'px-8 py-4 text-xl rounded-2xl', // Usado en el Hero y Contacto
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} disabled={disabled || isLoading} className={combinedClassName} {...props}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';