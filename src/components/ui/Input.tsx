/**
 * Componente Input reutilizável com estilos iOS 26
 * Suporta diferentes tipos e estados de validação
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'glass';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  variant = 'glass',
  className = '',
  id,
  ...props
}, ref) => {
  // ID único para acessibilidade
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Classes base do input
  const baseClasses = 'w-full px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-start/50';
  
  // Estilos por variante
  const variantClasses = {
    default: 'border border-gray-200 rounded-ios bg-white/80',
    glass: 'glass-effect rounded-ios border-0',
  };

  // Classes para ícones
  const iconClasses = Icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';
  
  // Classes de erro
  const errorClasses = error ? 'ring-2 ring-red-400/50 border-red-300' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${iconClasses} ${errorClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      {/* Container do input com ícone */}
      <div className="relative">
        {/* Ícone */}
        {Icon && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${
            iconPosition === 'left' ? 'left-4' : 'right-4'
          } text-gray-400`}>
            <Icon size={20} />
          </div>
        )}
        
        {/* Input */}
        <motion.input
          ref={ref}
          id={inputId}
          className={combinedClasses}
          whileFocus={{
            scale: 1.01,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          {...props}
        />
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;