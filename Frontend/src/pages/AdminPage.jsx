import React, { useState, useEffect } from 'react';
import { Plus, Filter, LogOut, Layers, Lock, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AdminLogin    from '@/components/admin/AdminLogin';
import AssetStats    from '@/components/admin/AssetStats';
import AssetFilters  from '@/components/admin/AssetFilters';
import AssetForm     from '@/components/admin/AssetForm';
import AssetTable    from '@/components/admin/AssetTable';
import ExportMenu    from '@/components/admin/ExportMenu';
import AssetLotForm  from '@/components/admin/AssetLotForm';
import { toast } from '@/components/ui/use-toast';

import { verifyPassword } from '@/utils/passwordLocal';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';

import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  createAssetLotBulk,
} from '@/services/almacenService';

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
  fecha_ingreso: '', fecha_salida: '', destino: '',
  tipo_retorno: '', observaciones_retorno: ''
};

const initialLotData = {
  item: '', quantity: 1,
  fecha_ingreso: new Date().toISOString().split('T')[0]
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [lotData, setLotData] = useState(initialLotData);
  
  const [filters, setFilters] = useState({ 
    serial: '', destino: '', item: '',
    fechaEntrada: '', fechaSalida: ''     
  });
  
  const [itemPrefixMap, setItemPrefixMap] = useState(DEFAULT_PREFIXES);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

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
          if (match) prefixMap[asset.name] = match[1];
        }
      });
      setItemPrefixMap(prefixMap);
    } catch (err) {
      toast({
        title: "Error",
        description: 'Error al cargar activos: ' + err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAssets();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        toast({ title: "Nuevo Activo" });
        setEditingAsset({ ...initialAsset, fecha_ingreso: new Date().toISOString().split('T')[0] });
        setShowForm(true);
      }
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        toast({ title: "Nuevo Lote" });
        setShowLotForm(true);
      }
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toast({ title: "Filtros" });
        setShowFilters(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const compareDates = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const filteredAssets = assets.filter(asset => {
    const matchSerial = filters.serial === '' || 
      (asset.serial && asset.serial.toLowerCase().includes(filters.serial.toLowerCase()));
    const matchDestino = filters.destino === '' || 
      (asset.destino && asset.destino.toLowerCase().includes(filters.destino.toLowerCase()));
    const matchItem = filters.item === '' || asset.name === filters.item;
    let matchFechaEntrada = true;
    if (filters.fechaEntrada !== '') matchFechaEntrada = compareDates(asset.fecha_ingreso, filters.fechaEntrada);
    let matchFechaSalida = true;
    if (filters.fechaSalida !== '') matchFechaSalida = compareDates(asset.fecha_salida, filters.fechaSalida);
    return matchSerial && matchDestino && matchItem && matchFechaEntrada && matchFechaSalida;
  });

  const handleLogin = (enteredPassword) => {
    if (verifyPassword(enteredPassword)) {
      setIsAuthenticated(true);
      setError('');
      toast({ title: "Bienvenido", description: "Ingreso exitoso" });
    } else {
      setError('Incorrect password');
      toast({ title: "Error", description: "Contraseña incorrecta", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
    toast({ title: "Logout", description: "Sesión cerrada" });
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    toast({ title: "Password changed", description: "Admin password updated successfully." });
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
      toast({ title: "Error", description: "Item and Fecha Ingreso are required", variant: "destructive" });
      return;
    }
    if ((editingAsset.tipo_retorno === 'Perdida' || editingAsset.tipo_retorno === 'Daño') 
        && !editingAsset.observaciones_retorno?.trim()) {
      toast({ 
        title: "Error", 
        description: "Observations required for losses/damages", 
        variant: "destructive" 
      });
      return;
    }

    let finalAsset = { ...editingAsset };

    if (!editingAsset.id) {
      const prefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
      const nextNum = getNextSerialNumberByItem(editingAsset.name);
      finalAsset.serial = `${prefix}${String(nextNum).padStart(5, '0')}`;
    } else if (updateSerial) {
      const oldAsset = assets.find(a => String(a.id) === String(editingAsset.id));
      if (oldAsset && oldAsset.name !== editingAsset.name) {
        const newPrefix = itemPrefixMap[editingAsset.name] || generatePrefix(editingAsset.name);
        const nextNum = getNextSerialNumberByItem(editingAsset.name);
        finalAsset.serial = `${newPrefix}${String(nextNum).padStart(5, '0')}`;
      }
    }

    try {
      // ✅ El service se encarga del mapeo PascalCase ↔ snake_case
      if (editingAsset.id) {
        await updateAsset(finalAsset);
      } else {
        await createAsset(finalAsset);
      }

      await loadAssets();
      setShowForm(false);
      setEditingAsset(initialAsset);
      toast({ title: "Éxito", description: "Activo guardado correctamente" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveLot = async () => {
    if (!lotData.item || !lotData.quantity || !lotData.fecha_ingreso) {
      toast({ title: "Error", description: "Item, Quantity and Fecha Ingreso are required", variant: "destructive" });
      return;
    }
    const quantity = parseInt(lotData.quantity);
    if (quantity <= 4 || quantity > 999) {
      toast({ title: "Error", description: "Quantity must be between 5 and 999", variant: "destructive" });
      return;
    }
    const prefix = itemPrefixMap[lotData.item] || generatePrefix(lotData.item);
    let nextSerialNum = getNextSerialNumberByItem(lotData.item);
    const newAssets = [];
    for (let i = 0; i < quantity; i++) {
      const serial = `${prefix}${String(nextSerialNum).padStart(5, '0')}`;
      if (assets.some(a => a.serial === serial)) { nextSerialNum++; continue; }
      newAssets.push({ 
        name: lotData.item, 
        serial, 
        fecha_ingreso: lotData.fecha_ingreso, 
        fecha_salida: '', 
        destino: '',
        tipo_retorno: '',
        observaciones_retorno: ''
      });
      nextSerialNum++;
    }
    if (newAssets.length === 0) {
      toast({ title: "Error", description: "Could not add any assets. Serials may already exist.", variant: "destructive" });
      return;
    }
    try {
      await createAssetLotBulk(newAssets);
      await loadAssets();
      setShowLotForm(false);
      setLotData(initialLotData);
      toast({ title: "Assets added", description: `${newAssets.length} ${lotData.item} added to inventory` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      await loadAssets();
      toast({ title: "Activo eliminado" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="min-h-screen px-6 pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>
          <div className="flex gap-3 flex-wrap items-center">
            <Button onClick={handleAdd} className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700" title="Nuevo Activo (Ctrl+Alt+N)">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
            <Button onClick={() => setShowLotForm(true)} className="h-10 px-6 bg-gradient-to-r from-slate-500 to-slate-700 text-white hover:from-slate-600 hover:to-slate-800" title="Nuevo Lote (Ctrl+Alt+L)">
              <Layers className="w-4 h-4 mr-2" /> Add Lot
            </Button>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="h-10 border-white/10 text-slate-300 hover:bg-white/5" title="Filtros (Ctrl+Alt+F)">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <ExportMenu filteredAssets={filteredAssets} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 border-white/10 text-slate-300 hover:bg-white/5">
                  <User className="w-4 h-4 mr-2" /> Admin <Settings className="w-3 h-3 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700 text-white">
                <DropdownMenuLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Admin Panel</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)} className="cursor-pointer hover:bg-slate-800">
                  <Lock className="w-4 h-4 mr-2 text-cyan-400" /> Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-950 text-red-400">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <AssetStats assets={assets} />
        {showFilters && (
          <AssetFilters filters={filters} setFilters={setFilters} availableItems={Object.keys(itemPrefixMap)} allAssets={assets} setFilteredAssets={setAssets} />
        )}
        {loading && <div className="text-center text-slate-400 py-8">Cargando datos...</div>}
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
        <AssetLotForm isOpen={showLotForm} onClose={() => { setShowLotForm(false); setLotData(initialLotData); }} lotData={lotData} setLotData={setLotData} onSave={handleSaveLot} nextSerialNumber={getNextSerialNumberByItem(lotData.item)} initialItems={Object.keys(itemPrefixMap)} initialPrefixMap={itemPrefixMap} onItemCreated={(name, prefix) => setItemPrefixMap(prev => ({ ...prev, [name]: prefix }))} />
        <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete} />
        <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} onSuccess={handlePasswordChangeSuccess} />
      </div>
    </div>
  );
};

export default AdminPage;