/**
 * Componente KanbanLogo - Logo SVG inline para o Kanban
 * Garante que o logo funcione tanto no localhost quanto na Vercel
 */

import React from 'react';

interface KanbanLogoProps {
  className?: string;
  size?: number;
}

export const KanbanLogo: React.FC<KanbanLogoProps> = ({ 
  className = "", 
  size = 48 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fundo circular com gradiente */}
      <defs>
        <linearGradient id="kanban-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Círculo de fundo */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#kanban-gradient)"
        filter="url(#shadow)"
      />
      
      {/* Colunas do Kanban */}
      <g fill="white" fillOpacity="0.9">
        {/* Coluna 1 - To Do */}
        <rect x="20" y="25" width="12" height="50" rx="2" />
        <rect x="22" y="30" width="8" height="6" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="22" y="38" width="8" height="4" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="22" y="44" width="8" height="4" rx="1" fill="white" fillOpacity="0.3" />
        
        {/* Coluna 2 - In Progress */}
        <rect x="44" y="25" width="12" height="50" rx="2" />
        <rect x="46" y="30" width="8" height="8" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="46" y="40" width="8" height="6" rx="1" fill="white" fillOpacity="0.3" />
        
        {/* Coluna 3 - Done */}
        <rect x="68" y="25" width="12" height="50" rx="2" />
        <rect x="70" y="30" width="8" height="5" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="70" y="37" width="8" height="5" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="70" y="44" width="8" height="5" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="70" y="51" width="8" height="5" rx="1" fill="white" fillOpacity="0.3" />
      </g>
      
      {/* Ícone de movimento/fluxo */}
      <g stroke="white" strokeWidth="2" fill="none" strokeOpacity="0.7">
        <path d="M35 35 L42 35" markerEnd="url(#arrowhead)" />
        <path d="M59 40 L66 40" markerEnd="url(#arrowhead)" />
      </g>
      
      {/* Definição da seta */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="white" fillOpacity="0.7" />
        </marker>
      </defs>
    </svg>
  );
};

export default KanbanLogo;