import React from 'react';
import { Package, Monitor, HardDrive, Circle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs mb-1">{title}</p>
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const AssetStats = ({ assets }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Assets"
        value={assets.length}
        icon={Package}
        colorClass="text-slate-300"
        bgClass="bg-cyan-500/5"
      />
      <StatCard
        title="Available"
        value={assets.filter(a => a.status === 'available').length}
        icon={Circle}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/5"
      />
      <StatCard
        title="In Use"
        value={assets.filter(a => a.status === 'in-use').length}
        icon={Monitor}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/5"
      />
    </div>
  );
};

export default AssetStats;