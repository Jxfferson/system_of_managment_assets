import React, { useState, useEffect } from 'react';
import { Plus, Filter, LogOut, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import AdminLogin from '@/components/admin/AdminLogin';
import AssetStats from '@/components/admin/AssetStats';
import AssetFilters from '@/components/admin/AssetFilters';
import AssetForm from '@/components/admin/AssetForm';
import AssetTable from '@/components/admin/AssetTable';
import ExportMenu from '@/components/admin/ExportMenu';
import AssetLotForm from '@/components/admin/AssetLotForm';

const ADMIN_PASSWORD = 'admin123';

const AVAILABLE_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Ethernet 3.0 LAN a USB',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

const ITEM_SERIAL_PREFIX = {
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
  'Ethernet 3.0 LAN a USB': 'ELU',
  'Cable Display Port a VGA 1,8': 'DPVG',
  'Cable Display VGA a VGA 1,8': 'VGAV',
  'Extension de Cable eléctrico': 'EXT'
};

const initialAsset = {
  id: null,
  name: '',
  serial: '',
  fecha_ingreso: '',
  fecha_salida: '',
  destino: ''
};

const initialLotData = {
  item: '',
  quantity: 1,
  fecha_ingreso: new Date().toISOString().split('T')[0]
};

const AdminPage = () => {
  /* ========================= AUTH STATES ========================== */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* ========================= DATA STATES ========================== */
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [lotData, setLotData] = useState(initialLotData);
  const [filters, setFilters] = useState({ name: '', serial: '', type: '', status: '', date: '' });

  const navigate = useNavigate();

  /* ========================= LOCALSTORAGE ========================== */
  useEffect(() => {
    const stored = localStorage.getItem('assets');
    if (stored) setAssets(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  /* ========================= FILTERS ========================== */
  const filteredAssets = assets.filter(asset =>
    (filters.name === '' || asset.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.serial === '' || asset.serial.toLowerCase().includes(filters.serial.toLowerCase())) &&
    (filters.status === '' || asset.status === filters.status) &&
    (filters.date === '' || asset.fecha_ingreso === filters.date)
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
  const getNextId = () => {
    if (assets.length === 0) return 1;
    return Math.max(...assets.map(a => Number(a.id))) + 1;
  };

  const extractSerialNumber = (serial, prefix) => {
    if (!serial?.startsWith(prefix)) return null;
    const numPart = serial.replace(prefix, '').replace(/[^0-9]/g, '');
    return numPart ? parseInt(numPart, 10) : null;
  };

  const getNextSerialNumberByItem = (itemName) => {
    const prefix = ITEM_SERIAL_PREFIX[itemName];
    if (!prefix) return 1;
    
    const numbers = assets
      .filter(a => a.name === itemName)
      .map(a => extractSerialNumber(a.serial, prefix))
      .filter(n => n !== null && !isNaN(n));
    
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  /* ========================= SINGLE ASSET ========================== */
  const handleAdd = () => {
    setEditingAsset({ 
      ...initialAsset, 
      fecha_ingreso: new Date().toISOString().split('T')[0] 
    });
    setShowForm(true);
  };

  const handleSave = () => {
    // Validar campos requeridos
    if (!editingAsset.name || !editingAsset.fecha_ingreso) {
      alert('Item and Fecha Ingreso are required');
      return;
    }

    let finalSerial = editingAsset.serial;
    
    // Si es asset nuevo, generar serial automáticamente
    if (!editingAsset.id) {
      const prefix = ITEM_SERIAL_PREFIX[editingAsset.name];
      if (!prefix) {
        alert('Invalid item selected');
        return;
      }
      
      const nextNum = getNextSerialNumberByItem(editingAsset.name);
      finalSerial = `${prefix}${String(nextNum).padStart(5, '0')}`;
      
      // Verificar duplicados
      const duplicate = assets.find(a => a.serial === finalSerial);
      if (duplicate) {
        alert('Serial number already exists');
        return;
      }
    } else {
      // Si es edición, verificar que el serial no exista en otro asset
      const duplicate = assets.find(
        a => a.serial === editingAsset.serial && a.id !== editingAsset.id
      );
      if (duplicate) {
        alert('Serial number already exists');
        return;
      }
    }

    if (editingAsset.id) {
      // Editar existente
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? editingAsset : a));
    } else {
      // Crear nuevo con serial generado
      const newAsset = {
        ...editingAsset,
        id: getNextId().toString(),
        serial: finalSerial
      };
      setAssets(prev => [...prev, newAsset]);
    }

    setShowForm(false);
    setEditingAsset(initialAsset);
  };

  /* ========================= LOT ========================== */
  const handleSaveLot = () => {
    if (!lotData.item || !lotData.quantity || !lotData.fecha_ingreso) {
      alert('Item, Quantity and Fecha Ingreso are required');
      return;
    }

    const quantity = parseInt(lotData.quantity);
    if (quantity <= 0 || quantity > 999) {
      alert('Quantity must be between 1 and 999');
      return;
    }

    let nextId = getNextId();
    const itemName = lotData.item;
    const prefix = ITEM_SERIAL_PREFIX[itemName];
    
    if (!prefix) {
      alert('Invalid item selected');
      return;
    }
    
    let nextSerialNum = getNextSerialNumberByItem(itemName);
    const newAssets = [];

    for (let i = 0; i < quantity; i++) {
      const serial = `${prefix}${String(nextSerialNum).padStart(5, '0')}`;
      
      if (assets.some(a => a.serial === serial)) {
        nextSerialNum++;
        continue;
      }

      newAssets.push({
        id: nextId.toString(),
        name: itemName,
        serial,
        fecha_ingreso: lotData.fecha_ingreso,
        fecha_salida: '',
        destino: '',
      });

      nextId++;
      nextSerialNum++;
    }

    if (newAssets.length === 0) {
      alert('Could not add any assets. Serials may already exist.');
      return;
    }

    setAssets(prev => [...prev, ...newAssets]);
    setShowLotForm(false);
    setLotData(initialLotData);
    
    alert(`Successfully added ${newAssets.length} "${itemName}" to inventory!`);
  };

  /* ========================= DELETE ========================== */
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  /* ========================= EDIT ========================== */
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  /* ========================= GET NEXT SERIAL FOR FORM ========================== */
  const getNextSerialForForm = () => {
    // Solo calcular si es un asset NUEVO y tiene item seleccionado
    if (!editingAsset.name || editingAsset.id) return null;
    return getNextSerialNumberByItem(editingAsset.name);
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
            <Button onClick={handleAdd} className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>

            <Button onClick={() => setShowLotForm(true)} className="h-10 px-6 bg-gradient-to-r from-orange-500 to-red-600">
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

        {showForm && (
          <AssetForm
            editingAsset={editingAsset}
            setEditingAsset={setEditingAsset}
            onSave={handleSave}
            onCancel={() => { 
              setShowForm(false); 
              setEditingAsset(initialAsset); 
            }}
            isEditing={!!editingAsset.id}
            nextSerialNumber={getNextSerialForForm()}  // ✅ AHORA SÍ SE PASA
          />
        )}

        <AssetLotForm
          isOpen={showLotForm}
          onClose={() => { 
            setShowLotForm(false); 
            setLotData(initialLotData); 
          }}
          lotData={lotData}
          setLotData={setLotData}
          onSave={handleSaveLot}
          nextSerialNumber={getNextSerialNumberByItem(lotData.item)}
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