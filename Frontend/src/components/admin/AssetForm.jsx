import React from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

// Mapeo de items a sus prefijos de serial
const ITEM_SERIAL_PREFIX = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
};

const AVAILABLE_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

const AssetForm = ({ 
  editingAsset, 
  setEditingAsset, 
  onSave, 
  onCancel, 
  isEditing = false,
  nextSerialNumber = null
}) => {
  
  // Obtener prefijo del item seleccionado
  const selectedItem = editingAsset.name;
  const serialPrefix = selectedItem ? ITEM_SERIAL_PREFIX[selectedItem] || '' : '';
  
  // Mostrar serial completo (prefijo + número)
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
        
        {/* ITEM - Select si es nuevo, Readonly si es edición */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Item *
          </label>
          {isEditing ? (
            <Input
              value={editingAsset.name}
              readOnly
              className="bg-slate-800/50 cursor-not-allowed"
            />
          ) : (
            <Select
              value={editingAsset.name}
              onChange={(e) => {
                const itemName = e.target.value;
                const prefix = ITEM_SERIAL_PREFIX[itemName];
                setEditingAsset({ 
                  ...editingAsset, 
                  name: itemName,
                  serial: '' // Reset serial para que se genere nuevo
                });
              }}
            >
              <option value="">Select an item...</option>
              {AVAILABLE_ITEMS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          )}
        </div>

        {/* SERIAL - Auto-generado (readonly) */}
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

        {/* FECHA_INGRESO - Editable */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Fecha Ingreso *
          </label>
          <Input
            type="date"
            value={editingAsset.fecha_ingreso || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, fecha_ingreso: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* FECHA_SALIDA - Editable */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Fecha Salida
          </label>
          <Input
            type="date"
            value={editingAsset.fecha_salida || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, fecha_salida: e.target.value })}
            min={editingAsset.fecha_ingreso || ''}
            placeholder="Optional"
          />
        </div>

        {/* DESTINO - Editable */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destino
          </label>
          <Select
            value={editingAsset.destino || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, destino: e.target.value })}
          >
            <option value="">Select destination...</option>
            <option value="Almacen Principal">Almacen Principal</option>
            <option value="Oficina Administrativa">Oficina Administrativa</option>
            <option value="Sala de Juntas">Sala de Juntas</option>
            <option value="Soporte Técnico">Soporte Técnico</option>
            <option value="Recursos Humanos">Recursos Humanos</option>
            <option value="En Préstamo">En Préstamo</option>
            <option value="En Reparación">En Reparación</option>
            <option value="Baja">Baja</option>
          </Select>
        </div>

      </div>

      {/* Preview del serial que se generará */}
      {!isEditing && selectedItem && nextSerialNumber && (
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-sm text-cyan-400">
            <span className="font-medium">Serial a generar:</span>{' '}
            <code className="font-mono font-bold">{displaySerial}</code>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onCancel} variant="outline">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button 
          onClick={onSave} 
          className="h-9 px-8 bg-gradient-to-r from-cyan-500 to-blue-600"
          disabled={!editingAsset.name || !editingAsset.fecha_ingreso}
        >
          <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Save Changes' : 'Create Asset'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetForm;