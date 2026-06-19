import React, { useState, useEffect } from 'react';
import { X, Package, Loader2, Plus, History } from 'lucide-react';
import { getAssetsByStation, updateAsset, createAsset } from '@/services/almacenService';
import { toast } from '@/components/ui/use-toast';
import AssetCard from './AssetCard';
import AddItemForm from './AddItemForm';
import EmptyState from './EmptyState';
import StationHistoryModal from './StationHistoryModal';

const StationDetailModal = ({ isOpen, stationName, onClose, onRefresh }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [itemPrefixes, setItemPrefixes] = useState({});

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

  const handleMove = async (asset, newDestino) => {
    try {
      await updateAsset({ ...asset, destino: newDestino });
      toast({ title: "Moved", description: `${asset.name} moved to ${newDestino}` });
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (onRefresh) onRefresh();
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not move asset", variant: "destructive" });
    }
  };

  const handleAddItem = async (newItem, nextSerial) => {
    const availableInInventory = await getAssetsByStation('')
      .then(all => all.filter(a => 
        a.name === newItem.name && 
        !a.destino && 
        !a.fecha_salida
      ))
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
        if (onRefresh) onRefresh();
      } catch (err) {
        toast({ title: "Error", description: err.message || "Could not add item", variant: "destructive" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 to-blue-950/50">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Station Assets
              </h3>
              <p className="text-xs text-cyan-400/80 font-mono mt-1">{stationName}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón Historial */}
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                title="View station change history"
              >
                <History className="w-5 h-5" />
              </button>
              
              {/* Botón Agregar */}
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                  title="Add new item"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              
              {/* Botón Cerrar */}
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
            {showAddForm ? (
              <AddItemForm 
                stationName={stationName}
                assets={assets}
                onClose={() => setShowAddForm(false)}
                onAdd={handleAddItem}
                itemPrefixes={itemPrefixes}
                setItemPrefixes={setItemPrefixes}
              />
            ) : null}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
                <p className="text-slate-400 text-sm">Loading station assets...</p>
              </div>
            ) : assets.length === 0 && !showAddForm ? (
              <EmptyState onAdd={() => setShowAddForm(true)} />
            ) : (
              <div className="space-y-3">
                {!showAddForm && (
                  <p className="text-sm text-slate-400 mb-2">
                    <span className="text-white font-bold">{assets.length}</span> items assigned
                  </p>
                )}
                
                {assets.map(asset => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset}
                    onMove={handleMove}
                    onUnassign={handleUnassign}
                  />
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

      {/* Modal de Historial */}
      <StationHistoryModal 
        isOpen={showHistoryModal}
        stationName={stationName}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
};

export default StationDetailModal;