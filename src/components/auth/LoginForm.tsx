/**
 * Componente de formulário de login/cadastro
 * Gerencia autenticação de usuários com Supabase
 * Design moderno com efeito liquid glass e animações
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from '../ui';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  // Função para lidar com o submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Cadastro
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
        }
      } else {
        // Login
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Animações do Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card principal com efeito liquid glass 3D mais transparente */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-ios-lg p-8 shadow-2xl shadow-black/20 transform-gpu"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transform: 'perspective(1000px) rotateX(2deg)',
          }}
          variants={cardVariants}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'Criar conta' : 'Bem-vindo'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isSignUp ? 'Preencha os dados para criar sua conta' : 'Entre com suas credenciais'}
              </p>
            </motion.div>
          </div>
          
          {/* Formulário */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-ios text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Campo Senha */}
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                label="Senha"
              />
            </motion.div>

            {/* Mensagens de erro e sucesso */}
            {error && (
              <motion.div 
                className="bg-red-100/80 backdrop-blur-sm border border-red-300/50 rounded-ios p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-red-700">{error}</div>
              </motion.div>
            )}

            {message && (
              <motion.div 
                className="bg-green-100/80 backdrop-blur-sm border border-green-300/50 rounded-ios p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-green-700">{message}</div>
              </motion.div>
            )}

            {/* Botão de submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold py-3 px-6 rounded-ios shadow-lg hover:shadow-xl hover:from-gray-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                isSignUp ? 'Criar conta' : 'Entrar'
              )}
            </motion.button>
          </form>

          {/* Toggle entre login e cadastro */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="ml-2 font-semibold text-gray-800 hover:text-black transition-colors duration-200 underline underline-offset-2"
              >
                {isSignUp ? 'Faça login' : 'Cadastre-se'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;