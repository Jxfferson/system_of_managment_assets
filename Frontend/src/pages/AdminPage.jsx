import React, { useState, useEffect } from 'react';
import { Plus, Filter, LogOut, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import AdminLogin    from '@/components/admin/AdminLogin';
import AssetStats    from '@/components/admin/AssetStats';
import AssetFilters  from '@/components/admin/AssetFilters';
import AssetForm     from '@/components/admin/AssetForm';
import AssetTable    from '@/components/admin/AssetTable';
import ExportMenu    from '@/components/admin/ExportMenu';
import AssetLotForm  from '@/components/admin/AssetLotForm';

import {
  getAssets,
  createAsset,
  createAssetLot,
  updateAsset,
  deleteAsset,
} from '@/services/almacenService';

const ADMIN_PASSWORD = 'admin123';

const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
};

const generatePrefix = (itemName) => {
  if (!itemName) return 'ITM';
  const prefix = itemName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return prefix || 'ITM';
};

const initialAsset = {
  id: null, name: '', serial: '',
  fecha_ingreso: '', fecha_salida: '', destino: ''
};

const initialLotData = {
  item: '', quantity: 1,
  fecha_ingreso: new Date().toISOString().split('T')[0]
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState('');

  const [assets, setAssets]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [showLotForm, setShowLotForm]   = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [lotData, setLotData]           = useState(initialLotData);
  const [filters, setFilters] = useState({ 
    name: '', 
    serial: '', 
    date: '', 
    destino: '', 
    item: '',
    fechaEntrada: '', 
    fechaSalida: ''     
  });
  
  const [itemPrefixMap, setItemPrefixMap] = useState(DEFAULT_PREFIXES);
  const [debugMessage, setDebugMessage] = useState('');

  const navigate = useNavigate();

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
      
      const prefixMap = { ...DEFAULT_PREFIXES };
      data.forEach(asset => {
        if (asset.name && asset.serial && !prefixMap[asset.name]) {
          const match = asset.serial.match(/^([A-Z0-9]+)/);
          if (match) {
            prefixMap[asset.name] = match[1];
          }
        }
      });
      setItemPrefixMap(prefixMap);
    } catch (err) {
      alert('Error al cargar activos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAssets();
  }, [isAuthenticated]);

  // 👇 ATAJOS DE TECLADO (mismo patrón que ExportMenu)
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('AdminPage - Tecla:', event.key, 'Ctrl:', event.ctrlKey, 'Alt:', event.altKey);
      
      // Ctrl + Alt + N → Nuevo Activo
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        console.log('Atajo: Ctrl+Alt+N - Nuevo Activo');
        setDebugMessage('➕ Nuevo Activo');
        setEditingAsset({ ...initialAsset, fecha_ingreso: new Date().toISOString().split('T')[0] });
        setShowForm(true);
        setTimeout(() => setDebugMessage(''), 2000);
      }

      // Ctrl + Alt + L → Nuevo Lote
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        console.log('Atajo: Ctrl+Alt+L - Nuevo Lote');
        setDebugMessage('📦 Nuevo Lote');
        setShowLotForm(true);
        setTimeout(() => setDebugMessage(''), 2000);
      }

      // Ctrl + Alt + F → Toggle Filtros
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        console.log('Atajo: Ctrl+Alt+F - Toggle Filtros');
        setDebugMessage('🔍 Filtros');
        setShowFilters(prev => !prev);
        setTimeout(() => setDebugMessage(''), 2000);
      }

      // Ctrl + Alt + S → Guardar (si hay formulario abierto)
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        console.log('Atajo: Ctrl+Alt+S - Guardar');
        // El guardado se maneja dentro de AssetForm/AssetLotForm
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('AdminPage - Listener registrado');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('AdminPage - Listener removido');
    };
  }, []);

  const filteredAssets = assets.filter(asset =>
    (filters.name    === '' || asset.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.serial  === '' || asset.serial?.toLowerCase().includes(filters.serial.toLowerCase())) &&
    (filters.date    === '' || asset.fecha_ingreso === filters.date) &&
    (filters.destino === '' || asset.destino?.toLowerCase().includes(filters.destino.toLowerCase())) &&
    (filters.item    === '' || asset.name === filters.item) &&
    (filters.fechaEntrada === '' || (asset.fecha_ingreso && asset.fecha_ingreso === filters.fechaEntrada)) &&
    (filters.fechaSalida === '' || (asset.fecha_salida && asset.fecha_salida === filters.fechaSalida))
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  const extractSerialNumber = (serial, prefix) => {
    if (!serial?.startsWith(prefix)) return null;
    const numPart = serial.replace(prefix, '').replace(/[^0-9]/g, '');
    return numPart ? parseInt(numPart, 10) : null;
  };

  const getNextSerialNumberByItem = (itemName) => {
    const prefix = itemPrefixMap[itemName] || generatePrefix(itemName);
    
    const numbers = assets
      .filter(a => a.name === itemName && a.serial)
      .map(a => {
        const numMatch = a.serial.match(new RegExp(`^${prefix}(\\d+)$`));
        return numMatch ? parseInt(numMatch[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));
    
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  const handleAdd = () => {
    setEditingAsset({ ...initialAsset, fecha_ingreso: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const handleSave = async (updateSerial = false) => {
    if (!editingAsset.name || !editingAsset.fecha_ingreso) {
      alert('Item and Fecha Ingreso are required');
      return;
    }

    let finalAsset = { ...editingAsset };

    if (!editingAsset.id) {
      const prefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
      const nextNum = getNextSerialNumberByItem(editingAsset.name);
      finalAsset.serial = `${prefix}${String(nextNum).padStart(5, '0')}`;
    }
    else if (updateSerial) {
      const oldAsset = assets.find(a => String(a.id) === String(editingAsset.id));
      
      if (oldAsset && oldAsset.name !== editingAsset.name) {
        const newPrefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
        const nextNum = getNextSerialNumberByItem(editingAsset.name);
        finalAsset.serial = `${newPrefix}${String(nextNum).padStart(5, '0')}`;
      }
    }

    try {
      if (editingAsset.id) {
        await updateAsset(finalAsset);
      } else {
        await createAsset(finalAsset);
      }
      await loadAssets();
      setShowForm(false);
      setEditingAsset(initialAsset);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleSaveLot = async () => {
    if (!lotData.item || !lotData.quantity || !lotData.fecha_ingreso) {
      alert('Item, Quantity and Fecha Ingreso are required');
      return;
    }
    const quantity = parseInt(lotData.quantity);
    if (quantity <= 5 || quantity > 999) {
      alert('Quantity must be between 5 and 999');
      return;
    }

    const prefix = itemPrefixMap[lotData.item] || generatePrefix(lotData.item);

    let nextSerialNum = getNextSerialNumberByItem(lotData.item);
    const newAssets   = [];

    for (let i = 0; i < quantity; i++) {
      const serial = `${prefix}${String(nextSerialNum).padStart(5, '0')}`;
      if (assets.some(a => a.serial === serial)) { nextSerialNum++; continue; }
      newAssets.push({
        name: lotData.item, serial,
        fecha_ingreso: lotData.fecha_ingreso,
        fecha_salida: '', destino: '',
      });
      nextSerialNum++;
    }

    if (newAssets.length === 0) {
      alert('Could not add any assets. Serials may already exist.');
      return;
    }

    try {
      await createAssetLot(newAssets);
      await loadAssets();
      setShowLotForm(false);
      setLotData(initialLotData);
      alert(`Successfully added ${newAssets.length} "${lotData.item}" to inventory!`);
    } catch (err) {
      alert('Error al guardar lote: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      await loadAssets();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        error={error}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen px-6 pb-12">
      <div className="container mx-auto max-w-6xl">

        {/* 👇 Notificación de atajo */}
        {debugMessage && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm z-[100]">
            {debugMessage}
          </div>
        )}

        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>

          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={handleAdd} 
              className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              title="Nuevo Activo (Ctrl+Alt+N)"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>

            <Button 
              onClick={() => setShowLotForm(true)} 
              className="text-white h-10 px-6 bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800"
              title="Nuevo Lote (Ctrl+Alt+L)"
            >
              <Layers className="w-4 h-4 mr-2" /> Add Lot
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline"
              title="Filtros (Ctrl+Alt+F)"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <ExportMenu filteredAssets={filteredAssets} />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <AssetStats assets={assets} />

        {showFilters && (
          <AssetFilters
            filters={filters}
            setFilters={setFilters}
            availableItems={Object.keys(itemPrefixMap)}
            allAssets={assets}
            setFilteredAssets={setAssets}
          />
        )}

        {loading && (
          <div className="text-center text-slate-400 py-8">Cargando datos...</div>
        )}

        {showForm && (
          <AssetForm
            editingAsset={editingAsset}
            setEditingAsset={setEditingAsset}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingAsset(initialAsset); }}
            isEditing={!!editingAsset.id}
            nextSerialNumber={!editingAsset.id ? getNextSerialNumberByItem(editingAsset.name) : null}
            availableItems={Object.keys(itemPrefixMap)}
            itemPrefixMap={itemPrefixMap}
          />
        )}

        <AssetLotForm
          isOpen={showLotForm}
          onClose={() => { setShowLotForm(false); setLotData(initialLotData); }}
          lotData={lotData}
          setLotData={setLotData}
          onSave={handleSaveLot}
          nextSerialNumber={getNextSerialNumberByItem(lotData.item)}
          initialItems={Object.keys(itemPrefixMap)}
          initialPrefixMap={itemPrefixMap}
          onItemCreated={(name, prefix) => {
            setItemPrefixMap(prev => ({ ...prev, [name]: prefix }));
          }}
        />

        <AssetTable
          assets={filteredAssets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      </div>
    </div>
  );
};

export default AdminPage;