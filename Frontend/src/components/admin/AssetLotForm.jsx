import React from 'react';
import { Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

// Lista completa de items disponibles en la base de datos
const AVAILABLE_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

// Mapeo de items a sus prefijos de serial
const ITEM_SERIAL_PREFIX = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
};

const AssetLotForm = ({
  isOpen,
  onClose,
  lotData,
  setLotData,
  onSave,
  nextSerialNumber
}) => {
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setLotData(prev => ({ ...prev, [field]: value }));
  };

  const selectedItem = lotData.item;
  const serialPrefix = selectedItem ? ITEM_SERIAL_PREFIX[selectedItem] || '' : '';
  const previewSerial = serialPrefix && nextSerialNumber 
    ? `${serialPrefix}${String(nextSerialNumber).padStart(5, '0')}`
    : '';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-white/10">

        <h2 className="text-xl font-semibold text-white mb-6">
          Add Asset Lot
        </h2>

        <div className="space-y-4">

          {/* ITEM - Selección obligatoria */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Item *
            </label>
            <Select
              value={lotData.item}
              onChange={(e) => handleChange("item", e.target.value)}
            >
              <option value="">Select an item...</option>
              {AVAILABLE_ITEMS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>

          {/* SERIAL - Preview auto-generado (readonly) */}
          {selectedItem && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Serial (auto-generated)
              </label>
              <Input
                value={previewSerial || 'Select item first'}
                readOnly
                className="bg-slate-800/50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Serials will be generated consecutively: {previewSerial}, {serialPrefix}{String(nextSerialNumber + 1).padStart(5, '0')}, ...
              </p>
            </div>
          )}

          {/* QUANTITY */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity *
            </label>
            <Input
              type="number"
              min="1"
              max="999"
              placeholder="Enter quantity"
              value={lotData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
            />
          </div>

          {/* FECHA_INGRESO */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha Ingreso *
            </label>
            <Input
              type="date"
              value={lotData.fecha_ingreso}
              onChange={(e) => handleChange("fecha_ingreso", e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* CAMPOS BLOQUEADOS - Solo se editan después */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-white/5">
            <p className="text-xs text-slate-400 mb-2">
              ⚠️ Los siguientes campos se habilitan al editar cada asset individualmente:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fecha Salida</label>
                <Input value="" disabled placeholder="— Editar después —" className="bg-slate-900/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Destino</label>
                <Input value="" disabled placeholder="— Editar después —" className="bg-slate-900/50" />
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-gradient-to-r from-orange-500 to-red-600"
            disabled={!selectedItem || !lotData.quantity || !lotData.fecha_ingreso || parseInt(lotData.quantity) <= 0}
          >
            <Save className="w-4 h-4 mr-2" /> Save Lot
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AssetLotForm;