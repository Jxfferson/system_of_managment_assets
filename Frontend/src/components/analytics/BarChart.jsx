import React from 'react';

const BarChart = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-white/5 rounded border border-white/10">
        <p className="text-sm text-white/40 text-center">No data available</p>
      </div>
    );
  }

  const maxFailure = Math.max(...items.map(i => i.failure_rate), 30);

  const getBarColor = (rate) => {
    if (rate > 15) return 'bg-rose-400/60';
    if (rate > 8) return 'bg-amber-400/60';
    return 'bg-emerald-400/60';
  };

  return (
    <div className="p-4 bg-white/5 rounded border border-white/10">
      <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-4">
        Failure Rate Comparison
      </h4>
      <div className="space-y-3">
        {items.map((item, index) => {
          const barWidth = item.total_outputs > 0 
            ? Math.min((item.failure_rate / maxFailure) * 100, 100) 
            : 0;
          const barColor = getBarColor(item.failure_rate);
          const showLabelInside = barWidth > 20;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-xs text-white/60 truncate" title={item.item_name}>
                {item.item_name}
              </div>
              <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${barColor} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${barWidth}%` }}
                >
                  {showLabelInside && (
                    <span className="text-[10px] text-white/90 font-medium">
                      {item.failure_rate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 text-xs text-right">
                {item.total_outputs === 0 ? (
                  <span className="text-white/30 italic">No data</span>
                ) : !showLabelInside ? (
                  <span className="text-white/70">{item.failure_rate.toFixed(1)}%</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;