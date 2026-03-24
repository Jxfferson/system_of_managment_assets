import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

import AdminLogin from '@/components/admin/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminActions from '@/components/admin/AdminActions';
import AssetStats from '@/components/admin/AssetStats';
import AssetFilters from '@/components/admin/AssetFilters';
import AssetForm from '@/components/admin/AssetForm';
import AssetTable from '@/components/admin/AssetTable';
import ExportMenu from '@/components/admin/ExportMenu';
import AssetLotForm from '@/components/admin/AssetLotForm';
import ItemManager from '../components/admin/ItemManager';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';

import { verifyPassword } from '@/utils/passwordLocal';
import { sanitizeString, isSafeInput } from '@/utils/sanitize';
import { getAssets, createAsset, updateAsset, deleteAsset, createAssetLotBulk } from '@/services/almacenService';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

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

const STORAGE_ITEMS_KEY = 'inventory_items';

const generatePrefix = (itemName) => {
  if (!itemName) return 'ITM';
  const prefix = itemName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return prefix || 'ITM';
};

const initialAsset = {
  id: null, name: '', serial: '',
  fecha_ingreso: '', fecha_salida: '', destino: '',
  tipo_retorno: '', observaciones_retorno: '',
  Sede_Actual: ''
};

const initialLotData = {
  item: '', quantity: 1,
  fecha_ingreso: new Date().toISOString().split('T')[0]
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [lotData, setLotData] = useState(initialLotData);
  const [filters, setFilters] = useState({ 
    serial: '', destino: '', item: '',
    fechaEntrada: '', fechaSalida: '',
    tipo_retorno: '', observaciones: '',
    Sede_Actual: ''
  });
  
  const [itemPrefixMap, setItemPrefixMap] = useState(() => {
    const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return DEFAULT_PREFIXES; }
    }
    return DEFAULT_PREFIXES;
  });
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  
  const formContainerRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('csrf_token')) {
      localStorage.setItem('csrf_token', crypto.randomUUID());
    }
    const authStatus = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('auth_token');
    if (authStatus === 'true' && authToken) setIsAuthenticated(true);

    const storedLockout = localStorage.getItem('admin_lockout_until');
    const storedAttempts = localStorage.getItem('admin_login_attempts');
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (!isNaN(lockoutTime) && Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime);
        setLoginAttempts(parseInt(storedAttempts, 10) || 0);
      } else {
        localStorage.removeItem('admin_lockout_until');
        localStorage.removeItem('admin_login_attempts');
      }
    }
  }, []);

  useEffect(() => {
    if (!lockoutUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        setLoginAttempts(0);
        localStorage.removeItem('admin_lockout_until');
        localStorage.removeItem('admin_login_attempts');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(itemPrefixMap));
  }, [itemPrefixMap]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleLogout(), 30 * 60 * 1000);
    };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (showForm && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [showForm]);

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
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        handleLogout();
        return;
      }
      toast({ title: "Error", description: 'Error loading assets: ' + err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAssets();
  }, [isAuthenticated]);

  useKeyboardShortcut('ctrl+alt+n', () => {
    if (activeTab === 'assets') {
      toast({ title: "New Asset" });
      setShowForm(prev => {
        if (prev) {
          setEditingAsset(initialAsset);
          return false;
        }
        setEditingAsset({ ...initialAsset, fecha_ingreso: new Date().toISOString().split('T')[0] });
        return true;
      });
    }
  }, { enabled: isAuthenticated });

  useKeyboardShortcut('ctrl+alt+l', () => {
    if (activeTab === 'assets') {
      toast({ title: "New Lot" });
      setShowLotForm(true);
    }
  }, { enabled: isAuthenticated });

  useKeyboardShortcut('ctrl+alt+f', () => {
    if (activeTab === 'assets') {
      toast({ title: "Filters" });
      setShowFilters(prev => !prev);
    }
  }, { enabled: isAuthenticated });

  const compareDates = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const filteredAssets = assets.filter(asset => {
    const matchSerial = filters.serial === '' || (asset.serial && asset.serial.toLowerCase().includes(filters.serial.toLowerCase()));
    const matchDestino = filters.destino === '' || (asset.destino && asset.destino.toLowerCase().includes(filters.destino.toLowerCase()));
    const matchItem = filters.item === '' || asset.name === filters.item;
    const matchSede = filters.Sede_Actual === '' || asset.Sede_Actual === filters.Sede_Actual;
    let matchFechaEntrada = true;
    if (filters.fechaEntrada !== '') matchFechaEntrada = compareDates(asset.fecha_ingreso, filters.fechaEntrada);
    let matchFechaSalida = true;
    if (filters.fechaSalida !== '') matchFechaSalida = compareDates(asset.fecha_salida, filters.fechaSalida);
    let matchReturnType = true;
    if (filters.tipo_retorno !== '') matchReturnType = asset.tipo_retorno === filters.tipo_retorno;
    let matchObservaciones = true;
    if (filters.observaciones !== '') matchObservaciones = asset.observaciones_retorno && asset.observaciones_retorno.toLowerCase().includes(filters.observaciones.toLowerCase());
    return matchSerial && matchDestino && matchItem && matchSede && matchFechaEntrada && matchFechaSalida && matchReturnType && matchObservaciones;
  });

  const handleLogin = (enteredPassword) => {
    if (!enteredPassword || enteredPassword.length < 4) {
      setError('Contraseña muy corta');
      toast({ title: "Error", description: "The password must have at least 4 characters.", variant: "destructive" });
      return;
    }
    if (!isSafeInput(enteredPassword)) {
      setError('Caracteres no válidos');
      toast({ title: "Error", description: "The password contains invalid characters.", variant: "destructive" });
      return;
    }
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MS = 1 * 60 * 1000;
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Demasiados intentos. Espera ${secondsLeft}s`);
      return;
    }
    if (verifyPassword(enteredPassword)) {
      setIsAuthenticated(true);
      setError('');
      setLoginAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem('admin_login_attempts');
      localStorage.removeItem('admin_lockout_until');
      localStorage.setItem('auth_token', crypto.randomUUID());
      localStorage.setItem('isAuthenticated', 'true');
      toast({ title: "Welcome!", description: "Successful login" });
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_MS;
        setLockoutUntil(lockoutTime);
        localStorage.setItem('admin_lockout_until', lockoutTime.toString());
        setError(`You can re-enter your credentials.`);
      } else {
        const attemptsLeft = MAX_ATTEMPTS - newAttempts;
        setError(`Incorrect password. Remaining attempts: ${attemptsLeft}`);
      }
      toast({ title: "Error", description: "Incorrect password", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('admin_login_attempts');
    localStorage.removeItem('admin_lockout_until');
    navigate('/admin', { replace: true });
    toast({ title: "Logout", description: "Session closed successfully" });
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    toast({ title: "Password changed", description: "Admin password updated successfully." });
  };

  const handleItemCreated = (name, prefix) => {
    setItemPrefixMap(prev => ({ ...prev, [name]: prefix || generatePrefix(name) }));
  };

  const handleItemUpdated = (oldName, newName, newPrefix) => {
    setItemPrefixMap(prev => {
      const newMap = { ...prev };
      delete newMap[oldName];
      newMap[newName] = newPrefix || generatePrefix(newName);
      return newMap;
    });
  };

  const handleItemDeleted = (name) => {
    setItemPrefixMap(prev => {
      const newMap = { ...prev };
      delete newMap[name];
      return newMap;
    });
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
    setShowForm(prev => {
      if (prev) {
        setEditingAsset(initialAsset);
        return false;
      } else {
        setEditingAsset({ ...initialAsset, fecha_ingreso: new Date().toISOString().split('T')[0] });
        return true;
      }
    });
  };

  const handleSave = async (updateSerial = false) => {
    if (!editingAsset.name || !editingAsset.fecha_ingreso) {
      toast({ title: "Error", description: "Item and Fecha Ingreso are required", variant: "destructive" });
      return;
    }
    if (!isSafeInput(editingAsset.name)) {
      toast({ title: "Error", description: "The item's name contains invalid characters", variant: "destructive" });
      return;
    }
    if (editingAsset.observaciones_retorno && !isSafeInput(editingAsset.observaciones_retorno)) {
      toast({ title: "Error", description: "The observations contains invalid characters", variant: "destructive" });
      return;
    }
    if ((editingAsset.tipo_retorno === 'Perdida' || editingAsset.tipo_retorno === 'Daño') && !editingAsset.observaciones_retorno?.trim()) {
      toast({ title: "Error", description: "Observations required for losses/damages", variant: "destructive" });
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
    if (finalAsset.tipo_retorno) finalAsset.fecha_salida = null;
    try {
      if (editingAsset.id) await updateAsset(finalAsset);
      else await createAsset(finalAsset);
      await loadAssets();
      setShowForm(false);
      setEditingAsset(initialAsset);
      toast({ title: "Éxito", description: "Asset saved succesfully" });
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        handleLogout();
        return;
      }
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

const handleSaveLot = async () => {
  if (!lotData.item || !lotData.quantity || !lotData.fecha_ingreso) {
    toast({ title: "Error", description: "Item, Quantity and Fecha Entry are required", variant: "destructive" });
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
      observaciones_retorno: '',
      Sede_Actual: lotData.Sede_Actual || null  // ← NUEVO CAMPO ✅
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
    if (err.message.includes('401') || err.message.includes('unauthorized')) {
      handleLogout();
      return;
    }
    toast({ title: "Error", description: err.message, variant: "destructive" });
  }
};

  const handleDelete = async (id) => {
    try {
      await deleteAsset(id);
      await loadAssets();
      toast({ title: "Asset deleted" });
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        handleLogout();
        return;
      }
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    const isLocked = lockoutUntil && Date.now() < lockoutUntil;
    const timeLeft = isLocked ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000)) : 0;
    return <AdminLogin onLogin={handleLogin} error={error} isLocked={isLocked} timeLeft={timeLeft} />;
  }

  return (
    <>
      <div className="fixed top-6 left-12 right-0 z-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-gray-200">
            OTD
          </span>
          <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Support
          </span>
        </div>
      </div>

      <div className="min-h-screen px-6 pt-20 pb-12 overflow-x-auto">
        <div className="container mx-auto max-w-[90rem]">  
          <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
            <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
            <AdminActions
              activeTab={activeTab}
              onAdd={handleAdd}
              onAddLot={() => setShowLotForm(true)}
              onToggleFilters={() => setShowFilters(prev => !prev)}
              filteredAssets={filteredAssets}
              onLogout={handleLogout}
              onChangePassword={() => setShowChangePasswordModal(true)}
            />
          </div>

          {activeTab === 'assets' ? (
            <>
              <AssetStats assets={assets} />
              {showFilters && <AssetFilters filters={filters} setFilters={setFilters} availableItems={Object.keys(itemPrefixMap)} />}
              {loading && <div className="text-center text-slate-400 py-8">Cargando datos...</div>}
              {showForm && (
                <div ref={formContainerRef} className="scroll-mt-32 mb-6">
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
                </div>
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
                onItemCreated={(name, prefix) => setItemPrefixMap(prev => ({ ...prev, [name]: prefix }))} 
              />
              <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete} />
            </>
          ) : (
            <ItemManager
              items={itemPrefixMap}
              onItemCreated={handleItemCreated}              
              onItemUpdated={handleItemUpdated}
              onItemDeleted={handleItemDeleted}             
            /> 
          )}

          <ChangePasswordModal 
            isOpen={showChangePasswordModal} 
            onClose={() => setShowChangePasswordModal(false)} 
            onSuccess={handlePasswordChangeSuccess} 
          />
        </div>
      </div>
    </>
  );
};

export default AdminPage;