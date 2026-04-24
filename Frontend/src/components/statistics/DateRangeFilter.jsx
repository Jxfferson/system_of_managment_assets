import React from 'react';
import { Calendar, Package } from 'lucide-react';

export const DateRangeFilter = ({ dateRange, setDateRange, selectedItem, setSelectedItem, availableItems = [] }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/30 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-slate-300">Filter by Date Range</span>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-slate-400 text-xs mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        
        {/* End Date */}
        <div>
          <label className="block text-slate-400 text-xs mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        
        {/* Item Filter */}
        <div>
          <label className="block text-slate-400 text-xs mb-2">Filter by Item</label>
          <div className="relative">
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full appearance-none px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
            >
              <option value="">All Items</option>
              {availableItems.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Active filters badge */}
      {(dateRange.startDate || dateRange.endDate || selectedItem) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
          {selectedItem && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-900/30 text-cyan-400 text-xs">
              Item: {selectedItem}
              <button 
                onClick={() => setSelectedItem('')}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          )}
          {dateRange.startDate && dateRange.endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs">
              {dateRange.startDate} → {dateRange.endDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
};