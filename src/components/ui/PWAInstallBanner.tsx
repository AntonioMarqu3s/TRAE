/**
 * Componente PWAInstallBanner - Banner para instalação do PWA
 * Aparece apenas em dispositivos móveis quando o app pode ser instalado
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
// Remove unused import

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
  // Handlers com logs de debug para identificar problemas
  const handleInstall = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 PWA Install button clicked');
    
    try {
      onInstall();
      console.log('✅ PWA Install function called successfully');
    } catch (error) {
      console.error('❌ Error calling PWA install function:', error);
    }
  }, [onInstall]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('❌ PWA Dismiss button clicked');
    
    try {
      onDismiss();
      console.log('✅ PWA Dismiss function called successfully');
    } catch (error) {
      console.error('❌ Error calling PWA dismiss function:', error);
    }
  }, [onDismiss]);

  // Log quando o componente é renderizado
  console.log('🎨 PWAInstallBanner rendered:', { isVisible });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="pwa-banner fixed bottom-4 left-4 right-4 z-[9999] md:hidden pointer-events-auto"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 pointer-events-auto">
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
                
                {/* Botões com handlers diretos */}
                <div className="flex gap-2 pointer-events-auto">
                  {/* Botão Instalar */}
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 pointer-events-auto relative z-10"
                    style={{ zIndex: 10 }}
                  >
                    <Download size={14} />
                    Instalar
                  </button>
                  
                  {/* Botão Recusar */}
                  <button
                    onClick={handleDismiss}
                    className="inline-flex items-center justify-center text-xs px-3 py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 pointer-events-auto relative z-10"
                    style={{ zIndex: 10 }}
                  >
                    Não, obrigado
                  </button>
                </div>
              </div>
              
              {/* Botão fechar */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto relative z-10"
                style={{ zIndex: 10 }}
                aria-label="Fechar notificação"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};