/**
 * Componente PWAInstallBanner - Banner para instalação do PWA
 * Aparece apenas em dispositivos móveis quando o app pode ser instalado
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './Button';

interface PWAInstallBannerProps {
  isVisible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isVisible,
  onInstall,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              {/* Ícone */}
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone size={20} className="text-blue-600" />
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Instalar Kanban App
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Adicione à tela inicial para acesso rápido e experiência completa
                </p>
                
                {/* Botões */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={onInstall}
                    className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Instalar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-800"
                  >
                    Agora não
                  </Button>
                </div>
              </div>
              
              {/* Botão fechar */}
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};