import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={cn('input-premium appearance-none pr-10 cursor-pointer', className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
  );
});
Select.displayName = 'Select';

export { Select };