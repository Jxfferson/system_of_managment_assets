import React from 'react';
import { Package, List, BarChart3 } from 'lucide-react';

export const AdminHeader = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      <h1 className="text-3xl font-bold text-white">Asset Management</h1>
      <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/10">
        <button
          onClick={() => onTabChange('assets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'assets'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          Assets
        </button>
        <button
          onClick={() => onTabChange('items')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'items'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          Items
        </button>
        <button
          onClick={() => onTabChange('statistics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'statistics'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Statistics
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;