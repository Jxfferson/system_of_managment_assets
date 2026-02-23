import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300',
        hover && 'hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] hover:border-white/20 hover:bg-slate-900/50',
        className
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  );
};

export default GlassCard;