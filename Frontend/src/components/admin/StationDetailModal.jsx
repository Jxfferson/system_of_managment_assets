import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, Monitor, Mouse, Keyboard, Cable, HardDrive, ArrowUpRight, Trash2, Plus, Save, AlertCircle } from 'lucide-react';
import { getAssetsByStation, updateAsset, createAsset, getAssets } from '@/services/almacenService';
import { toast } from '@/components/ui/use-toast';

// Items that can only have 1 unit per station (no duplicates allowed)
const UNIQUE_ITEMS_PER_STATION = [
  'teclado', 'keyboard', 'mouse', 
  'extension', 'conversor', 'ethernet'
];

// Items that can have multiple units per station (e.g., cables for dual monitor setups)
const ALLOW_DUPLICATES_ITEMS = [
  'cable', 'display', 'monitor', 'pantalla', 'hdmi', 'vga', 'lan'
];

const StationDetailModal = ({ isOpen, stationName, onClose, onRefresh }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [newDestino, setNewDestino] = useState('');
  
  // States for the "Add Item" form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    serial: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    Monitor_Location: ''
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [itemPrefixes, setItemPrefixes] = useState({});
  const [nextSerial, setNextSerial] = useState(1);
  const [validationError, setValidationError] = useState('');

  // Load assets for the station
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

  // Load available items list for the form
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

  // Calculate next serial by finding the FIRST available gap
  // Only counts items that are IN USE (have fecha_salida AND destino)
  useEffect(() => {
    if (newItem.name && itemPrefixes[newItem.name]) {
      const prefix = itemPrefixes[newItem.name];
      
      // Fetch ALL assets with this prefix from the entire database
      getAssets(prefix)
        .then(allAssets => {
          // Filter only items that are IN USE (have fecha_salida AND destino)
          const inUseAssets = allAssets.filter(a => {
            if (!a.serial || !a.fecha_salida || !a.destino) return false;
            const regex = new RegExp(`^${prefix}(\\d+)$`);
            return regex.test(a.serial);
          });
          
          // Extract all numbers from in-use items
          const existingNumbers = inUseAssets.map(a => {
            const match = a.serial.match(new RegExp(`^${prefix}(\\d+)$`));
            return match ? parseInt(match[1], 10) : null;
          }).filter(n => n !== null && !isNaN(n));
          
          // Find the FIRST available gap
          let nextAvailable = 1;
          const sortedNumbers = existingNumbers.sort((a, b) => a - b);
          
          for (let i = 0; i < sortedNumbers.length; i++) {
            if (sortedNumbers[i] === nextAvailable) {
              nextAvailable++;
            } else if (sortedNumbers[i] > nextAvailable) {
              // Found a gap
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

  // Validate if this item can be added to the station
  const validateItemForStation = () => {
    if (!newItem.name || !stationName) return null;
    
    const itemNameLower = newItem.name.toLowerCase();
    
    // Check if it's a unique item per station
    const isUniqueItem = UNIQUE_ITEMS_PER_STATION.some(keyword => 
      itemNameLower.includes(keyword)
    );
    
    if (isUniqueItem) {
      // Check if this type of item already exists at this station
      const alreadyExists = assets.some(a => 
        a.name.toLowerCase() === newItem.name.toLowerCase() && 
        a.destino === stationName
      );
      
      if (alreadyExists) {
        return `A "${newItem.name}" is already assigned to this station. Items like keyboards, mice, or extensions can only have 1 unit per station.`;
      }
    }
    
    // For cables/monitors, check if one with the same Monitor_Location already exists
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
    
    return null; // No errors
  };

  // Function: Unassign asset
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

  // Function: Move asset
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

  // Function: Add new item to station
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.fecha_ingreso) {
      toast({ title: "Error", description: "Item and Entry Date are required", variant: "destructive" });
      return;
    }

    // Validate business rules
    const error = validateItemForStation();
    if (error) {
      setValidationError(error);
      toast({ title: "Validation", description: error, variant: "destructive" });
      return;
    }

    // Generate serial automatically if empty
    let finalSerial = newItem.serial;
    if (!finalSerial && itemPrefixes[newItem.name]) {
      const prefix = itemPrefixes[newItem.name];
      finalSerial = `${prefix}${String(nextSerial).padStart(5, '0')}`;
    }

    const payload = {
      name: newItem.name,
      serial: finalSerial,
      fecha_ingreso: newItem.fecha_ingreso,
      fecha_salida: newItem.fecha_ingreso, // IMPORTANT: When assigning, fecha_salida = assignment date
      destino: stationName,
      tipo_retorno: null,
      observaciones_retorno: null,
      Sede_Actual: null,
      Monitor_Location: newItem.Monitor_Location || null
    };

    try {
      await createAsset(payload);
      toast({ 
        title: "Item added", 
        description: `${newItem.name} (${finalSerial}) assigned to ${stationName}` 
      });
      // Reload list and refresh main table
      const updated = await getAssetsByStation(stationName);
      setAssets(updated);
      setShowAddForm(false);
      setNewItem({ name: '', serial: '', fecha_ingreso: new Date().toISOString().split('T')[0], Monitor_Location: '' });
      setValidationError('');
      if (onRefresh) onRefresh();
    } catch (err) {
      // Handle duplicate serial error from backend
      if (err.message?.includes('serial') || err.message?.includes('Serial')) {
        toast({ 
          title: "Duplicate serial", 
          description: "This serial already exists. A new one will be generated automatically.", 
          variant: "destructive" 
        });
        // Force recalc of serial and retry
        setNextSerial(prev => prev + 1);
        return;
      }
      toast({ title: "Error", description: err.message || "Could not add item", variant: "destructive" });
    }
  };

  // Icons based on item type
  const getItemIcon = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('monitor') || name.includes('pantalla')) return <Monitor className="w-5 h-5 text-cyan-400" />;
    if (name.includes('mouse')) return <Mouse className="w-5 h-5 text-purple-400" />;
    if (name.includes('teclado') || name.includes('keyboard')) return <Keyboard className="w-5 h-5 text-emerald-400" />;
    if (name.includes('cable')) return <Cable className="w-5 h-5 text-orange-400" />;
    if (name.includes('cpu') || name.includes('computer')) return <HardDrive className="w-5 h-5 text-blue-400" />;
    return <Package className="w-5 h-5 text-slate-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 to-blue-950/50">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              Station Assets
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-1">{stationName}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* "+" button to add item */}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* ADD ITEM FORM */}
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
              
              {/* Validation message */}
              {validationError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Selector */}
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

                {/* Serial (READ-ONLY - auto-generated) */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Serial</label>
                  <input
                    type="text"
                    value={newItem.serial || (itemPrefixes[newItem.name] ? `${itemPrefixes[newItem.name]}${String(nextSerial).padStart(5, '0')}` : '')}
                    readOnly
                    placeholder="Auto-generated"
                    className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-generated (not editable)
                  </p>
                </div>

                {/* Entry Date */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Entry Date *</label>
                  <input
                    type="date"
                    value={newItem.fecha_ingreso}
                    onChange={(e) => setNewItem({ ...newItem, fecha_ingreso: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Monitor Location (only for cables/monitors) */}
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

              {/* Action Buttons */}
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

          {/* Assets list */}
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

export default StationDetailModal;