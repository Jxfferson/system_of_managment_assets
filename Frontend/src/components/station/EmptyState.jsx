import React from 'react';
import { Package, Plus } from 'lucide-react';

const EmptyState = ({ onAdd }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
        <Package className="w-8 h-8 text-cyan-400/60" />
      </div>
      <p className="text-slate-300 font-medium">No assets found at this station</p>
      <p className="text-slate-500 text-sm mt-1 mb-4">Click the + button to add one</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add First Item
      </button>
    </div>
  );
};

export default EmptyState;