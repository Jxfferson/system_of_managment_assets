import React, { useState, useEffect } from 'react';
import { X, History, Clock, Package, Filter, ArrowUpRight } from 'lucide-react';
import { formatRelativeTime } from '@/utils/timeFormatter';

const StationHistoryModal = ({ isOpen, stationName, onClose }) => {
  const [stationHistory, setStationHistory] = useState(null);
  const [fullHistory, setFullHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('');
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (isOpen && stationName) {
      setLoading(true);
      
      // Cargar assets de la estación para el filtro
      fetch(`http://localhost:8000/api/almacen?destino=${encodeURIComponent(stationName)}`)
        .then(res => {
          if (!res.ok) throw new Error('Error loading assets');
          return res.json();
        })
        .then(data => {
          console.log('Assets loaded:', data);
          setAssets(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error loading assets:', err);
          setAssets([]);
        });

      // Cargar historial
      Promise.all([
        fetch(`http://localhost:8000/api/almacen/station/${stationName}/history`).then(res => res.json()),
        fetch(`http://localhost:8000/api/almacen/station/${stationName}/history/full`).then(res => res.json())
      ])
        .then(([summary, full]) => {
          setStationHistory(summary);
          setFullHistory(Array.isArray(full) ? full : []);
        })
        .catch(err => {
          console.error('Error loading history:', err);
          setStationHistory(null);
          setFullHistory([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, stationName]);

  const getChangeTypeBadge = (type) => {
    const badges = {
      'ASSIGNED': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Assigned' },
      'UNASSIGNED': { color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Unassigned' },
      'MOVED_TO': { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', label: 'Moved To' },
      'MOVED_FROM': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Moved From' }
    };
    return badges[type] || { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: type };
  };

  const getConditionBadge = (condition) => {
    if (!condition) return null;
    const badges = {
      'Return': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Return' },
      'Damage': { color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Damage' },
      'Missing': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Missing' }
    };
    return badges[condition] || null;
  };

  const filteredHistory = selectedAssetFilter 
    ? fullHistory.filter(h => {
        const serialMatch = h.asset_serial === selectedAssetFilter || 
                           h.previous_asset_serial === selectedAssetFilter;
        const selectedAsset = assets.find(a => a.serial === selectedAssetFilter);
        const selectedName = selectedAsset?.name?.toLowerCase() || '';
        const nameMatch = (h.asset_name && h.asset_name.toLowerCase().includes(selectedName)) ||
                         (h.previous_asset_name && h.previous_asset_name.toLowerCase().includes(selectedName));
        return serialMatch || nameMatch;
      })
    : fullHistory;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 to-blue-950/50">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Station Change History
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono mt-1">{stationName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading history...</p>
            </div>
          ) : stationHistory && stationHistory.total_changes > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Total Changes</p>
                      <p className="text-2xl font-bold text-white">{stationHistory.total_changes}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Last Change</p>
                      <p className="text-sm font-bold text-white">{formatRelativeTime(stationHistory.last_change_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Current Asset</p>
                      <p className="text-sm font-bold text-white truncate max-w-[150px]">
                        {stationHistory.current_asset_name || 'N/A'}
                      </p>
                      {stationHistory.current_asset_serial && (
                        <p className="text-xs text-slate-500 font-mono">{stationHistory.current_asset_serial}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Change Details */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Last Change Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Change Type</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold border ${getChangeTypeBadge(stationHistory.last_change_type).color}`}>
                      {getChangeTypeBadge(stationHistory.last_change_type).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Changed At</p>
                    <p className="text-white font-medium">
                      {stationHistory.last_change_at ? new Date(stationHistory.last_change_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  
                  {stationHistory.previous_asset_name ? (
                    <>
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <p className="text-rose-400 text-xs font-semibold mb-1">Previous Asset</p>
                        <p className="text-white font-medium">{stationHistory.previous_asset_name}</p>
                        <p className="text-slate-400 font-mono text-xs">{stationHistory.previous_asset_serial}</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-400 text-xs font-semibold mb-1">Current Asset</p>
                        <p className="text-white font-medium">{stationHistory.current_asset_name}</p>
                        <p className="text-slate-400 font-mono text-xs">{stationHistory.current_asset_serial}</p>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                      <p className="text-slate-300 font-medium">{stationHistory.current_asset_name}</p>
                      <p className="text-slate-500 font-mono text-xs">{stationHistory.current_asset_serial}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Changes List */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    Recent Changes (Last 10)
                  </h4>
                  
                  {assets.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedAssetFilter}
                        onChange={(e) => setSelectedAssetFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="">All Assets</option>
                        {assets.map((asset, index) => (
                          <option 
                            key={`${asset.id || index}-${asset.serial || index}`} 
                            value={asset.serial || ''}
                          >
                            {asset.name || 'Unknown'} ({asset.serial || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredHistory && filteredHistory.length > 0 ? (
                    filteredHistory.slice(0, 10).map((change, index) => {
                      const badge = getChangeTypeBadge(change.change_type);
                      const conditionBadge = getConditionBadge(change.asset_condition);
                      
                      return (
                        <div 
                          key={change.id_change || index}
                          className="p-4 bg-slate-900/60 border border-slate-700/40 rounded-xl hover:border-cyan-500/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.color}`}>
                                {badge.label}
                              </span>
                              {conditionBadge && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${conditionBadge.color}`}>
                                  {conditionBadge.label}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {change.time_ago}
                              </span>
                              {change.ticket_id && (
                                <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                  Ticket #{change.ticket_id}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Seriales */}
                          <div className="text-xs mb-3 pb-3 border-b border-slate-700/50">
                            {change.previous_asset_serial ? (
                              <div className="flex items-center gap-2">
                                <span className="text-rose-400 font-mono font-semibold">{change.previous_asset_serial}</span>
                                <ArrowUpRight className="w-3 h-3 text-slate-500" />
                                <span className="text-emerald-400 font-mono font-semibold">{change.asset_serial}</span>
                              </div>
                            ) : (
                              <div className="text-emerald-400 font-mono font-semibold">
                                {change.asset_serial}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        {selectedAssetFilter ? 'No changes found for this asset' : 'No recent changes'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                <History className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">No change history for this station yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Changes will be recorded when assets are assigned, moved, or unassigned
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/30 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationHistoryModal;