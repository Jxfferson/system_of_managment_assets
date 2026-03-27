import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';

const AdminLogin = ({ onLogin, error, isLocked, timeLeft }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLocked) {
      onLogin(password);
      setPassword('');
    }
  };

  const displayError = isLocked 
    ? `Acceso bloqueado. Espera ${timeLeft}s` 
    : error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl p-12 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-10">
          {/* Títulos de la aplicación */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tighter mb-1">
              <span className="text-gray-200">OTD</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Support
              </span>
            </h2>
            <p className="text-slate-400 text-sm">Asset Management System</p>
          </div>

          {/* Ícono y título de Admin */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 mb-6 shadow-lg shadow-cyan-500/30">
            {isLocked ? (
              <Lock className="w-10 h-10 text-white" />
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Admin Access</h1>
          <p className="text-slate-400 text-lg">
            {isLocked ? 'Access Temporarily Denied' : 'Enter your credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={isLocked}
                className="w-full h-14 text-base bg-slate-800/50 border-white/20 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl pr-12 disabled:opacity-50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-cyan-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className={`p-4 rounded-xl border flex items-center gap-2 ${
              isLocked 
                ? 'bg-orange-500/10 border-orange-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              {isLocked 
                ? <Lock className="w-5 h-5 text-orange-400" /> 
                : <AlertTriangle className="w-5 h-5 text-red-400" />
              }
              <p className={`${isLocked ? 'text-orange-400' : 'text-red-400'} text-sm`}>
                {displayError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLocked}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLocked ? 'Blocked' : 'Login'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;