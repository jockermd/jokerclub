
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'default',
  size = 'md',
  children,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'mars-button',
        'inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'w-full': fullWidth,
          'text-sm px-4 py-1': size === 'sm',
          'text-base px-6 py-2': size === 'md',
          'text-lg px-8 py-3': size === 'lg',
          'bg-opacity-20 border border-mart-primary': variant === 'outline',
          'bg-transparent hover:bg-mart-primary/10': variant === 'ghost',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
