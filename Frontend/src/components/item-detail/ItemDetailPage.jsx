import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, TrendingUp, AlertCircle, 
  CheckCircle2, XCircle, Box, ShieldAlert, Activity, ChevronDown 
} from 'lucide-react';
import { getAssets } from '@/services/almacenService';
import AnimatedBackground from '@/components/AnimatedBackground';
import LightRays from '@/components/LightRays';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 w-64 bg-slate-800/50 rounded-lg" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-slate-800/40 rounded-xl border border-white/5" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-64 bg-slate-800/40 rounded-2xl border border-white/5" />
      <div className="h-64 bg-slate-800/40 rounded-2xl border border-white/5" />
    </div>
  </div>
);

const ItemDetailPage = () => {
  const { itemName } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const decodedItemName = useMemo(() => {
    return itemName ? decodeURIComponent(itemName) : '';
  }, [itemName]);

  const uniqueItems = useMemo(() => {
    if (!assets.length) return [];
    const names = new Set();
    assets.forEach(a => {
      const name = a.nombre || a.asset_type || a.name || a.item || '';
      if (name) names.add(name);
    });
    return Array.from(names).sort();
  }, [assets]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const cached = sessionStorage.getItem('inventory_assets_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setAssets(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem('inventory_assets_cache');
        }
      }

      try {
        const data = await getAssets();
        if (isMounted) {
          setAssets(data);
          try { sessionStorage.setItem('inventory_assets_cache', JSON.stringify(data)); } catch(e) {}
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading assets:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const itemAssets = useMemo(() => {
    if (!assets.length) return [];
    return assets.filter(a => {
      const name = a.nombre || a.asset_type || a.name || a.item || '';
      return name === decodedItemName;
    });
  }, [assets, decodedItemName]);

  const stats = useMemo(() => {
    const total = itemAssets.length;
    const inStock = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    const inUse = total - inStock;
    const released = itemAssets.filter(a => a.tipo_retorno === 'Return').length;
    const missing = itemAssets.filter(a => a.tipo_retorno === 'Missing').length;
    const damaged = itemAssets.filter(a => a.tipo_retorno === 'Damage').length;
    const utilizationRate = total > 0 ? ((inUse / total) * 100).toFixed(1) : 0;
    return { total, inStock, inUse, released, missing, damaged, utilizationRate };
  }, [itemAssets]);

  const handleBack = () => navigate('/admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center">
        <AnimatedBackground />
        <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
          <LightRays raysOrigin="top-center" raysColor="#38BDF8" raysSpeed={1.2} lightSpread={2.5} rayLength={3.5} followMouse={true} mouseInfluence={0.25} noiseAmount={0.08} distortion={0.5} fadeDistance={1.5} saturation={1.2} />
        </div>
        <div className="relative z-10 w-full max-w-7xl px-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (itemAssets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
          <LightRays raysOrigin="top-center" raysColor="#38BDF8" raysSpeed={1.2} lightSpread={2.5} rayLength={3.5} followMouse={true} mouseInfluence={0.25} noiseAmount={0.08} distortion={0.5} fadeDistance={1.5} saturation={1.2} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <button onClick={handleBack} className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all mb-8">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="text-center py-20 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5">
            <Box className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No records found</h3>
            <p className="text-slate-400">No active assets found for <span className="text-cyan-400 font-medium">{decodedItemName}</span></p>
          </div>
        </div>
      </div>
    );
  }

  const ProgressBar = ({ label, value, max, colorClass, icon: Icon }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-300">
            <Icon className="w-4 h-4 text-slate-500" /> {label}
          </span>
          <span className="font-medium text-white">{value}</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-700 ease-out rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
        <LightRays raysOrigin="top-center" raysColor="#38BDF8" raysSpeed={1.2} lightSpread={2.5} rayLength={3.5} followMouse={true} mouseInfluence={0.25} noiseAmount={0.08} distortion={0.5} fadeDistance={1.5} saturation={1.2} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* 🔹 Header with Quick Item Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <button 
            onClick={handleBack} 
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="relative w-full md:w-80">
            <select
              value={decodedItemName}
              onChange={(e) => {
                if (e.target.value && e.target.value !== decodedItemName) {
                  navigate(`/admin/items/${encodeURIComponent(e.target.value)}`);
                }
              }}
              className="w-full appearance-none bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-200 text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all cursor-pointer hover:border-white/20"
            >
              {uniqueItems.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="text-left md:text-right shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight truncate max-w-[200px] md:max-w-xs">
              {decodedItemName}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Detailed inventory analysis</p>
          </div>
        </div>

        {/* 🔹 Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Units', value: stats.total, icon: Package, color: 'text-slate-200', bg: 'bg-slate-800/50' },
                { label: 'Total Stock', value: stats.inStock, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
                { label: 'In Use', value: stats.inUse, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-900/20' },
                { label: 'Utilization', value: `${stats.utilizationRate}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
              ].map((stat, i) => (
                <div key={i} className={`p-5 rounded-xl border border-white/5 ${stat.bg} backdrop-blur-md hover:border-white/10 transition-all`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-60`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-400" /> Inventory Distribution
              </h3>
              <div className="space-y-5">
                <ProgressBar label="Available" value={stats.inStock} max={stats.total} colorClass="bg-emerald-500" icon={CheckCircle2} />
                <ProgressBar label="Assigned / In Use" value={stats.inUse} max={stats.total} colorClass="bg-amber-500" icon={Activity} />
                <ProgressBar label="Returned" value={stats.released} max={stats.total} colorClass="bg-sky-500" icon={ArrowLeft} />
                <div className="pt-4 border-t border-white/5">
                  <ProgressBar label="Reported Issues" value={stats.missing + stats.damaged} max={stats.total} colorClass="bg-rose-500" icon={ShieldAlert} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Return', value: stats.released, color: 'text-sky-400', dot: 'bg-sky-500' },
                  { label: 'Missing', value: stats.missing, color: 'text-rose-400', dot: 'bg-rose-500' },
                  { label: 'Damage', value: stats.damaged, color: 'text-orange-400', dot: 'bg-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="text-slate-300 text-sm">{item.label}</span>
                    </div>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {(stats.missing > 0 || stats.damaged > 0) && (
              <div className="p-6 rounded-2xl bg-rose-950/30 backdrop-blur-xl border border-rose-500/20 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-rose-500/10"><AlertCircle className="w-5 h-5 text-rose-400" /></div>
                  <h3 className="text-white font-semibold">Active Alerts</h3>
                </div>
                <div className="space-y-3">
                  {stats.missing > 0 && (
                    <div className="flex items-start gap-3 text-rose-300 text-sm">
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span><strong>{stats.missing}</strong> units reported missing</span>
                    </div>
                  )}
                  {stats.damaged > 0 && (
                    <div className="flex items-start gap-3 text-orange-300 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span><strong>{stats.damaged}</strong> units with recorded damage</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Quick Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Total Registered</span><span className="text-slate-200 font-medium">{stats.total}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Usage Rate</span><span className="text-cyan-400 font-medium">{stats.utilizationRate}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-medium ${stats.inStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{stats.inStock > 0 ? '● Available' : '○ Out of Stock'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;