import React from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const AssetForm = ({ 
  editingAsset, 
  setEditingAsset, 
  onSave, 
  onCancel, 
  isEditing = false,
  nextSerialNumber = null,
  availableItems = [],
  itemPrefixMap = {}
}) => {
  
  const fallbackItems = [
    'Teclado ESENSES Basico USB',
    'Mouse Alámbrico HP Óptico negro 100',
    'Ethernet 3.0 LAN a USB',
    'Cable Display Port a VGA 1,8',
    'Cable Display VGA a VGA 1,8',
    'Extension de Cable eléctrico'
  ];
  
  const fallbackPrefixes = {
    'Teclado ESENSES Basico USB': 'K',
    'Mouse Alámbrico HP Óptico negro 100': 'M',
    'Ethernet 3.0 LAN a USB': 'ELU',
    'Cable Display Port a VGA 1,8': 'DPVG',
    'Cable Display VGA a VGA 1,8': 'VGAV',
    'Extension de Cable eléctrico': 'EXT'
  };

  const itemsList = availableItems.length > 0 ? availableItems : fallbackItems;
  const prefixes = { ...fallbackPrefixes, ...itemPrefixMap };
  
  const selectedItem = editingAsset.name;
  const serialPrefix = selectedItem ? (prefixes[selectedItem] || '') : '';
  
  const displaySerial = serialPrefix && nextSerialNumber && !isEditing
    ? `${serialPrefix}${String(nextSerialNumber).padStart(5, '0')}`
    : editingAsset.serial;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-white/10"
    >
      <h2 className="text-xl font-semibold text-white mb-4">
        {isEditing ? 'Edit Asset' : 'New Asset'}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Item *
          </label>
          <div className="relative">
            <Select
              value={editingAsset.name}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__NEW__') {
                  setEditingAsset({ ...editingAsset, name: '', serial: '' });
                } else {
                  setEditingAsset({ 
                    ...editingAsset, 
                    name: val,
                    serial: isEditing ? editingAsset.serial : '' 
                  });
                }
              }}
            >
              <option value="">Select or type...</option>
              {itemsList.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
              <option value="__NEW__" className="text-sky-400">+ New item...</option>
            </Select>

            <Input
              type="text"
              value={editingAsset.name}
              onChange={(e) => setEditingAsset({ 
                ...editingAsset, 
                name: e.target.value, 
                serial: isEditing ? editingAsset.serial : '' 
              })}
              placeholder="Or new type item name..."
              className="mt-2 bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Serial {isEditing ? '' : '(auto-generated)'}
          </label>
          <Input
            value={displaySerial || ''}
            readOnly
            className="bg-slate-800/50 cursor-not-allowed font-mono"
            placeholder={isEditing ? '' : 'Select item first'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Entry Date *
          </label>
          <Input
            type="date"
            value={editingAsset.fecha_ingreso || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, fecha_ingreso: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Exit Date
          </label>
          <Input
            type="date"
            value={editingAsset.fecha_salida || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, fecha_salida: e.target.value })}
            min={editingAsset.fecha_ingreso || ''}
            placeholder="Optional"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destination
          </label>
          <Select
            value={editingAsset.destino || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, destino: e.target.value })}
          >
            <option value="">Select destination...</option>
            <option value="COS-TMO-C-060">COS-TMO-C-060</option>
            <option value="COS-TMO-C-049">COS-TMO-C-049</option>
            <option value="COS-ARS-B-053">COS-ARS-B-053</option>
            <option value="COL-TMO-LAP">COL-TMO-LAP</option>
            <option value="COS-ARS-B-047">COS-ARS-B-047</option>
            <option value="COS-ARS-B-038">COS-ARS-B-038</option>
          </Select>
        </div>

      </div>

      {!isEditing && selectedItem && nextSerialNumber && (
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-sm text-cyan-400">
            <span className="font-medium">Serial to be generated:</span>{' '}
            <code className="font-mono font-bold">{displaySerial}</code>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onCancel} variant="outline" className="bg-slate-700 hover:bg-slate-800">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button 
          onClick={onSave} 
          className="h-9 px-8 bg-gradient-to-r text-white from-cyan-500 to-blue-600"
          disabled={!editingAsset.name || !editingAsset.fecha_ingreso}
        >
          <Save className="w-4 h-4 mr-2"/> {isEditing ? 'Save Changes' : 'Create Asset'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetForm;