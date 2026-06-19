import React, { useState, useEffect } from 'react';
import API_URL from '@/services/api.config';
import BarChart from './BarChart';
import { getPerformanceColor } from './utils';

const CategoryComparison = ({ category }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && category !== 'all') {
      loadCategoryData(category);
    }
  }, [category]);

  const loadCategoryData = async (cat) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/category/${cat}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Error loading category data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
        <p className="text-white/50">No data available for this category</p>
      </div>
    );
  }

  const categoryLabels = {
    cable: 'Cables',
    peripheral: 'Peripherals',
    accessory: 'Accessories'
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-base font-medium text-white/80 mb-4">
        {categoryLabels[category] || category} Performance
      </h3>
      
      {/* Bar Chart */}
      <BarChart items={data.items} />

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Item</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Outputs</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Failure Rate</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Lifespan</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Cost/Use</th>
              <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 text-white/90 font-medium">{item.item_name}</td>
                <td className="py-3 px-3 text-right text-white/70">{item.total_outputs}</td>
                <td className="py-3 px-3 text-right">
                  <span className={item.failure_rate > 10 ? 'text-rose-400/90' : 'text-emerald-400/90'}>
                    {item.failure_rate}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-white/70">{item.avg_lifespan_months} mo</td>
                <td className="py-3 px-3 text-right text-white/70">${item.cost_per_use.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">
                  <span className={`font-medium ${getPerformanceColor(item.performance_rating)}`}>
                    {item.performance_rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Best/Worst */}
      {(data.best_performer || data.worst_performer) && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-6 text-xs">
          {data.best_performer && (
            <div>
              <span className="text-white/40">Best: </span>
              <span className="text-emerald-400/90 font-medium">{data.best_performer}</span>
            </div>
          )}
          {data.worst_performer && data.worst_performer !== data.best_performer && (
            <div>
              <span className="text-white/40">Needs attention: </span>
              <span className="text-rose-400/90 font-medium">{data.worst_performer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryComparison;