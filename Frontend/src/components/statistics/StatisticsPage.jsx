import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Box, CheckCircle2, ArrowUpRight, BarChart3, Table2, Clock, ChevronDown, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const StatisticsPage = ({ assets = [], availableItems = [] }) => {
  const location = useLocation();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && availableItems.length > 0) {
      const stateItem = location.state?.initialItem;
      
      if (stateItem) {
        console.log('📊 Viniendo de AssetStats con:', stateItem);
        setSelectedItems([stateItem]);
      } else {
        console.log('📊 Entrada normal - todos los items');
        setSelectedItems([...availableItems]);
      }
      
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      setDateRange({
        start: oneMonthAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      });
      
      setIsInitialized(true);
      window.history.replaceState({}, document.title);
    }
  }, [availableItems, isInitialized, location.state]);

  const baseAssets = useMemo(() => {
    let filtered = [...assets];
    
    const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    
    if (!isAllSelected) {
      filtered = filtered.filter(a => {
        const name = a.nombre || a.asset_type || a.name || a.item || '';
        return selectedItems.includes(name);
      });
    }
    
    
    return filtered;
  }, [assets, selectedItems, availableItems.length]);

  const stats = useMemo(() => {
    const total = baseAssets.length;
    const available = baseAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    const assigned = total - available;
    return { total, available, assigned };
  }, [baseAssets]);

  const lowStockAlerts = useMemo(() => {
    const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    const alerts = [];
    
    const itemsGrouped = {};
    baseAssets.forEach(asset => {
      const name = asset.nombre || asset.asset_type || asset.name || asset.item || '';
      if (!itemsGrouped[name]) {
        itemsGrouped[name] = { total: 0, available: 0 };
      }
      itemsGrouped[name].total++;
      if (!asset.fecha_salida || asset.fecha_salida.trim() === '') {
        itemsGrouped[name].available++;
      }
    });
    // Aca se cambia el contador, en este caso es cuando existan menosde 50 unidades disponibles, se muestra una alerta, y si es menor o igual a 3 se muestra una alerta critica
    Object.entries(itemsGrouped).forEach(([itemName, counts]) => {
      if (counts.available < 50 && counts.available > 0) {
        alerts.push({
          item: itemName,
          available: counts.available,
          total: counts.total,
          severity: counts.available <= 3 ? 'critical' : 'warning'
        });
      }
    });
    
    return alerts.sort((a, b) => a.available - b.available);
  }, [baseAssets, selectedItems, availableItems.length]);

  const chartData = useMemo(() => {
  const relevantAssets = baseAssets.filter(a => a.fecha_salida && a.fecha_salida.trim() !== '');
  
  const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;
  const isSingleItem = selectedItems.length === 1;
  
  if (isSingleItem) {
    const now = new Date();
    const selectedItem = selectedItems[0];
    const itemAssets = relevantAssets.filter(a => {
      const name = a.nombre || a.asset_type || a.name || a.item || '';
      return name === selectedItem;
    });
    
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

    itemAssets.forEach(a => {
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

  } else {
    if (!dateRange.start || !dateRange.end) return { data: [], config: 'all' };

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    let aggregationLevel = 'day';
    if (totalDays > 90) aggregationLevel = 'month';
    else if (totalDays > 30) aggregationLevel = 'week';
    
    const groupedData = {};
    
    relevantAssets.forEach(a => {
      const exitDate = new Date(a.fecha_salida);
      let key = '';
      
      if (aggregationLevel === 'day') {
        key = exitDate.toISOString().split('T')[0];
      } else if (aggregationLevel === 'week') {
        const weekNum = Math.floor((exitDate - start) / (1000 * 60 * 60 * 24 * 7));
        key = `Week ${weekNum + 1}`;
      } else if (aggregationLevel === 'month') {
        key = exitDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      }
      
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key]++;
    });
    
    const data = Object.entries(groupedData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });
    
    
    return {  data, config: 'range' };
  }
}, [baseAssets, selectedItems, availableItems.length, viewMode, dateRange]);

  const calculateYAxisTicks = (maxValue, step) => {
    const roundedMax = Math.ceil(maxValue / step) * step;
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  const yAxisConfig = useMemo(() => {
    const isAllItems = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    const isSingleItem = selectedItems.length === 1;
    
    const maxValue = chartData.data && chartData.data.length > 0 
      ? Math.max(...chartData.data.map(d => d.value || 0), 0)
      : 0;
    
    let step = 10;
    
    if (!isAllItems) {
      if (viewMode === 'day') step = 2;
      else if (viewMode === 'week') step = 5;
      else if (viewMode === 'month') step = 10;
    }
    
    const minTicks = 2;
    const calculatedMax = Math.max(maxValue, step * minTicks);
    const roundedMax = Math.ceil(calculatedMax / step) * step;
    
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += step) {
      ticks.push(i);
    }
    
    return { 
      ticks,
      domain: [0, roundedMax]
    };
  }, [selectedItems.length, availableItems.length, viewMode, chartData.data]);

    const toggleItem = (itemName) => {
    setSelectedItems(prev => {
        if (prev.includes(itemName)) {
        if (prev.length === 2) {
            return prev; 
        }
        return prev.filter(i => i !== itemName);
        }
        return [...prev, itemName];
    });
    };

    const removeItem = (itemName) => {
    setSelectedItems(prev => {
        if (prev.length === 2) {
        return prev; 
        }
        return prev.filter(i => i !== itemName);
    });
    };

  const toggleAll = () => {
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...availableItems]);
    }
  };

  const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Statistics Dashboard</h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Real-time Asset Analytics</span>
        </div>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-rose-950/40 to-orange-950/40 backdrop-blur-md border border-rose-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
              <p className="text-slate-400 text-sm">{lowStockAlerts.length} items require attention</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {lowStockAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-rose-950/30 border-rose-500/30' 
                    : 'bg-orange-950/30 border-orange-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium text-sm">{alert.item}</p>
                    <p className="text-slate-400 text-xs">
                      Only <span className="text-white font-semibold">{alert.available}</span> of {alert.total} units available
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    alert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
                  }`}>
                    {alert.available <= 3 ? 'Order Now!' : 'Reorder Soon'}
                  </p>
                  <p className="text-slate-500 text-xs">Low stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Filter Configuration</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative" style={{ zIndex: 9999 }}>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Select Asset</label>
            
            {!isAllSelected && selectedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedItems.slice(0, 3).map(item => (
                  <span 
                    key={item} 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-900/30 text-cyan-400 text-xs border border-cyan-500/20"
                  >
                    {item.length > 15 ? item.substring(0, 15) + '...' : item}
                    <button onClick={() => removeItem(item)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedItems.length > 3 && (
                  <span className="text-xs text-slate-500">+{selectedItems.length - 3} more</span>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 hover:border-white/20 transition-all"
            >
              <span className="text-slate-400">
                {isAllSelected ? 'All Items' : `${selectedItems.length} item(s) selected`}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div 
                className="absolute z-[99999] w-full mt-1 max-h-60 overflow-auto bg-slate-950 border border-white/10 rounded-lg shadow-2xl"
                style={{ zIndex: 99999, position: 'relative' }}
              >
                <label className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors sticky top-0 bg-slate-950">
                  <input
                    type="checkbox"
                    checked={isAllSelected && availableItems.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-sm font-medium text-white">Select All</span>
                </label>
                
                {availableItems.map(item => (
                  <label 
                    key={item} 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      onChange={() => toggleItem(item)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-sm text-slate-300 truncate">{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {!isAllSelected && selectedItems.length === 1 ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Liberaciones (Exits)
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/5">
            {isAllSelected ? 'All Assets' : selectedItems.length === 1 ? selectedItems[0] : `${selectedItems.length} items`}
          </span>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <span className="text-xs text-slate-400">{baseAssets.length} records</span>
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
              {baseAssets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">No assets found matching filters</td>
                </tr>
              ) : (
                baseAssets.map((asset, i) => {
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

export default StatisticsPage;