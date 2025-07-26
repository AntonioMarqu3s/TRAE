/**
 * Componente Textarea reutilizável com estilos iOS 26
 * Para descrições de tarefas e textos longos
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'glass';
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  variant = 'glass',
  resize = true,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  // ID único para acessibilidade
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  // Classes base do textarea
  const baseClasses = 'w-full px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-start/50';
  
  // Estilos por variante
  const variantClasses = {
    default: 'border border-gray-200 rounded-ios bg-white/80',
    glass: 'glass-effect rounded-ios border-0',
  };

  // Classes de resize
  const resizeClasses = resize ? 'resize-y' : 'resize-none';
  
  // Classes de erro
  const errorClasses = error ? 'ring-2 ring-red-400/50 border-red-300' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${resizeClasses} ${errorClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      {/* Textarea */}
      <motion.textarea
        ref={ref}
        id={textareaId}
        rows={rows}
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

Textarea.displayName = 'Textarea';

export default Textarea;