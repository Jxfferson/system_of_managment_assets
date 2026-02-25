// components/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

const Modal = ({ isOpen, onClose, type, title, message, details, onConfirm }) => {
  if (!isOpen) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isConfirm = type === 'confirm';
  
  let Icon = isError ? AlertCircle : isSuccess ? CheckCircle : HelpCircle;
  let iconColor = isError ? 'text-red-400' : isSuccess ? 'text-cyan-400' : 'text-yellow-400';
  let bgColor = isError ? 'bg-red-500/10' : isSuccess ? 'bg-cyan-500/10' : 'bg-yellow-500/10';
  let borderColor = isError ? 'border-red-500/20' : isSuccess ? 'border-cyan-500/20' : 'border-yellow-500/20';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md bg-slate-900 rounded-2xl border ${borderColor} shadow-2xl p-6 z-10`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
          <p className="text-slate-400 text-center mb-4">{message}</p>

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

          <div className="flex gap-3">
            {isConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-medium transition-all border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onConfirm && onConfirm(); onClose(); }}
                  className="flex-1 py-3 rounded-lg font-medium transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                >
                  Confirm
                </button>
              </>
            ) : (
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
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;