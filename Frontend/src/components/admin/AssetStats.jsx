import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowDownToLine, ArrowUpFromLine, ChevronDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, subtitle, children }) => (
  <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs mb-1">{title}</p>
        <p className={`text-2xl font-semibold ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-slate-600 text-xs mt-1">{subtitle}</p>}
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

const AssetStats = ({ assets = [], availableItems = [] }) => {
  const navigate = useNavigate();
  const getItemName = (a) => a.nombre || a.asset_type || a.name || a.item || '';

  // Calcular stats globales (sin filtrar)
  const globalStats = useMemo(() => {
    const total = assets.length;
    const exits = assets.filter(a => a.fecha_salida?.trim()).length;
    const stock = total - exits;
    const returns = assets.filter(a => a.tipo_retorno === 'Return').length;
    const missing = assets.filter(a => a.tipo_retorno === 'Missing').length;
    const damage = assets.filter(a => a.tipo_retorno === 'Damage').length;
    return { total, stock, exits, returns, missing, damage };
  }, [assets]);

  // Calcular disponibilidad por item
  const itemsAvailability = useMemo(() => {
    return availableItems.map(itemName => {
      const itemAssets = assets.filter(a => getItemName(a) === itemName);
      const total = itemAssets.length;
      const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
      
      return {
        name: itemName,
        total,
        available
      };
    }).sort((a, b) => b.total - a.total);
  }, [assets, availableItems]);

  const handleItemSelect = (itemName) => {
    if (itemName) {
      // Redirigir a Statistics con el item seleccionado
      navigate('/admin/statistics', { state: { initialItem: itemName } });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🔹 GLOBAL STATS (Sin filtrar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={globalStats.total}
          icon={Package}
          colorClass="text-slate-300"
          bgClass="bg-slate-500/10"
          subtitle="Registered in the system"
        />
        <StatCard
          title="Total Stock"
          value={globalStats.stock}
          icon={ArrowDownToLine}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/10"
          subtitle="Currently in inventory"
        />
        <StatCard
          title="Total Exits"
          value={globalStats.exits}
          icon={ArrowUpFromLine}
          colorClass="text-amber-400"
          bgClass="bg-amber-500/10"
          subtitle="With exit date"
        />
        <StatCard
          title="Distribution"
          value=""
          icon={null}
          colorClass="text-cyan-400"
          bgClass="bg-cyan-500/10"
          subtitle="By return type"
        >
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Return
              </span>
              <span className="text-slate-400 font-semibold">{globalStats.returns}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Missing
              </span>
              <span className="text-red-400 font-semibold">{globalStats.missing}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                Damage
              </span>
              <span className="text-orange-400 font-semibold">{globalStats.damage}</span>
            </div>
          </div>
        </StatCard>
      </div>

      {/* 📦 SPECIFIC ITEMS DROPDOWN */}
      {itemsAvailability.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-sm font-medium">Specific Items</span>
          </div>

          <div className="relative">
            <select
              onChange={(e) => handleItemSelect(e.target.value)}
              defaultValue=""
              className="w-full appearance-none bg-slate-900/60 border border-white/10 text-slate-300 text-sm rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all cursor-pointer hover:border-white/20"
            >
              <option value="" disabled>— Select an item —</option>
              {itemsAvailability.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} — {item.total} ({item.available} Available)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetStats;