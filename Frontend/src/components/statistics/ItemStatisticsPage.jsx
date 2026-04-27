import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Box, CheckCircle2, ArrowUpRight, BarChart3, Table2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const ItemStatisticsPage = ({ assets = [], availableItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Inicializar: leer item de URL
  useEffect(() => {
    if (!isInitialized) {
      const params = new URLSearchParams(location.search);
      const itemFromUrl = params.get('item');
      
      if (itemFromUrl) {
        setSelectedItem(decodeURIComponent(itemFromUrl));
      } else if (availableItems.length > 0) {
        setSelectedItem(availableItems[0]);
      }

      // Fechas por defecto (último mes) - para la gráfica
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      setDateRange({
        start: oneMonthAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      });
      
      setIsInitialized(true);
    }
  }, [location.search, availableItems, isInitialized]);

  // ✅ Filtrar assets SOLO por nombre del item (SIN filtro de fechas)
  const itemAssets = useMemo(() => {
    if (!selectedItem) return [];
    
    return assets.filter(a => {
      const name = a.nombre || a.asset_type || a.name || a.item || '';
      return name === selectedItem;
    });
  }, [assets, selectedItem]);  // 👈 Quitamos dateRange de las dependencias

  // ✅ Stats del item
  const stats = useMemo(() => {
    const total = itemAssets.length;
    const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    const assigned = total - available;
    return { total, available, assigned };
  }, [itemAssets]);

  // ✅ Alerta de stock bajo
  const lowStockAlert = useMemo(() => {
    if (!selectedItem || itemAssets.length === 0) return null;
    
    const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    
    if (available < 50 && available > 0) {
      return {
        item: selectedItem,
        available,
        total: itemAssets.length,
        severity: available <= 3 ? 'critical' : 'warning'
      };
    }
    return null;
  }, [itemAssets, selectedItem]);

  // ✅ Datos para la gráfica
  const chartData = useMemo(() => {
    if (!selectedItem) return {  data: [], config: viewMode };
    
    const relevantAssets = itemAssets.filter(a => a.fecha_salida && a.fecha_salida.trim() !== '');
    const now = new Date();
    
    let groups = [];
    
    if (viewMode === 'day') {
      const todayStr = now.toISOString().split('T')[0];
      groups = [{ time: todayStr, count: 0 }];
    } else if (viewMode === 'week') {
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 7));
        const weekKey = `W${i === 0 ? 'Current' : i}`;
        groups.push({ time: weekKey, count: 0, label: `Week -${i}` });
      }
    } else if (viewMode === 'month') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('en-US', { month: 'short' });
        groups.push({ time: monthKey, count: 0, label: monthKey });
      }
    }

    relevantAssets.forEach(a => {
      const exitDate = new Date(a.fecha_salida);
      if (viewMode === 'day') {
        const todayStr = now.toISOString().split('T')[0];
        if (a.fecha_salida.startsWith(todayStr)) groups[0].count++;
      } else if (viewMode === 'week') {
        const diffTime = Math.abs(now - exitDate);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        if (diffWeeks < 4) {
          const idx = 3 - diffWeeks;
          if (groups[idx]) groups[idx].count++;
        }
      } else if (viewMode === 'month') {
        const diffMonths = (now.getFullYear() - exitDate.getFullYear()) * 12 + (now.getMonth() - exitDate.getMonth());
        if (diffMonths < 3) {
          const idx = 2 - diffMonths;
          if (groups[idx]) groups[idx].count++;
        }
      }
    });

    return { 
      data: groups.map(g => ({ name: g.label || g.time, value: g.count })),
      config: viewMode 
    };
  }, [itemAssets, selectedItem, viewMode]);


  const yAxisConfig = useMemo(() => {
    const maxValue = chartData.data && chartData.data.length > 0 
      ? Math.max(...chartData.data.map(d => d.value || 0), 0)
      : 0;
    
    let step = viewMode === 'day' ? 2 : viewMode === 'week' ? 5 : 10;
    const minTicks = 2;
    const calculatedMax = Math.max(maxValue, step * minTicks);
    const roundedMax = Math.ceil(calculatedMax / step) * step;
    
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += step) {
      ticks.push(i);
    }
    
    return { ticks, domain: [0, roundedMax] };
  }, [viewMode, chartData.data]);

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
          <p>Loading item statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-6">
      
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/')} 
            className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Item Statistics</h2>
            <p className="text-slate-400 text-sm">Detailed analytics for: <span className="text-cyan-400">{selectedItem}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Real-time Analytics</span>
        </div>
      </div>

      {/* 🔹 Alerta de stock bajo */}
      {lowStockAlert && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-rose-950/40 to-orange-950/40 backdrop-blur-md border border-rose-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
              <p className="text-slate-400 text-sm">This item requires attention</p>
            </div>
          </div>
          
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            lowStockAlert.severity === 'critical' 
              ? 'bg-rose-950/30 border-rose-500/30' 
              : 'bg-orange-950/30 border-orange-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${
                lowStockAlert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
              }`} />
              <div>
                <p className="text-white font-medium text-sm">{lowStockAlert.item}</p>
                <p className="text-slate-400 text-xs">
                  Only <span className="text-white font-semibold">{lowStockAlert.available}</span> of {lowStockAlert.total} units available
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                lowStockAlert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
              }`}>
                {lowStockAlert.available <= 3 ? 'Order Now!' : 'Reorder Soon'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Units</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Box className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Available</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.available}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-amber-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Assigned</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{stats.assigned}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* 🔹 Filter Configuration (solo viewMode) */}
      <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Filter Configuration</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Selected Asset</label>
            <div className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-cyan-400 font-medium">
              {selectedItem}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Time View</label>
            <div className="flex bg-slate-950/50 border border-white/10 rounded-lg p-1">
              {['day', 'week', 'month'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === mode 
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Gráfica - CON FIX DE CONTAINER */}
      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Liberaciones (Exits)
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/5">
            {viewMode.toUpperCase()}
          </span>
        </div>
        
        {/* 👇 FIX: Contenedor con altura explícita */}
        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <LineChart data={chartData.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                ticks={yAxisConfig.ticks}
                domain={yAxisConfig.domain}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #334155', 
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                cursor={{ stroke: '#38bdf8', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-cyan-400" />
                  Asset Inventory List
                </h3>
                <span className="text-xs text-slate-400">{itemAssets.length} records</span>
              </div>
              
              <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                    <tr className="border-b border-white/10">
                      <th className="pb-3 pt-1 text-slate-400 font-medium">Item</th>
                      <th className="pb-3 pt-1 text-slate-400 font-medium">Serial</th>
                      <th className="pb-3 pt-1 text-slate-400 font-medium">Status</th>
                      <th className="pb-3 pt-1 text-slate-400 font-medium">Exit Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {itemAssets.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">No assets found matching filters</td>
                      </tr>
                    ) : (
                      itemAssets.map((asset, i) => {
                        const isAvailable = !asset.fecha_salida || asset.fecha_salida.trim() === '';
                        return (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 text-slate-200 font-medium truncate max-w-[200px]">
                              {asset.nombre || asset.name || 'N/A'}
                            </td>
                            <td className="py-3 text-slate-400 font-mono text-xs">{asset.serial || '-'}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isAvailable 
                                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-900/30 text-amber-400 border border-amber-500/20'
                              }`}>
                                {isAvailable ? 'In Stock' : 'Assigned'}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 text-xs">
                              {asset.fecha_salida || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemStatisticsPage;