import React from 'react';
import { getFailureRateColor } from './utils';

const BarChart = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <p className="text-sm text-slate-500 text-center">No data available for chart</p>
      </div>
    );
  }

  const maxFailure = Math.max(...items.map(i => i.failure_rate), 30);

  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Failure Rate Comparison
      </h4>
      <div className="space-y-3">
        {items.map((item, index) => {
          const barWidth = item.total_outputs > 0 
            ? Math.min((item.failure_rate / maxFailure) * 100, 100) 
            : 0;
          const barColor = getFailureRateColor(item.failure_rate);
          const showLabelInside = barWidth > 15;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-xs text-slate-400 truncate" title={item.item_name}>
                {item.item_name}
              </div>
              <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${barWidth}%` }}
                >
                  {showLabelInside && (
                    <span className="text-[10px] text-white font-bold">
                      {item.failure_rate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 text-xs text-right">
                {item.total_outputs === 0 ? (
                  <span className="text-slate-500 italic">No data</span>
                ) : !showLabelInside ? (
                  <span className="text-slate-300">{item.failure_rate.toFixed(1)}%</span>
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