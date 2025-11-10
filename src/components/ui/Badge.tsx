import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-background-lighter text-text-primary border-background-hover',
    success: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    warning: 'bg-primary/20 text-primary border-primary/30',
    error: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    info: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${variantClasses[variant]} 
      ${sizeClasses[size]} 
      ${className}
    `}>
      {children}
    </span>
  );
};