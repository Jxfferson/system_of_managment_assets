import React, { useMemo } from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, subtitle, children }) => (
  <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs mb-1">{title}</p>
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-white-600 text-xs mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
    {children}
  </div>
);

const AssetStats = ({ assets }) => {

  const totalAssets = assets.length;

  const totalExits = assets.filter(
    (a) => a.fecha_salida && a.fecha_salida.trim() !== ''
  ).length;

  const totalEntries = assets.filter(
    (a) => !a.fecha_salida || a.fecha_salida.trim() === ''
  ).length;

  const returnTypeStats = useMemo(() => {
    const returns = assets.filter(a => 
      a.tipo_retorno === 'Return'
    ).length;
    
    const missing = assets.filter(a => 
      a.tipo_retorno === 'Missing'
    ).length;
    
    const damage = assets.filter(a => 
      a.tipo_retorno === 'Damage'
    ).length;
    
    return { returns, missing, damage };
  }, [assets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      <StatCard
        title="Total Assets"
        value={totalAssets}
        icon={Package}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="Registered in the system"
      />

      <StatCard
        title="Total Stock"
        value={totalEntries}
        icon={ArrowDownToLine}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="Currently in inventory"
      />

      <StatCard
        title="Total Exits"
        value={totalExits}
        icon={ArrowUpFromLine}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="With exit date"
      />

      <StatCard
        title="Distribution"
        value=""
        icon={null}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="By return type"
      >
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Return
            </span>
            <span className="text-slate-400 font-semibold">{returnTypeStats.returns}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Missing
            </span>
            <span className="text-red-400 font-semibold">{returnTypeStats.missing}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Damage
            </span>
            <span className="text-slate-400 font-semibold">{returnTypeStats.damage}</span>
          </div>
        </div>
      </StatCard>

    </div>
  );
};

export default AssetStats;