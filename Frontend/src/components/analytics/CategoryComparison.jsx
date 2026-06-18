import React from 'react';
import BarChart from './BarChart';
import { getPerformanceColor, formatCategoryName } from './utils';

const CategoryComparison = ({ category, data }) => {
  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">
        {formatCategoryName(category)} Performance
      </h3>
      
      {/* Bar Chart */}
      <BarChart items={data.items} />

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Item</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Outputs</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Failure Rate</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Lifespan</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Cost/Use</th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 text-white font-medium">{item.item_name}</td>
                <td className="py-3 px-3 text-slate-300">{item.total_outputs}</td>
                <td className="py-3 px-3">
                  <span className={item.failure_rate > 10 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {item.failure_rate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-300">{item.avg_lifespan_months} mo</td>
                <td className="py-3 px-3 text-slate-300">${item.cost_per_use.toLocaleString()}</td>
                <td className="py-3 px-3">
                  <span className={`font-semibold ${getPerformanceColor(item.performance_rating)}`}>
                    {item.performance_rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Best/Worst Performer */}
      {(data.best_performer || data.worst_performer) && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <p className="text-sm text-emerald-300">
            {data.best_performer && (
              <span>
                <span className="font-semibold">✓ Best:</span> {data.best_performer}
              </span>
            )}
            {data.best_performer && data.worst_performer && (
              <span className="ml-4 text-rose-300">
                <span className="font-semibold">⚠️ Needs Attention:</span> {data.worst_performer}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryComparison;