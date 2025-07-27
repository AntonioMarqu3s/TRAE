/**
 * Componente de Input de Senha com Toggle de Visibilidade
 * Componente reutilizável que combina input de senha com botão para alternar visibilidade
 * Design moderno com efeito liquid glass e animações suaves
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  label?: string;
}

/**
 * Componente de Input de Senha com Toggle de Visibilidade
 * @param props - Propriedades do componente
 * @returns JSX.Element
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  autoComplete = "current-password",
  className = "",
  label = "Senha"
}) => {
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      {/* Label do campo */}
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      {/* Container do input com posicionamento relativo */}
      <div className="relative w-full">
        {/* Input de senha */}
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 pr-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-ios text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          placeholder={placeholder}
          aria-describedby={`${id}-toggle`}
        />
        
        {/* Botão para alternar visibilidade da senha - POSICIONADO DENTRO DO INPUT */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <motion.button
            id={`${id}-toggle`}
            type="button"
            onClick={togglePasswordVisibility}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 focus:text-gray-700 transition-all duration-200 rounded-full hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              // Ícone de olho fechado (senha visível)
              <EyeOff 
                className="w-5 h-5" 
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              // Ícone de olho aberto (senha oculta)
              <Eye 
                className="w-5 h-5" 
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Texto de ajuda para acessibilidade */}
      <div className="sr-only" aria-live="polite">
        {showPassword ? "Senha está visível" : "Senha está oculta"}
      </div>
    </div>
  );
};

export default PasswordInput;