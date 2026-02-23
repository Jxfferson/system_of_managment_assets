// components/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, type, title, message, details }) => {
  if (!isOpen) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  const iconColor = isError ? 'text-red-400' : 'text-cyan-400';
  const bgColor = isError ? 'bg-red-500/10' : 'bg-cyan-500/10';
  const borderColor = isError ? 'border-red-500/20' : 'border-cyan-500/20';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md bg-slate-900 rounded-2xl border ${borderColor} shadow-2xl p-6 z-10`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-slate-400 text-center mb-4">
            {message}
          </p>

          {/* Details (solo para éxito) */}
          {details && !isError && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-white/5">
              <p className="text-sm text-slate-300">
                <span className="text-cyan-400 font-medium">Email sent to:</span> {details.email}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                <span className="text-cyan-400 font-medium">Request ID:</span> {details.requestId}
              </p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isError
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
            }`}
          >
            {isError ? 'Got it' : 'Continue'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;