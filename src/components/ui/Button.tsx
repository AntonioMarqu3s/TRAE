/**
 * Componente Button reutilizável com variantes e estados
 * Suporta diferentes estilos e animações do iOS 26
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// Tipos para as variantes do botão
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children?: React.ReactNode;
}

// Estilos base para cada variante
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'glass-effect text-gray-700 hover:bg-white/30',
  ghost: 'text-gray-600 hover:bg-white/20 hover:text-gray-800',
  icon: 'glass-effect p-2 rounded-full hover:bg-white/30 text-gray-600 hover:text-gray-800',
};

// Estilos para diferentes tamanhos
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  children,
  className = '',
  onClick,
  ...props
}) => {
  // Classes CSS combinadas
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-start/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClass = variantStyles[variant];
  const sizeClass = variant === 'icon' ? '' : sizeStyles[size];
  
  const combinedClasses = `${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim();

  // Animações do Framer Motion
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Handler de clique com feedback tátil
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={combinedClasses}
      disabled={disabled || isLoading}
      onClick={handleClick}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {/* Ícone à esquerda */}
      {Icon && iconPosition === 'left' && (
        <Icon 
          className={`${children ? 'mr-2' : ''} ${isLoading ? 'animate-spin' : ''}`} 
          size={variant === 'icon' ? 20 : 16} 
        />
      )}
      
      {/* Loading spinner */}
      {isLoading && !Icon && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      
      {/* Texto do botão */}
      {children && (
        <span className={isLoading ? 'opacity-70' : ''}>
          {children}
        </span>
      )}
      
      {/* Ícone à direita */}
      {Icon && iconPosition === 'right' && (
        <Icon 
          className={`${children ? 'ml-2' : ''} ${isLoading ? 'animate-spin' : ''}`} 
          size={variant === 'icon' ? 20 : 16} 
        />
      )}
    </motion.button>
  );
};

export default Button;