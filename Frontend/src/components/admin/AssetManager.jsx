import React, { useState, useEffect } from 'react'
import AssetFilters from './AssetFilters'
import AssetForm from './AssetForm'
import AssetLotForm from './AssetLotForm'
import AssetTable from './AssetTable'
import AssetStats from './AssetStats'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB', 'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB', 'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8', 'Extension de Cable eléctrico'
]
const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': 'K', 'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU', 'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV', 'Extension de Cable eléctrico': 'EXT'
}

export default function AssetManager() {
  const [assets, setAssets] = useState([])
  const [availableItems, setAvailableItems] = useState(DEFAULT_ITEMS)
  const [itemPrefixMap, setItemPrefixMap] = useState(DEFAULT_PREFIXES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [nextSerial, setNextSerial] = useState(1)
  const [filters, setFilters] = useState({ serial: '', date: '', destino: '', item: '' })
  const [editingAsset, setEditingAsset] = useState({})
  const [lotData, setLotData] = useState({ item: '', quantity: '', fecha_ingreso: new Date().toISOString().split('T')[0] })

  useEffect(() => { loadItems(); loadAssets() }, [])

  const loadItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/almacen/items`)
      const items = await res.json()
      if (items?.length) {
        setAvailableItems(items.map(i => i.name))
        const map = {}; items.forEach(i => map[i.name] = i.serial_prefix)
        setItemPrefixMap(prev => ({...prev, ...map}))
      }
    } catch(e) { console.error(e) }
  }

  const loadAssets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/almacen`)
      const data = await res.json()
      setAssets(data)
      if (data.length) setNextSerial(Math.max(...data.map(a => a.ID||0)) + 1)
    } catch(e) { console.error(e) }
  }

  const handleSaveLot = async () => {
    const qty = parseInt(lotData.quantity)
    const prefix = itemPrefixMap[lotData.item] || lotData.item.slice(0,3).toUpperCase().replace(/[^A-Z]/g,'') || 'ITM'
    
    for (let i = 0; i < qty; i++) {
      await fetch(`${API_URL}/api/almacen`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          Item: lotData.item,
          Serial: `${prefix}${String(nextSerial + i).padStart(5,'0')}`,
          Fecha_Ingreso: lotData.fecha_ingreso,
          Fecha_Salida: null, Destino: null
        })
      })
    }
    setIsModalOpen(false)
    setLotData({ item: '', quantity: '', fecha_ingreso: new Date().toISOString().split('T')[0] })
    await loadAssets()
    await loadItems()
    setNextSerial(p => p + qty)
  }

  const handleSaveAsset = async () => {
    const payload = { Item: editingAsset.name, Serial: editingAsset.serial, Fecha_Ingreso: editingAsset.fecha_ingreso, Fecha_Salida: editingAsset.fecha_salida||null, Destino: editingAsset.destino||null }
    const url = editingAsset.ID ? `${API_URL}/api/almacen/${editingAsset.ID}` : `${API_URL}/api/almacen`
    await fetch(url, { method: editingAsset.ID?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    setIsFormVisible(false)
    setEditingAsset({})
    await loadAssets(); await loadItems()
  }

  const handleDelete = async (id) => { if(confirm('¿Eliminar?')) { await fetch(`${API_URL}/api/almacen/${id}`, {method:'DELETE'}); await loadAssets(); await loadItems() } }
  const handleEdit = (asset) => { setEditingAsset({ID:asset.ID, name:asset.Item, serial:asset.Serial, fecha_ingreso:asset.Fecha_Ingreso, fecha_salida:asset.Fecha_Salida, destino:asset.Destino}); setIsFormVisible(true) }

  const filteredAssets = assets.filter(a => 
    (!filters.serial || a.Serial?.toLowerCase().includes(filters.serial.toLowerCase())) &&
    (!filters.date || a.Fecha_Ingreso === filters.date) &&
    (!filters.destino || a.Destino === filters.destino) &&
    (!filters.item || a.Item === filters.item)
  )

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-white">Asset Management</h1><p className="text-slate-400">Manage inventory</p></div>
          <div className="flex gap-2">
            <Button onClick={()=>{setIsFormVisible(!isFormVisible);setIsModalOpen(false)}} variant="outline" className="border-cyan-500/50"><Plus className="w-4 h-4 mr-2"/>{isFormVisible?'Cancel':'Add Single'}</Button>
            <Button onClick={()=>{setIsModalOpen(true);setIsFormVisible(false)}} className="bg-gradient-to-r from-orange-500 to-red-600"><Package className="w-4 h-4 mr-2"/>Add Lot</Button>
          </div>
        </div>
        <AssetStats assets={assets}/>
        <AssetFilters filters={filters} setFilters={setFilters} availableItems={availableItems}/>
        {isFormVisible && <AssetForm editingAsset={editingAsset} setEditingAsset={setEditingAsset} onSave={handleSaveAsset} onCancel={()=>{setIsFormVisible(false);setEditingAsset({})}} isEditing={!!editingAsset.ID} nextSerialNumber={nextSerial} availableItems={availableItems} itemPrefixMap={itemPrefixMap}/>}
        <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete}/>
        <AssetLotForm isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} lotData={lotData} setLotData={setLotData} onSave={handleSaveLot} nextSerialNumber={nextSerial} initialItems={availableItems} initialPrefixMap={itemPrefixMap} onItemCreated={(name,prefix)=>{ setAvailableItems(p=>p.includes(name)?p:[...p,name]); setItemPrefixMap(p=>({...p,[name]:prefix})) }}/>
      </div>
    </div>
  )
}