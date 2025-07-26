/**
 * Componente Card reutilizável com efeito liquid glass
 * Base para cards de tarefas e outros elementos do Kanban
 */

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'default' | 'task' | 'column';
  hover?: boolean;
  children: React.ReactNode;
  backgroundColor?: string;
}

// Estilos para diferentes variantes
const variantStyles = {
  default: 'glass-effect rounded-ios p-4',
  task: 'task-card',
  column: 'kanban-column',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  backgroundColor,
  children,
  className = '',
  style,
  ...props
}) => {
  // Classes CSS combinadas
  const baseClasses = variantStyles[variant];
  const combinedClasses = `${baseClasses} ${className}`.trim();

  // Animações do Framer Motion
  const cardVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
    hover: hover ? { 
      scale: 1.02,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    } : {},
    tap: { 
      scale: 0.98,
    },
  };

  // Estilo combinado com backgroundColor personalizada
  const combinedStyle = {
    ...style,
    ...(backgroundColor && { backgroundColor }),
  };

  return (
    <motion.div
      className={combinedClasses}
      style={combinedStyle}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;