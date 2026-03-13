import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", variant = "destructive" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/90"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-slate-900 bg-opacity-100 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "destructive" ? "bg-red-500/10" : "bg-cyan-500/10"
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === "destructive" ? "text-red-400" : "text-cyan-400"
            }`} />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {title}
          </h3>

          <p className="text-slate-400 text-sm mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-slate-800 border-white/10 text-white hover:bg-slate-700"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 ${
                variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;