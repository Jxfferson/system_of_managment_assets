import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FormField = ({ label, error, required, children, helpText }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-cyan-400">*</span>}
      </label>
      
      {children}
      
      {helpText && !error && (
        <p className="text-xs text-slate-500 ml-1 mt-1">{helpText}</p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="text-red-400 text-xs mt-1 flex items-center gap-1 ml-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormField;