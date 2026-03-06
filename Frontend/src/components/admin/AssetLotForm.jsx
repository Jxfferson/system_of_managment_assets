import React, { useState, useEffect } from 'react'
import { Save, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const API_URL = 'http://localhost:8000'

const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
]

const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
}

export default function AssetLotForm({
  isOpen,
  onClose,
  lotData,
  setLotData,
  onSave,
  nextSerialNumber,
  initialItems = DEFAULT_ITEMS,
  initialPrefixMap = DEFAULT_PREFIXES,
  onItemCreated
}) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrefix, setNewItemPrefix] = useState('')
  const [isSavingNewItem, setIsSavingNewItem] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsCreatingNew(false)
      setNewItemName('')
      setNewItemPrefix('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setLotData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (e) => {
    const value = e.target.value
    if (value === '__CREATE_NEW__') {
      setIsCreatingNew(true)
      setNewItemName('')
      setNewItemPrefix('')
      handleChange('item', '')
    } else {
      setIsCreatingNew(false)
      handleChange('item', value)
    }
  }

  const handleSaveNewItem = async () => {
    if (!newItemName.trim()) return
    
    setIsSavingNewItem(true)
    try {
      const response = await fetch(`${API_URL}/api/almacen/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName.trim(),
          serial_prefix: newItemPrefix.trim().toUpperCase() || undefined
        })
      })
      const result = await response.json()
      const prefix = result.serial_prefix || 'ITM'
      
      if (onItemCreated) onItemCreated(newItemName.trim(), prefix)
      handleChange('item', newItemName.trim())
      
      setIsCreatingNew(false)
      setNewItemName('')
      setNewItemPrefix('')
    } catch (error) {
      console.error(error)
      alert('Error: ' + error.message)
    } finally {
      setIsSavingNewItem(false)
    }
  }

  const selectedItem = lotData.item
  const serialPrefix = selectedItem 
    ? (initialPrefixMap[selectedItem] || newItemPrefix || selectedItem.slice(0,3).toUpperCase().replace(/[^A-Z]/g,'')) 
    : ''
  const previewSerial = serialPrefix && nextSerialNumber 
    ? `${serialPrefix}${String(nextSerialNumber).padStart(5,'0')}` 
    : ''
    
  const isMainFormValid = selectedItem && lotData.quantity && lotData.fecha_ingreso && parseInt(lotData.quantity) > 1 && !isCreatingNew

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-6">Add Asset Lot</h2>
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Item *</label>
            <Select value={isCreatingNew ? '__CREATE_NEW__' : (lotData.item || '')} onChange={handleItemChange} className="w-full">
              <option value="">Select an item...</option>
              {initialItems.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
              {lotData.item && !initialItems.includes(lotData.item) && !isCreatingNew && (
                <option key={lotData.item} value={lotData.item}>{lotData.item}</option>
              )}
              <option value="__CREATE_NEW__" className="text-sky-400">+ Create new item...</option>
            </Select>
          </div>

          {isCreatingNew && (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
              <Input placeholder="New item name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} autoFocus className="bg-slate-900" />
              <Input placeholder="Prefix (optional)" value={newItemPrefix} onChange={(e) => setNewItemPrefix(e.target.value.toUpperCase().slice(0,6))} maxLength={6} className="bg-slate-900 uppercase" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setIsCreatingNew(false); setNewItemName(''); setNewItemPrefix('') }} disabled={isSavingNewItem} className="h-8 bg-slate-700 hover:bg-slate-800"><X className="w-3 h-3 mr-1"/> Cancel</Button>
                <Button size="sm" onClick={handleSaveNewItem} disabled={!newItemName.trim() || isSavingNewItem} className=" text-white h-8 bg-sky-600">{isSavingNewItem ? '...' : <><Plus className="w-3 h-3 mr-1"/> Create</>}</Button>
              </div>
            </div>
          )}

          {selectedItem && !isCreatingNew && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Serial</label>
              <Input value={previewSerial || 'Select item'} readOnly className="bg-slate-800/50 font-mono" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
            <Input type="number" min="5" value={lotData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} disabled={isCreatingNew} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Entry Date *</label>
            <Input type="date" value={lotData.fecha_ingreso} onChange={(e) => handleChange('fecha_ingreso', e.target.value)} disabled={isCreatingNew} />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            onClick={onClose} 
            disabled={isSavingNewItem}
            className="bg-slate-700 hover:bg-slate-800 text-white border-0"
          >
            <X className="w-4 h-4 mr-2"/> Cancel
          </Button>
          <Button onClick={onSave} className="bg-gradient-to-r from-sky-600 to-blue-500 text-white" disabled={!isMainFormValid || isCreatingNew || isSavingNewItem}><Save className="w-4 h-4 mr-2"/> Save Lot</Button>
        </div>
      </div>
    </div>
  )
}