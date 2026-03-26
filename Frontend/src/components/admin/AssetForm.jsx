import React from 'react';
import { motion } from 'framer-motion';
import { Save, X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { sanitizeString, sanitizeText } from '@/utils/sanitize';


const SEDES_DISPONIBLES = ["Connecta 80", "Caracol", "American BPS"];

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

  const canHaveReturnType = !!editingAsset.fecha_salida;

  const handleSanitizedChange = (field, value) => {
    const sanitized = sanitizeString(value);
    setEditingAsset(prev => ({ ...prev, [field]: sanitized }));
  };

  const handleTextChange = (field, value) => {
    const sanitized = sanitizeText(value);
    setEditingAsset(prev => ({ ...prev, [field]: sanitized }));
  };

  const handleSelectChange = (field, value) => {
    setEditingAsset(prev => ({ ...prev, [field]: value }));
  };

  const handleReturnTypeChange = (e) => {
    const returnType = e.target.value;
    setEditingAsset({ 
      ...editingAsset, 
      tipo_retorno: returnType,
      destino: returnType ? '' : editingAsset.destino,
      fecha_salida: returnType ? '' : editingAsset.fecha_salida,
      observaciones_retorno: returnType ? editingAsset.observaciones_retorno : ''
    });
  };

  const handleDestinationChange = (e) => {
    const newDestino = e.target.value;
    setEditingAsset({ 
      ...editingAsset, 
      destino: newDestino,
      tipo_retorno: newDestino ? '' : editingAsset.tipo_retorno,
      observaciones_retorno: newDestino ? '' : editingAsset.observaciones_retorno
    });
  };

  const handleExitDateChange = (e) => {
    const newFechaSalida = e.target.value;
    setEditingAsset({ 
      ...editingAsset, 
      fecha_salida: newFechaSalida,
      tipo_retorno: (newFechaSalida && editingAsset.tipo_retorno) ? '' : editingAsset.tipo_retorno,
      observaciones_retorno: (newFechaSalida && editingAsset.tipo_retorno) ? '' : editingAsset.observaciones_retorno
    });
  };

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
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Item *</label>
          <Select
            value={editingAsset.name}
            onChange={(e) => {
              const val = e.target.value;
              handleSelectChange('name', val);
              setEditingAsset(prev => ({ ...prev, serial: isEditing ? prev.serial : '' }));
            }}
          >
            <option value="">Select an item...</option>
            {itemsList.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Entry Date *</label>
          <Input
            type="date"
            value={editingAsset.fecha_ingreso || ''}
            onChange={(e) => setEditingAsset({ ...editingAsset, fecha_ingreso: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Exit Date {!editingAsset.fecha_salida && '(required for return type)'}
          </label>
          <Input
            type="date"
            value={editingAsset.fecha_salida || ''}
            onChange={handleExitDateChange}
            min={editingAsset.fecha_ingreso || ''}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Destination</label>
          <Input
            value={editingAsset.destino || ''}
            onChange={handleDestinationChange}
            placeholder="Enter destination (e.g., COS-TMO-C-060)"
            className="bg-slate-800/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
            Current Headquarters
          </label>
          <Select
            value={editingAsset.Sede_Actual || ''}
            onChange={(e) => handleSelectChange('Sede_Actual', e.target.value)}
            className="bg-slate-800/50"
          >
            <option value="">Select a headquarters...</option>
            {SEDES_DISPONIBLES.map((sede) => (
              <option key={sede} value={sede}>{sede}</option>
            ))}
          </Select>
        </div>

        <div className={!canHaveReturnType ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Return Type {!canHaveReturnType && '(requires exit date + no destination)'}
          </label>
          <Select
            value={editingAsset.tipo_retorno || ''}
            onChange={handleReturnTypeChange}
            disabled={!canHaveReturnType}
          >
            <option value="">Select return type...</option>
            <option value="Return">Return</option>
            <option value="Damage">Damage</option>
            <option value="Missing">Missing</option>
          </Select>
          {!canHaveReturnType && !editingAsset.fecha_salida && (
            <p className="mt-1 text-xs text-amber-400">Set exit date first to select return type</p>
          )}
          {!canHaveReturnType && editingAsset.destino && (
            <p className="mt-1 text-xs text-amber-400">Clear destination first</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Observations
            {editingAsset.tipo_retorno === 'Missing' || editingAsset.tipo_retorno === 'Damage' ? ' *' : ''}
          </label>
          <textarea
            value={editingAsset.observaciones_retorno || ''}
            onChange={(e) => handleTextChange('observaciones_retorno', e.target.value)}
            placeholder={
              editingAsset.tipo_retorno === 'Return' 
                ? "Ej: Equipment in good condition, returns with all accessories..."
                : editingAsset.tipo_retorno === 'Damage'
                ? "Ej: Reported by..., incident date, claim number..."
                : editingAsset.tipo_retorno === 'Missing'
                ? "Ej: Last known location, circumstances of loss, report filed..."
                : "Optional notes about this asset..."
            }
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            required={!!editingAsset.fecha_salida && (editingAsset.tipo_retorno === 'Missing' || editingAsset.tipo_retorno === 'Damage')}
          />
          {editingAsset.tipo_retorno === 'Missing' || editingAsset.tipo_retorno === 'Damage' ? (
            <p className="mt-1 text-xs text-red-400">Required for Missing and Damage returns</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Additional information (optional)</p>
          )}
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
        <Button onClick={onCancel} variant="outline" className="bg-slate-700 hover:bg-slate-800 text-white border-white/10">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button 
          onClick={onSave} 
          className="h-9 px-8 bg-gradient-to-r text-white from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          disabled={!editingAsset.name || !editingAsset.fecha_ingreso}
        >
          <Save className="w-4 h-4 mr-2"/> {isEditing ? 'Save Changes' : 'Create Asset'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetForm;