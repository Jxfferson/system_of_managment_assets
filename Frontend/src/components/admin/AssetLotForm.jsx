import React, { useState, useEffect } from 'react'
import { Save, X, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
]

const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': { prefix: 'K', price_cop: 49700 },
  'Mouse Alámbrico HP Óptico negro 100': { prefix: 'M', price_cop: 21000 },
  'Ethernet 3.0 LAN a USB': { prefix: 'ELU', price_cop: 29500 },
  'Cable Display Port a VGA 1,8': { prefix: 'DPVG', price_cop: 14538 },
  'Cable Display VGA a VGA 1,8': { prefix: 'VGAV', price_cop: 13500 },
  'Extension de Cable eléctrico': { prefix: 'EXT', price_cop: 8000 }
}

// ← Lista de sedes (debe coincidir con el backend)
const SEDES_DISPONIBLES = ["Connecta 80", "Caracol", "American BPS"]

// 🔹 FUNCIÓN PARA EXTRAER PREFIX (maneja string u objeto)
const getPrefix = (data) => {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) return data.prefix || '';
  return '';
};

export default function AssetLotForm({
  isOpen,
  onClose,
  lotData,
  setLotData,
  onSave,
  nextSerialNumber,
  initialItems = DEFAULT_ITEMS,
  initialPrefixMap = DEFAULT_PREFIXES
}) {

  useEffect(() => {
    if (isOpen) {
      setLotData(prev => ({ 
        ...prev, 
        item: '',
        Sede_Actual: '' 
      }))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setLotData(prev => ({ ...prev, [field]: value }))
  }

  const selectedItem = lotData.item
  
  // 🔹 CORREGIDO: Extraer prefix correctamente
  const serialPrefix = selectedItem 
    ? getPrefix(initialPrefixMap[selectedItem]) || selectedItem.slice(0,3).toUpperCase().replace(/[^A-Z]/g,'') 
    : ''
    
  const previewSerial = serialPrefix && nextSerialNumber 
    ? `${serialPrefix}${String(nextSerialNumber).padStart(5,'0')}` 
    : ''
    
  const isMainFormValid = selectedItem && lotData.quantity && lotData.fecha_ingreso && parseInt(lotData.quantity) >= 5

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-6">Add Asset Lot</h2>
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Item *</label>
            <Select value={lotData.item || ''} onChange={(e) => handleChange('item', e.target.value)} className="w-full">
              <option value="">Select an item...</option>
              {initialItems.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>

          {selectedItem && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Serial</label>
              <Input value={previewSerial || 'Select item'} readOnly className="bg-slate-800/50 font-mono" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
            <Input type="number" min="5" value={lotData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Entry Date *</label>
            <Input type="date" value={lotData.fecha_ingreso} onChange={(e) => handleChange('fecha_ingreso', e.target.value)} />
          </div>

          {/* ← NUEVO: Campo Sede Actual */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
              Current Headquarters
            </label>
            <Select 
              value={lotData.Sede_Actual || ''} 
              onChange={(e) => handleChange('Sede_Actual', e.target.value)}
              className="w-full bg-slate-800/50"
            >
              <option value="">Select a headquarters...</option>
              {SEDES_DISPONIBLES.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </Select>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            onClick={onClose} 
            className="bg-slate-700 hover:bg-slate-800 text-white border-0"
          >
            <X className="w-4 h-4 mr-2"/> Cancel
          </Button>
          <Button onClick={onSave} className="bg-gradient-to-r from-sky-600 to-blue-500 text-white" disabled={!isMainFormValid}>
            <Save className="w-4 h-4 mr-2"/> Save Lot
          </Button>
        </div>
      </div>
    </div>
  )
}