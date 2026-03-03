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

// Items por defecto (solo para mostrar al inicio)
const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

// Prefijos por defecto
const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
};

// ✅ FUNCIÓN PARA GENERAR PREFIJO AUTOMÁTICO
const generatePrefix = (itemName) => {
  if (!itemName) return 'ITM';
  // Extraer letras/números, convertir a mayúsculas, tomar primeros 3-6
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
  /* ========================= AUTH STATES ========================== */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword]               = useState('');
  const [error, setError]                     = useState('');

  /* ========================= DATA STATES ========================== */
  const [assets, setAssets]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [showLotForm, setShowLotForm]   = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [lotData, setLotData]           = useState(initialLotData);
  const [filters, setFilters]           = useState({ name: '', serial: '', date: '', destino: '', item: '' });
  
  // ✅ Estado para prefijos dinámicos (se actualiza al cargar desde BD)
  const [itemPrefixMap, setItemPrefixMap] = useState(DEFAULT_PREFIXES);

  const navigate = useNavigate();

  /* ========================= CARGAR DATOS DESDE API ========================== */
  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
      
      // ✅ Extraer prefijos únicos desde los assets cargados
      const prefixMap = { ...DEFAULT_PREFIXES };
      data.forEach(asset => {
        if (asset.name && asset.serial && !prefixMap[asset.name]) {
          // Extraer prefijo del serial existente
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

  /* ========================= FILTERS ========================== */
  const filteredAssets = assets.filter(asset =>
    (filters.name    === '' || asset.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.serial  === '' || asset.serial?.toLowerCase().includes(filters.serial.toLowerCase())) &&
    (filters.date    === '' || asset.fecha_ingreso === filters.date) &&
    (filters.destino === '' || asset.destino?.toLowerCase().includes(filters.destino.toLowerCase())) &&
    (filters.item    === '' || asset.name === filters.item)
  );

  /* ========================= AUTH ========================== */
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

  /* ========================= HELPERS ========================== */
  const extractSerialNumber = (serial, prefix) => {
    if (!serial?.startsWith(prefix)) return null;
    const numPart = serial.replace(prefix, '').replace(/[^0-9]/g, '');
    return numPart ? parseInt(numPart, 10) : null;
  };

  const getNextSerialNumberByItem = (itemName) => {
    const prefix = itemPrefixMap[itemName] || generatePrefix(itemName);
    
    // Filtrar assets que coincidan con el item Y tengan serial
    const numbers = assets
      .filter(a => a.name === itemName && a.serial)
      .map(a => {
        // Extraer número del serial: "DPVG00003" → 3
        const numMatch = a.serial.match(new RegExp(`^${prefix}(\\d+)$`));
        return numMatch ? parseInt(numMatch[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));
    
    // Si hay números, retornar el máximo + 1. Si no, empezar en 1
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  /* ========================= SINGLE ASSET ========================== */
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

      // Si es NUEVO asset: generar serial automático
      if (!editingAsset.id) {
        const prefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
        const nextNum = getNextSerialNumberByItem(editingAsset.name);
        finalAsset.serial = `${prefix}${String(nextNum).padStart(5, '0')}`;
      }
      // Si es EDICIÓN y el usuario marcó el checkbox
      else if (updateSerial) {
        const oldAsset = assets.find(a => String(a.id) === String(editingAsset.id));
        
        // Solo regenerar si cambió el nombre
        if (oldAsset && oldAsset.name !== editingAsset.name) {
          const newPrefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
          
          // ✅ Obtener el siguiente número disponible para el NUEVO item
          const nextNum = getNextSerialNumberByItem(editingAsset.name);
          
          // Crear serial con nuevo prefijo y número correcto
          finalAsset.serial = `${newPrefix}${String(nextNum).padStart(5, '0')}`;
        }
      }
      // Si es edición pero NO marcó checkbox → mantiene serial original

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

  /* ========================= LOT ========================== */
  const handleSaveLot = async () => {
    if (!lotData.item || !lotData.quantity || !lotData.fecha_ingreso) {
      alert('Item, Quantity and Fecha Ingreso are required');
      return;
    }
    const quantity = parseInt(lotData.quantity);
    if (quantity <= 0 || quantity > 999) {
      alert('Quantity must be between 1 and 999');
      return;
    }

    // ✅ Usar prefijo dinámico o generar uno automático
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

  /* ========================= DELETE ========================== */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      await loadAssets();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  /* ========================= EDIT ========================== */
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  /* ========================= LOGIN SCREEN ========================== */
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

  /* ========================= MAIN UI ========================== */
  return (
    <div className="min-h-screen px-6 pb-12">
      <div className="container mx-auto max-w-6xl">

        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleAdd} className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>

            <Button onClick={() => setShowLotForm(true)} className="text-white h-10 px-6 bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800">
              <Layers className="w-4 h-4 mr-2" /> Add Lot
            </Button>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <ExportMenu filteredAssets={filteredAssets} />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <AssetStats assets={assets} />

        {showFilters && <AssetFilters filters={filters} setFilters={setFilters} />}

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
            // ✅ Actualizar mapa de prefijos cuando se crea un item nuevo
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