import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminActions from '@/components/admin/AdminActions';
import AssetStats from '@/components/admin/AssetStats';
import AssetFilters from '@/components/admin/AssetFilters';
import AssetForm from '@/components/admin/AssetForm';
import AssetTable from '@/components/admin/AssetTable';
import AssetLotForm from '@/components/admin/AssetLotForm';
import ItemManager from '@/components/admin/ItemManager';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import ItemDetailPage from '@/components/item-detail/ItemDetailPage';
import StatisticsPage from '@/components/statistics/StatisticsPage';
import ItemStatisticsPage from '@/components/statistics/ItemStatisticsPage';
import { verifyPassword } from '@/utils/passwordLocal';
import { sanitizeString, isSafeInput } from '@/utils/sanitize';
import { getAssets, createAsset, updateAsset, deleteAsset, createAssetLotBulk } from '@/services/almacenService';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const DEFAULT_ITEMS = [
  'Teclado ESENSES Basico USB',
  'Mouse Alámbrico HP Óptico negro 100',
  'Cable Display Port a VGA 1,8',
  'Cable Display VGA a VGA 1,8',
  'Extension de Cable eléctrico'
];

const DEFAULT_PREFIXES = {
  'Teclado ESENSES Basico USB': { prefix: 'K', price_cop: 49700 },
  'Mouse Alámbrico HP Óptico negro 100': { prefix: 'M', price_cop: 21000 },
  'Cable Display Port a VGA 1,8': { prefix: 'DPVG', price_cop: 14538 },
  'Cable Display VGA a VGA 1,8': { prefix: 'VGAV', price_cop: 13500 },
  'Extension de Cable eléctrico': { prefix: 'EXT', price_cop: 8000 }
};

const STORAGE_ITEMS_KEY = 'inventory_items';

const generatePrefix = (itemName) => {
  if (!itemName) return 'ITM';
  const prefix = itemName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return prefix || 'ITM';
};

const normalizeItemData = (data) => {
  if (typeof data === 'string') {
    return { prefix: data, price_cop: 10000 };
  }
  if (typeof data === 'object' && data !== null) {
    return {
      prefix: data.prefix || 'ITM',
      price_cop: data.price_cop || 10000
    };
  }
  return { prefix: 'ITM', price_cop: 10000 };
};

const initialAsset = {
  id: null, name: '', serial: '',
  fecha_ingreso: '', fecha_salida: '', destino: '',
  tipo_retorno: '', observaciones_retorno: '',
  Sede_Actual: '',
  Monitor_Location: '' 
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
  const [exchangeRate, setExchangeRate] = useState(null);
  const [previousRate, setPreviousRate] = useState(null);
  const [rateTrend, setRateTrend] = useState('neutral');
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showRate, setShowRate] = useState(true);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRate, setManualRate] = useState(null);
  const [filters, setFilters] = useState({ 
    serial: '', destino: '', item: '',
    fechaEntrada: '', fechaSalida: '',
    tipo_retorno: '', observaciones: '',
    Sede_Actual: ''
  });
  
  const [itemPrefixMap, setItemPrefixMap] = useState({});
  const [itemsLoading, setItemsLoading] = useState(true);
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const formContainerRef = useRef(null);
  const isItemDetail = location.pathname.startsWith('/admin/items/');
  const currentItemName = isItemDetail ? decodeURIComponent(location.pathname.split('/').pop() || '') : null;

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
    if (!isAuthenticated) return;
    
    const fetchItems = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/almacen/items-list');
        
        if (res.ok) {
          const data = await res.json();
          const apiMap = {};
          data.forEach(i => { 
            apiMap[i.name] = { prefix: i.prefix, price_cop: i.price_cop }; 
          });
          
          const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
          let localMap = {};
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              Object.entries(parsed).forEach(([name, data]) => {
                localMap[name] = normalizeItemData(data);
              });
            } catch (e) {}
          }
          
          const normalizedDefaults = {};
          Object.entries(DEFAULT_PREFIXES).forEach(([name, data]) => {
            normalizedDefaults[name] = normalizeItemData(data);
          });
          
          const merged = { 
            ...normalizedDefaults, 
            ...localMap, 
            ...apiMap 
          };
          
          setItemPrefixMap(merged);
        }
      } catch (err) {
        console.error('Error loading items:', err);
        const normalizedDefaults = {};
        Object.entries(DEFAULT_PREFIXES).forEach(([name, data]) => {
          normalizedDefaults[name] = normalizeItemData(data);
        });
        setItemPrefixMap(normalizedDefaults);
      } finally {
        setItemsLoading(false);
      }
    };
    
    fetchItems();
  }, [isAuthenticated]);

  useEffect(() => {
    if (Object.keys(itemPrefixMap).length > 0) {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(itemPrefixMap));
    }
  }, [itemPrefixMap]);

  const refreshItems = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/almacen/items-list');
      if (res.ok) {
        const data = await res.json();
        const apiMap = {};
        data.forEach(i => { 
          apiMap[i.name] = { prefix: i.prefix, price_cop: i.price_cop }; 
        });
        
        setItemPrefixMap(prev => {
          const normalizedPrev = {};
          Object.entries(prev).forEach(([name, data]) => {
            normalizedPrev[name] = normalizeItemData(data);
          });
          
          const normalizedDefaults = {};
          Object.entries(DEFAULT_PREFIXES).forEach(([name, data]) => {
            normalizedDefaults[name] = normalizeItemData(data);
          });
          
          return { 
            ...normalizedDefaults, 
            ...normalizedPrev, 
            ...apiMap 
          };
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (location.pathname === '/admin') {
      setActiveTab('assets');
    } else if (location.pathname === '/admin/statistics') {
      const urlParams = new URLSearchParams(location.search);
      const itemFromUrl = urlParams.get('item');
      if (itemFromUrl) {
        setActiveTab('itemStatistics');
      } else {
        setActiveTab('statistics');
      }
    }
  }, [location.pathname, location.search]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('admin_login_attempts');
    localStorage.removeItem('admin_lockout_until');
    navigate('/admin', { replace: true });
    toast({ title: "Logout", description: "Session closed successfully" });
  }, [navigate]);

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
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (showForm && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        handleLogout();
        return;
      }
      toast({ title: "Error", description: 'Error loading assets: ' + err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  const refreshAssets = useCallback(async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('unauthorized')) {
        handleLogout();
        return;
      }
    }
  }, [handleLogout]);


const fetchExchangeRate = useCallback(async () => {
  setRateLoading(true);
  try {
    const response = await fetch('http://localhost:8000/api/almacen/trm-tiempo-real');
    const data = await response.json();
    
    if (data.success && data.valor) {
      const copRate = data.valor;
      
      
      if (exchangeRate !== null) {
        if (copRate > exchangeRate) setRateTrend('up');
        else if (copRate < exchangeRate) setRateTrend('down');
        else setRateTrend('neutral');
      }
      setPreviousRate(exchangeRate);
      setExchangeRate(copRate);
      setLastUpdate(new Date());
      setRateError(false);
    } else {
      
      setRateError(true);
    }
  } catch (error) {
    
    setRateError(true);
  } finally {
    setRateLoading(false);
  }
}, [exchangeRate]);


  useEffect(() => {
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  useEffect(() => {
    if (isAuthenticated) loadAssets();
  }, [isAuthenticated, loadAssets]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const POLL_INTERVAL = 10000;
    let intervalId;
    const poll = () => {
      if (showForm || showLotForm) return;
      if (document.hidden) return;
      refreshAssets();
    };
    poll();
    intervalId = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, showForm, showLotForm, refreshAssets]);

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
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
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

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    toast({ title: "Password changed", description: "Admin password updated successfully." });
  };

  const handleItemCreated = (name, prefix, price_cop = 10000) => {
    setItemPrefixMap(prev => ({ 
      ...prev, 
      [name]: { prefix: prefix || generatePrefix(name), price_cop } 
    }));
  };

  const handleItemUpdated = (oldName, newName, newPrefix, newPrice = 10000) => {
    setItemPrefixMap(prev => {
      const newMap = { ...prev };
      delete newMap[oldName];
      newMap[newName] = { prefix: newPrefix || generatePrefix(newName), price_cop: newPrice };
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
    const itemData = itemPrefixMap[itemName];
    const prefix = itemData?.prefix || generatePrefix(itemName);
    const numbers = assets.filter(a => a.name === itemName && a.serial).map(a => {
      const numMatch = a.serial.match(new RegExp(`^${prefix}(\\d+)$`));
      return numMatch ? parseInt(numMatch[1], 10) : null;
    }).filter(n => n !== null && !isNaN(n));
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
      const itemData = itemPrefixMap[editingAsset.name];
      const prefix = itemData?.prefix || generatePrefix(editingAsset.name);
      const nextNum = getNextSerialNumberByItem(editingAsset.name);
      finalAsset.serial = `${prefix}${String(nextNum).padStart(5, '0')}`;
    } else if (updateSerial) {
      const oldAsset = assets.find(a => String(a.id) === String(editingAsset.id));
      if (oldAsset && oldAsset.name !== editingAsset.name) {
        const itemData = itemPrefixMap[editingAsset.name];
        const newPrefix = itemData?.prefix || generatePrefix(editingAsset.name);
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
    const itemData = itemPrefixMap[lotData.item];
    const prefix = itemData?.prefix || generatePrefix(lotData.item);
    let nextSerialNum = getNextSerialNumberByItem(lotData.item);
    const newAssets = [];
    for (let i = 0; i < quantity; i++) {
      const serial = `${prefix}${String(nextSerialNum).padStart(5, '0')}`;
      if (assets.some(a => a.serial === serial)) { nextSerialNum++; continue; }
      newAssets.push({ name: lotData.item, serial, fecha_ingreso: lotData.fecha_ingreso, fecha_salida: '', destino: '', tipo_retorno: '', observaciones_retorno: '', Sede_Actual: lotData.Sede_Actual || null });
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

  const TrendIndicator = () => {
    if (rateTrend === 'up') {
      return (
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (rateTrend === 'down') {
      return (
        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4-4 4M3 12h18" />
        </svg>
      );
    }
  };

  if (!isAuthenticated) {
    const isLocked = lockoutUntil && Date.now() < lockoutUntil;
    const timeLeft = isLocked ? Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000)) : 0;
    return <AdminLogin onLogin={handleLogin} error={error} isLocked={isLocked} timeLeft={timeLeft} />;
  }

  return (
    <>
      {/* 🔹 Tasa de cambio USD/COP - Responsive para móvil */}
      <div className="fixed top-2 right-2 sm:top-6 sm:right-12 z-50">
        {showRate ? (
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 backdrop-blur-md border border-cyan-500/30 rounded-lg sm:rounded-xl shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">USD → COP</p>
                
                {rateLoading ? (
                  <div className="w-16 h-4 sm:w-24 sm:h-6 bg-slate-700/50 rounded animate-pulse mt-0.5" />
                ) : rateError ? (
                  <p className="text-xs sm:text-sm text-rose-400 font-mono font-bold">--</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <p className="text-sm sm:text-lg font-bold text-cyan-400 font-mono truncate">
                      ${exchangeRate?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    {previousRate && <TrendIndicator />}
                  </div>
                )}
              </div>
            </div>
            
            {lastUpdate && !rateLoading && !rateError && (
              <div className="hidden sm:flex items-center gap-1 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-white/10">
                <div className="text-right">
                  <p className="text-[8px] sm:text-[9px] text-slate-500">Updated</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                    {lastUpdate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto sm:ml-2 pl-1 sm:pl-2 border-l border-white/10">
              <button 
                onClick={fetchExchangeRate}
                disabled={rateLoading}
                className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition-all disabled:opacity-50"
                title="Actualizar tasa"
              >
                <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 ${rateLoading ? 'animate-spin' : 'hover:text-cyan-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowRate(false)}
                className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition-all"
                title="Ocultar tasa"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowRate(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-lg sm:rounded-xl hover:bg-slate-700/60 transition-all"
            title="Mostrar tasa USD/COP"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">Show Rate</span>
          </button>
        )}
      </div>

      {/* 🔹 Contenedor principal responsive */}
      <div className="min-h-screen px-3 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-x-auto">
        <div className="container mx-auto max-w-full sm:max-w-[90rem]">  
          {/* 🔹 Header responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3">
            <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
            <AdminActions
              activeTab={activeTab}
              onAdd={handleAdd}
              onAddLot={() => setShowLotForm(true)}
              onToggleFilters={() => setShowFilters(prev => !prev)}
              filteredAssets={filteredAssets}
              itemPrefixMap={itemPrefixMap} 
              exchangeRate={exchangeRate}
              onLogout={handleLogout}
              onChangePassword={() => setShowChangePasswordModal(true)}
            />
          </div>

          {/* 🔹 Contenido responsive */}
          {isItemDetail && currentItemName ? (
            <ItemDetailPage assets={assets} itemName={currentItemName} onBack={() => navigate('/admin')} />
          ) : activeTab === 'assets' ? (
            <>
              <AssetStats 
                assets={assets} 
                availableItems={Object.keys(itemPrefixMap)}
                onItemSelect={(itemName) => {
                  if (itemName) {
                    setActiveTab('itemStatistics');
                    navigate(`/admin/statistics?item=${encodeURIComponent(itemName)}`);
                  }
                }}
              />
              {showFilters && <AssetFilters filters={filters} setFilters={setFilters} availableItems={Object.keys(itemPrefixMap)} />}
              {loading && <div className="text-center text-slate-400 py-8">Loading data...</div>}
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
                onItemCreated={(name, prefix, price) => handleItemCreated(name, prefix, price)} 
              />
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete} onRefresh={loadAssets} />
              </div>
            </>
          ) : activeTab === 'items' ? (
            itemsLoading ? (
              <div className="text-center text-slate-400 py-8">Loading items...</div>
            ) : (
              <ItemManager items={itemPrefixMap} onRefresh={refreshItems} />
            )
          ) : activeTab === 'statistics' ? (
            <StatisticsPage assets={assets} availableItems={Object.keys(itemPrefixMap)} />
          ) : activeTab === 'itemStatistics' ? (
            <ItemStatisticsPage assets={assets} availableItems={Object.keys(itemPrefixMap)} />
          ) : null}

          <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} onSuccess={handlePasswordChangeSuccess} />
        </div>
      </div>
    </>
  );
};

export default AdminPage;