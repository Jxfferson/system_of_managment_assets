import React from 'react';
import { motion } from 'framer-motion';

const FormSection = ({ title, description, children, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-8 p-6 md:p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
};

export default FormSection;