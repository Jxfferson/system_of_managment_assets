import React from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, subtitle }) => (
  <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs mb-1">{title}</p>
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-slate-600 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const AssetStats = ({ assets }) => {
  const totalAssets = assets.length;
  // Usamos 'fecha_entrada'
  const totalEntries = assets.filter(
    (a) => a.fecha_ingreso && a.fecha_ingreso.trim() !== ''
  ).length;

  // Usamos 'fecha_salida'
  const totalExits = assets.filter(
    (a) => a.fecha_salida && a.fecha_salida.trim() !== ''
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      <StatCard
        title="Total Assets"
        value={totalAssets}
        icon={Package}
        colorClass="text-slate-300"
        bgClass="bg-slate-500/10"
        subtitle="Registered in the system"
      />

      <StatCard
        title="Total Entries"
        value={totalEntries}
        icon={ArrowDownToLine}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/10"
        subtitle="With entry date"
      />

      <StatCard
        title="Total Exits"
        value={totalExits}
        icon={ArrowUpFromLine}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        subtitle="With exit date"
      />
      
    </div>
  );
};

export default AssetStats;