import React from 'react';
import { cn } from '@/lib/utils';

const TimePicker = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        type="time"
        className={cn(
          'input-premium cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
TimePicker.displayName = 'TimePicker';

export { TimePicker };