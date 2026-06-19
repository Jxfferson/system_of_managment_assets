import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { getAssets } from '@/services/almacenService';

const AddItemForm = ({ 
  stationName, 
  assets, 
  onClose, 
  onAdd, 
  itemPrefixes,
  setItemPrefixes 
}) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [nextSerial, setNextSerial] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    serial: '',
    fecha_salida: new Date().toISOString().split('T')[0],
    Monitor_Location: ''
  });

  useEffect(() => {
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
  }, [setItemPrefixes]);

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
    const isUniqueItem = ['teclado', 'keyboard', 'mouse', 'extension', 'conversor', 'ethernet']
      .some(keyword => itemNameLower.includes(keyword));
    
    if (isUniqueItem) {
      const alreadyExists = assets.some(a => 
        a.name.toLowerCase() === newItem.name.toLowerCase() && 
        a.destino === stationName
      );
      
      if (alreadyExists) {
        return `A "${newItem.name}" is already assigned to this station.`;
      }
    }
    
    const isCableItem = ['cable', 'display', 'monitor', 'pantalla', 'hdmi', 'vga', 'lan']
      .some(keyword => itemNameLower.includes(keyword));
    
    if (isCableItem && newItem.Monitor_Location) {
      const alreadyExists = assets.some(a => 
        a.name.toLowerCase() === newItem.name.toLowerCase() && 
        a.destino === stationName &&
        a.Monitor_Location === newItem.Monitor_Location
      );
      
      if (alreadyExists) {
        return `A "${newItem.name}" for "${newItem.Monitor_Location}" already exists.`;
      }
    }
    
    return null;
  };

  const handleSubmit = () => {
    if (!newItem.name || !newItem.fecha_salida) {
      alert('Item and Exit Date are required');
      return;
    }
    
    const error = validateItemForStation();
    if (error) {
      setValidationError(error);
      return;
    }

    onAdd(newItem, nextSerial);
  };

  const showMonitorField = newItem.name?.toLowerCase().includes('cable') || 
                          newItem.name?.toLowerCase().includes('display') ||
                          newItem.name?.toLowerCase().includes('monitor') ||
                          newItem.name?.toLowerCase().includes('pantalla');

  return (
    <div className="space-y-4 mb-6 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          Add New Item to {stationName}
        </h4>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
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
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
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
            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white font-mono cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-500 mt-1">Auto-generated</p>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Exit Date *</label>
          <input
            type="date"
            value={newItem.fecha_salida}
            onChange={(e) => setNewItem({ ...newItem, fecha_salida: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {showMonitorField && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Monitor</label>
            <select
              value={newItem.Monitor_Location}
              onChange={(e) => {
                setNewItem({ ...newItem, Monitor_Location: e.target.value });
                setValidationError('');
              }}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
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
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!!validationError}
        >
          <Save className="w-4 h-4" />
          Save & Assign
        </button>
      </div>
    </div>
  );
};

export default AddItemForm;