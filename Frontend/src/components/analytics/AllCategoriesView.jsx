import React, { useState, useEffect } from 'react';
import API_URL from '@/services/api.config';
import { getPerformanceColor } from './utils';
import AnalyticsCharts from './AnalyticsCharts';

const AllCategoriesView = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({});
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const categoryTypes = ['cable', 'peripheral', 'accessory'];
      const results = {};
      const allItemsList = [];

      for (const category of categoryTypes) {
        try {
          const res = await fetch(`${API_URL}/api/analytics/category/${category}`);
          if (res.ok) {
            const data = await res.json();
            results[category] = data;
            allItemsList.push(...data.items);
          }
        } catch (err) {
          console.error(`Error loading ${category}:`, err);
        }
      }

      setCategories(results);
      setAllItems(allItemsList);
    } catch (err) {
      console.error('Error loading all categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-white/60">Loading...</span>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    cable: 'Cables',
    peripheral: 'Peripherals',
    accessory: 'Accessories'
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-400/90';
      case 'Good': return 'text-cyan-400/90';
      case 'Fair': return 'text-amber-400/90';
      case 'Poor': return 'text-rose-400/90';
      case 'New': return 'text-white/40';
      default: return 'text-white/70';
    }
  };

  return (
    <div className="space-y-6">
      {/* Per-Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categories).map(([category, data]) => (
          data && (
            <div key={category} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white/80">
                  {categoryLabels[category] || category}
                </h4>
                <span className="text-xs text-white/40">
                  {data.items?.length || 0} items
                </span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Avg Failure Rate</span>
                  <span className="text-white/80 font-medium">{data.avg_failure_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Avg Lifespan</span>
                  <span className="text-white/80 font-medium">{data.avg_lifespan} mo</span>
                </div>
                {data.best_performer && (
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <p className="text-white/40 mb-1">Best performer</p>
                    <p className="text-emerald-400/90 font-medium truncate">
                      {data.best_performer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts items={allItems} />

      {/* Items Table - Compact */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
        <h3 className="text-base font-medium text-white/80 mb-4">All Items</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Item</th>
                <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Outputs</th>
                <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Failure</th>
                <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Lifespan</th>
                <th className="text-right py-2 px-3 text-white/50 font-medium text-xs uppercase tracking-wide">Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categories).map(([category, data]) => (
                data?.items?.map((item, index) => (
                  <tr 
                    key={`${category}-${index}`} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-white/90 font-medium text-sm">{item.item_name}</span>
                        <span className="text-[10px] uppercase tracking-wide text-white/40">
                          {categoryLabels[category] || category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-white/70">{item.total_outputs}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={item.failure_rate > 10 ? 'text-rose-400/90' : 'text-emerald-400/90'}>
                        {item.failure_rate}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-white/70">
                      {item.avg_lifespan_months > 0 ? `${item.avg_lifespan_months} mo` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-medium ${getRatingColor(item.performance_rating)}`}>
                        {item.performance_rating}
                      </span>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesView;