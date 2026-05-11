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
  'Teclado ESENSES Basico USB': 'K',
  'Mouse Alámbrico HP Óptico negro 100': 'M',
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
  
  const [itemPrefixMap, setItemPrefixMap] = useState(() => {
    const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return DEFAULT_PREFIXES; }
    }
    return DEFAULT_PREFIXES;
  });
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
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(itemPrefixMap));
  }, [itemPrefixMap]);

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
      console.error("Polling error:", err);
    }
  }, [handleLogout]);

  const fetchExchangeRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
      const data = await response.json();
      const copRate = data.usd.cop;
      
      if (copRate) {
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
      console.error('Error fetching exchange rate:', error);
      try {
        const fallbackResponse = await fetch('https://api.frankfurter.app/latest?from=USD&to=COP');
        const fallbackData = await fallbackResponse.json();
        const copRate = fallbackData.rates.COP;
        
        if (copRate) {
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
      } catch (fallbackError) {
        setRateError(true);
      }
    } finally {
      setRateLoading(false);
    }
  }, [exchangeRate]);

  useEffect(() => {
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 20 * 1000);
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
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  } else if (rateTrend === 'down') {
    return (
      <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  } else {
    return (
      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {/* 🔹 Tasa de cambio USD/COP - Derecha con indicadores de tendencia */}
      <div className="fixed top-6 right-12 z-50 flex items-center gap-2">
        {showRate ? (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">USD → COP</p>
                
                {rateLoading ? (
                  <div className="w-24 h-6 bg-slate-700/50 rounded animate-pulse mt-0.5" />
                ) : rateError ? (
                  <p className="text-sm text-rose-400 font-mono font-bold">--</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-cyan-400 font-mono">
                      ${exchangeRate?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {previousRate && <TrendIndicator />}
                  </div>
                )}
              </div>
            </div>
            
            {lastUpdate && !rateLoading && !rateError && (
              <>
                <div className="h-8 w-px bg-white/10 mx-1" />
                <div className="text-right">
                  <p className="text-[9px] text-slate-500">Updated</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {lastUpdate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
              <button 
                onClick={fetchExchangeRate}
                disabled={rateLoading}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                title="Actualizar tasa"
              >
                <svg className={`w-4 h-4 text-slate-400 ${rateLoading ? 'animate-spin' : 'hover:text-cyan-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowRate(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                title="Ocultar tasa"
              >
                <svg className="w-4 h-4 text-slate-400 hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowRate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-xl hover:bg-slate-700/60 transition-all"
            title="Mostrar tasa USD/COP"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm text-slate-400">Show Rate</span>
          </button>
        )}
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
                onItemCreated={(name, prefix) => setItemPrefixMap(prev => ({ ...prev, [name]: prefix }))} 
              />
              <AssetTable assets={filteredAssets} onEdit={handleEdit} onDelete={handleDelete} />
            </>
          ) : activeTab === 'items' ? (
            <ItemManager items={itemPrefixMap} onItemCreated={handleItemCreated} onItemUpdated={handleItemUpdated} onItemDeleted={handleItemDeleted} /> 
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