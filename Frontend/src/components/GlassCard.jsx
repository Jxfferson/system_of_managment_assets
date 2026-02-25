import React from 'react';
import { cn } from '@/lib/utils';

const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] hover:border-white/20 hover:bg-slate-900/50',
        className
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
};

export default GlassCard;