import React, { useState } from 'react';
import { ArrowUpRight, Trash2, Monitor, Mouse, Keyboard, Cable, HardDrive, Package } from 'lucide-react';
import { getItemIconName, getMonitorBadgeColor } from './utils';

const AssetCard = ({ asset, onMove, onUnassign }) => {
  const [movingId, setMovingId] = useState(null);
  const [newDestino, setNewDestino] = useState('');

  const getItemIcon = (itemName) => {
    const iconName = getItemIconName(itemName);
    switch(iconName) {
      case 'monitor': return <Monitor className="w-5 h-5 text-cyan-400" />;
      case 'mouse': return <Mouse className="w-5 h-5 text-purple-400" />;
      case 'keyboard': return <Keyboard className="w-5 h-5 text-emerald-400" />;
      case 'cable': return <Cable className="w-5 h-5 text-orange-400" />;
      case 'harddrive': return <HardDrive className="w-5 h-5 text-blue-400" />;
      default: return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleMove = () => {
    if (!newDestino.trim()) return;
    onMove(asset, newDestino.trim());
    setMovingId(null);
    setNewDestino('');
  };

  if (movingId === asset.id) {
    return (
      <div className="flex items-center gap-2 p-4 bg-cyan-500/5 border border-cyan-500/30 rounded-xl">
        <input 
          type="text" 
          placeholder="New station..." 
          className="flex-1 bg-slate-900 border border-cyan-500/50 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          value={newDestino}
          onChange={(e) => setNewDestino(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleMove()}
        />
        <button 
          onClick={handleMove} 
          className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-medium transition-colors"
        >
          OK
        </button>
        <button 
          onClick={() => { setMovingId(null); setNewDestino(''); }} 
          className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group gap-4">
      <div className="flex items-center gap-4 w-full">
        <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors flex-shrink-0">
          {getItemIcon(asset.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium truncate">{asset.name}</p>
          <p className="text-xs text-slate-400 font-mono">{asset.serial}</p>
          {asset.Monitor_Location && (
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold border ${getMonitorBadgeColor(asset.Monitor_Location)}`}>
              {asset.Monitor_Location === 'Left' ? 'Left Monitor' : 'Right Monitor'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button 
          onClick={() => setMovingId(asset.id)} 
          className="p-2 hover:bg-cyan-500/10 rounded-lg text-cyan-400 transition-colors"
          title="Move to another station"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onUnassign(asset)} 
          className="p-2 hover:bg-red-500/10 rounded-lg text-rose-400 transition-colors"
          title="Unassign (return to inventory)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AssetCard;