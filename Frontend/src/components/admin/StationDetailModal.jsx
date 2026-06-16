import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, Monitor, Mouse, Keyboard, Cable, HardDrive, ArrowUpRight, Trash2, Plus, Save, AlertCircle, Clock, History, Filter, User, Shield } from 'lucide-react';
import { getAssetsByStation, updateAsset, createAsset, getAssets } from '@/services/almacenService';
import { toast } from '@/components/ui/use-toast';
import { formatRelativeTime } from '@/utils/timeFormatter';

const UNIQUE_ITEMS_PER_STATION = [
  'teclado', 'keyboard', 'mouse', 
  'extension', 'conversor', 'ethernet'
];

const ALLOW_DUPLICATES_ITEMS = [
  'cable', 'display', 'monitor', 'pantalla', 'hdmi', 'vga', 'lan'
];

const StationDetailModal = ({ isOpen, stationName, onClose, onRefresh }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [newDestino, setNewDestino] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    serial: '',
    fecha_salida: new Date().toISOString().split('T')[0],
    Monitor_Location: ''
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [itemPrefixes, setItemPrefixes] = useState({});
  const [nextSerial, setNextSerial] = useState(1);
  const [validationError, setValidationError] = useState('');
  
  // History states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stationHistory, setStationHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fullHistory, setFullHistory] = useState([]);
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('');

  useEffect(() => {
    if (isOpen && stationName) {
      setLoading(true);
      getAssetsByStation(stationName)
        .then(setAssets)
        .catch((err) => {
          console.error('Error loading station assets:', err);
          toast({ 
            title: "Error", 
            description: "Could not load assets for this station", 
            variant: "destructive" 
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, stationName]);

  useEffect(() => {
    if (isOpen && stationName && showHistoryModal) {
      setLoadingHistory(true);
      
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
          toast({ 
            title: "Error", 
            description: "Could not load station history", 
            variant: "destructive" 
          });
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [isOpen, stationName, showHistoryModal]);

  useEffect(() => {
    if (showAddForm && stationName) {
      fetch('http://localhost:8000/api/almacen/items-list')
        .then(res => res.json())
        .then(data => {
          const items = data.map(i => i.name);
          const prefixes = {};
          data.forEach(i => { prefixes[i.name] = i.prefix || 'ITM'; });
          setAvailableItems(items);
          setItemPrefixes(prefixes);
        })
        .catch(err => console.error('Error loading items:', err));
    }
  }, [showAddForm, stationName]);

  useEffect(() => {
    if (newItem.name && itemPrefixes[newItem.name]) {
      const prefix = itemPrefixes[newItem.name];
      
      getAssets(prefix)
        .then(allAssets => {
          const inUseAssets = allAssets.filter(a => {
            if (!a.serial || !a.fecha_salida || !a.destino) return false;
            const regex = new RegExp(`^${prefix}(\\d+)$`);
            return regex.test(a.serial);
          });
          
          const existingNumbers = inUseAssets.map(a => {
            const match = a.serial.match(new RegExp(`^${prefix}(\\d+)$`));
            return match ? parseInt(match[1], 10) : null;
          }).filter(n => n !== null && !isNaN(n));
          
          let nextAvailable = 1;
          const sortedNumbers = existingNumbers.sort((a, b) => a - b);
          
          for (let i = 0; i < sortedNumbers.length; i++) {
            if (sortedNumbers[i] === nextAvailable) {
              nextAvailable++;
            } else if (sortedNumbers[i] > nextAvailable) {
              break;
            }
          }
          
          setNextSerial(nextAvailable);
          setValidationError('');
        })
        .catch(err => {
          console.error('Error calculating next serial:', err);
          setNextSerial(1);
        });
    }
  }, [newItem.name, itemPrefixes]);

  const validateItemForStation = () => {
    if (!newItem.name || !stationName) return null;
    
    const itemNameLower = newItem.name.toLowerCase();
    const isUniqueItem = UNIQUE_ITEMS_PER_STATION.some(keyword => 
      itemNameLower.includes(keyword)
    );
    
    if (isUniqueItem) {
      const alreadyExists = assets.some(a => 
        a.name.toLowerCase() === newItem.name.toLowerCase() && 
        a.destino === stationName
      );
      
      if (alreadyExists) {
        return `A "${newItem.name}" is already assigned to this station. Items like keyboards, mice, or extensions can only have 1 unit per station.`;
      }
    }
    
    const isCableItem = ALLOW_DUPLICATES_ITEMS.some(keyword => 
      itemNameLower.includes(keyword)
    );
    
    if (isCableItem && newItem.Monitor_Location) {
      const alreadyExists = assets.some(a => 
        a.name.toLowerCase() === newItem.name.toLowerCase() && 
        a.destino === stationName &&
        a.Monitor_Location === newItem.Monitor_Location
      );
      
      if (alreadyExists) {
        return `A "${newItem.name}" for "${newItem.Monitor_Location}" already exists at this station.`;
      }
    }
    
    return null;
  };

  const handleUnassign = async (asset) => {
    if (!confirm(`Unassign ${asset.name} (${asset.serial}) from ${stationName}?`)) return;
    try {
      await updateAsset({ ...asset, destino: '', fecha_salida: null });
      toast({ title: "Unassigned", description: `${asset.name} has been removed from the station.` });
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (onRefresh) onRefresh();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not unassign asset", variant: "destructive" });
    }
  };

  const handleMove = async (asset) => {
    if (!newDestino.trim()) {
      toast({ title: "Attention", description: "Please enter the new station name", variant: "destructive" });
      return;
    }
    try {
      await updateAsset({ ...asset, destino: newDestino.trim() });
      toast({ title: "Moved", description: `${asset.name} moved to ${newDestino.trim()}` });
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setMovingId(null);
      setNewDestino('');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not move asset", variant: "destructive" });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.fecha_salida) {
      toast({ title: "Error", description: "Item and Exit Date are required", variant: "destructive" });
      return;
    }
    
    const error = validateItemForStation();
    if (error) {
      setValidationError(error);
      toast({ title: "Validation", description: error, variant: "destructive" });
      return;
    }

    const availableInInventory = await getAssets(newItem.name)
      .then(all => {
        const available = all.filter(a => 
          a.name === newItem.name && 
          !a.destino && 
          !a.fecha_salida
        );
        available.sort((a, b) => {
          const serialA = a.serial || '';
          const serialB = b.serial || '';
          return serialA.localeCompare(serialB, undefined, { numeric: true });
        });
        return available;
      })
      .catch(() => []);

    if (availableInInventory.length > 0) {
      const assetToAssign = availableInInventory[0];
      const updated = {
        ...assetToAssign,
        fecha_salida: newItem.fecha_salida,  
        destino: stationName,             
        Monitor_Location: newItem.Monitor_Location || assetToAssign.Monitor_Location
      };

      try {
        await updateAsset(updated);
        toast({ 
          title: "Item assigned", 
          description: `${newItem.name} (${assetToAssign.serial}) assigned to ${stationName}` 
        });
        const updatedList = await getAssetsByStation(stationName);
        setAssets(updatedList);
        setShowAddForm(false);
        setNewItem({ name: '', serial: '', fecha_salida: new Date().toISOString().split('T')[0], Monitor_Location: '' });
        setValidationError('');
        if (onRefresh) onRefresh();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Could not assign item", variant: "destructive" });
      }
    } else {
      let finalSerial = newItem.serial;
      if (!finalSerial && itemPrefixes[newItem.name]) {
        const prefix = itemPrefixes[newItem.name];
        finalSerial = `${prefix}${String(nextSerial).padStart(5, '0')}`;
      }

      const payload = {
        name: newItem.name,
        serial: finalSerial,
        fecha_ingreso: newItem.fecha_salida,  
        fecha_salida: newItem.fecha_salida,   
        destino: stationName,
        tipo_retorno: null,
        observaciones_retorno: null,
        Sede_Actual: null,
        Monitor_Location: newItem.Monitor_Location || null
      };

      try {
        await createAsset(payload);
        toast({ 
          title: "Item created", 
          description: `${newItem.name} (${finalSerial}) created and assigned to ${stationName}` 
        });
        const updatedList = await getAssetsByStation(stationName);
        setAssets(updatedList);
        setShowAddForm(false);
        setNewItem({ name: '', serial: '', fecha_salida: new Date().toISOString().split('T')[0], Monitor_Location: '' });
        setValidationError('');
        if (onRefresh) onRefresh();
      } catch (err) {
        if (err.message?.includes('serial') || err.message?.includes('Serial')) {
          toast({ 
            title: "Duplicate serial", 
            description: "This serial already exists. A new one will be generated automatically.", 
            variant: "destructive" 
          });
          setNextSerial(prev => prev + 1);
          return;
        }
        toast({ title: "Error", description: err.message || "Could not add item", variant: "destructive" });
      }
    }
  };

  const getItemIcon = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('monitor') || name.includes('pantalla')) return <Monitor className="w-5 h-5 text-cyan-400" />;
    if (name.includes('mouse')) return <Mouse className="w-5 h-5 text-purple-400" />;
    if (name.includes('teclado') || name.includes('keyboard')) return <Keyboard className="w-5 h-5 text-emerald-400" />;
    if (name.includes('cable')) return <Cable className="w-5 h-5 text-orange-400" />;
    if (name.includes('cpu') || name.includes('computer')) return <HardDrive className="w-5 h-5 text-blue-400" />;
    return <Package className="w-5 h-5 text-slate-400" />;
  };

  const getChangeTypeBadge = (type) => {
    const badges = {
      'ASSIGNED': { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Assigned' },
      'UNASSIGNED': { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Unassigned' },
      'MOVED_TO': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Moved To' },
      'MOVED_FROM': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Moved From' }
    };
    return badges[type] || { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: type };
  };

  // NUEVA FUNCIÓN: Badge para condición del activo
  const getConditionBadge = (condition) => {
    if (!condition) return null;
    const badges = {
      'Return': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Return' },
      'Damage': { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Damage' },
      'Missing': { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Missing' }
    };
    return badges[condition] || { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: condition };
  };

  // FILTRO CORREGIDO: Busca por serial O por nombre del activo
  const filteredHistory = selectedAssetFilter 
    ? (fullHistory || []).filter(h => {
        // Buscar el activo seleccionado en la lista actual
        const selectedAsset = assets.find(a => a.serial === selectedAssetFilter);
        const selectedName = selectedAsset?.name?.toLowerCase() || '';
        
        // Coincidencia por serial
        const serialMatch = h.asset_serial === selectedAssetFilter || 
                           h.previous_asset_serial === selectedAssetFilter;
        
        // Coincidencia por nombre del activo
        const nameMatch = (h.asset_name && h.asset_name.toLowerCase().includes(selectedName)) ||
                         (h.previous_asset_name && h.previous_asset_name.toLowerCase().includes(selectedName));
        
        return serialMatch || nameMatch;
      })
    : (fullHistory || []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 to-blue-950/50">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              Station Assets
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-1">{stationName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
              title="View station change history"
            >
              <History className="w-5 h-5" />
            </button>
            
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                title="Add new item to this station"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          
          {showAddForm ? (
            <div className="space-y-4 mb-6 p-4 bg-slate-800/40 rounded-xl border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Add New Item to {stationName}
                </h4>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {validationError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Item *</label>
                  <select
                    value={newItem.name}
                    onChange={(e) => {
                      setNewItem({ ...newItem, name: e.target.value, serial: '' });
                      setValidationError('');
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select an item...</option>
                    {availableItems.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Serial</label>
                  <input
                    type="text"
                    value={newItem.serial || (itemPrefixes[newItem.name] ? `${itemPrefixes[newItem.name]}${String(nextSerial).padStart(5, '0')}` : '')}
                    readOnly
                    placeholder="Auto-generated"
                    className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Auto-generated (not editable)</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Exit Date *</label>
                  <input
                    type="date"
                    value={newItem.fecha_salida}
                    onChange={(e) => setNewItem({ ...newItem, fecha_salida: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {(newItem.name?.toLowerCase().includes('cable') || 
                  newItem.name?.toLowerCase().includes('display') ||
                  newItem.name?.toLowerCase().includes('monitor') ||
                  newItem.name?.toLowerCase().includes('pantalla')) && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Monitor</label>
                    <select
                      value={newItem.Monitor_Location}
                      onChange={(e) => {
                        setNewItem({ ...newItem, Monitor_Location: e.target.value });
                        setValidationError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">N/A</option>
                      <option value="Left">Left Monitor</option>
                      <option value="Right">Right Monitor</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button 
                  onClick={() => { setShowAddForm(false); setValidationError(''); }}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddItem}
                  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!!validationError}
                >
                  <Save className="w-4 h-4" />
                  Save & Assign
                </button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading station assets...</p>
            </div>
          ) : assets.length === 0 && !showAddForm ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                <Package className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">No assets found at this station</p>
              <p className="text-slate-500 text-sm mt-1">Click the + button to add one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {!showAddForm && (
                <p className="text-sm text-slate-400 mb-2">
                  <span className="text-white font-bold">{assets.length}</span> items assigned
                </p>
              )}
              
              {assets.map(asset => (
                <div 
                  key={asset.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors flex-shrink-0">
                      {getItemIcon(asset.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{asset.serial}</p>
                      {asset.Monitor_Location && (
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold ${
                          asset.Monitor_Location === 'Left' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {asset.Monitor_Location === 'Left' ? 'Left Monitor' : 'Right Monitor'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {movingId === asset.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="New station..." 
                          className="bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 text-white w-32 focus:outline-none focus:border-cyan-500"
                          value={newDestino}
                          onChange={(e) => setNewDestino(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleMove(asset)}
                        />
                        <button onClick={() => handleMove(asset)} className="text-cyan-400 hover:text-white text-xs font-medium">OK</button>
                        <button onClick={() => { setMovingId(null); setNewDestino(''); }} className="text-slate-500 hover:text-white text-xs">X</button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setMovingId(asset.id); setNewDestino(''); }} 
                          className="p-2 hover:bg-white/10 rounded text-blue-400 transition-colors"
                          title="Move to another station"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUnassign(asset)} 
                          className="p-2 hover:bg-white/10 rounded text-red-400 transition-colors"
                          title="Unassign (return to inventory)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {showHistoryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/50 to-blue-950/50">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    Station Change History
                  </h3>
                  <p className="text-xs text-purple-400 font-mono mt-1">{stationName}</p>
                </div>
                <button 
                  onClick={() => { setShowHistoryModal(false); setSelectedAssetFilter(''); }}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
                    <p className="text-slate-400 text-sm">Loading history...</p>
                  </div>
                ) : stationHistory && stationHistory.total_changes > 0 ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <History className="w-8 h-8 text-purple-400" />
                          <div>
                            <p className="text-slate-400 text-xs">Total Changes</p>
                            <p className="text-2xl font-bold text-white">{stationHistory.total_changes}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Clock className="w-8 h-8 text-cyan-400" />
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
                            <p className="text-sm font-bold text-white truncate max-w-[150px]">{stationHistory.current_asset_name || 'N/A'}</p>
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
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-xs font-semibold mb-1">Previous Asset</p>
                              <p className="text-white font-medium">{stationHistory.previous_asset_name}</p>
                              <p className="text-slate-400 font-mono text-xs">{stationHistory.previous_asset_serial}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                              <p className="text-green-400 text-xs font-semibold mb-1">Current Asset</p>
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
      <History className="w-4 h-4 text-purple-400" />
      Recent Changes (Last 10)
    </h4>
    
    {/* Filter by Asset */}
    {assets.length > 0 && (
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={selectedAssetFilter}
          onChange={(e) => setSelectedAssetFilter(e.target.value)}
          className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">All Assets</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.serial}>
              {asset.name} ({asset.serial})
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  <div className="space-y-3 max-h-[400px] overflow-y-auto">
    {filteredHistory && filteredHistory.length > 0 ? (
      filteredHistory.slice(0, 10).map((change) => {
        const badge = getChangeTypeBadge(change.change_type);
        const conditionBadge = getConditionBadge(change.asset_condition);
        
        return (
          <div 
            key={change.id_change}
            className="p-4 bg-slate-900/60 border border-slate-700/40 rounded-xl hover:border-purple-500/40 transition-all"
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
                  <span className="text-red-400 font-mono font-semibold">{change.previous_asset_serial}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  <span className="text-green-400 font-mono font-semibold">{change.asset_serial}</span>
                </div>
              ) : (
                <div className="text-green-400 font-mono font-semibold">
                  {change.asset_serial}
                </div>
              )}
            </div>
            
            {/* Usuarios: Escaló y Aprobó */}
            {(change.reviewed_by || change.approved_by) && (
              <div className="flex items-center gap-4 text-[11px] flex-wrap">
                {change.reviewed_by && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-blue-400 font-semibold text-[10px] uppercase tracking-wide">Escaló</span>
                      <span className="text-blue-300 font-medium">{change.reviewed_by}</span>
                    </div>
                  </div>
                )}
                {change.approved_by && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    <div className="flex flex-col">
                      <span className="text-green-400 font-semibold text-[10px] uppercase tracking-wide">Aprobó</span>
                      <span className="text-green-300 font-medium">{change.approved_by}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Si no hay usuarios, mostrar mensaje */}
            {!change.reviewed_by && !change.approved_by && (
              <p className="text-xs text-slate-500 italic">Sin información de usuarios</p>
            )}
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
              
              <div className="px-6 py-4 bg-slate-800/30 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => { setShowHistoryModal(false); setSelectedAssetFilter(''); }}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
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

export default StationDetailModal;