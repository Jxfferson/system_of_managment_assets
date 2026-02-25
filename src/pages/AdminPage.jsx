import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, LogOut, Save, X, Filter, Package, Monitor, HardDrive, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import Modal from '@/components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'admin123';

const initialAsset = {
  id: null,
  name: '',
  type: 'Desktop Computer',
  serial: '',
  quantity: 1,
  date: '',
  status: 'available',
  assignedTo: '',
  notes: ''
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onConfirm: null
  });

  // FILTROS
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    serial: '',
    type: '',
    status: '',
    date: ''
  });

  const navigate = useNavigate();

  // Cargar datos desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('assets');
    if (stored) {
      setAssets(JSON.parse(stored));
    } else {
      const exampleAssets = [
        { id: '1', name: 'Laptop Dell XPS 15', type: 'Laptop', serial: 'DELL12345', quantity: 1, date: '2026-02-01', status: 'available', assignedTo: '', notes: '' },
        { id: '2', name: 'Monitor Samsung 24"', type: 'Monitor', serial: 'SAM67890', quantity: 2, date: '2026-01-15', status: 'in-use', assignedTo: 'Juan Pérez', notes: '' },
      ];
      setAssets(exampleAssets);
      localStorage.setItem('assets', JSON.stringify(exampleAssets));
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  // Filtrado avanzado
  const filteredAssets = assets.filter(asset => {
    return (
      (filters.name === '' || asset.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.serial === '' || asset.serial.toLowerCase().includes(filters.serial.toLowerCase())) &&
      (filters.type === '' || asset.type === filters.type) &&
      (filters.status === '' || asset.status === filters.status) &&
      (filters.date === '' || asset.date === filters.date)
    );
  });

  // LOGIN
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

  // AGREGAR
  const handleAdd = () => {
    setEditingAsset(initialAsset);
    setShowForm(true);
  };

  // EDITAR
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  // ELIMINAR
  const handleDelete = (id) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this asset?',
      onConfirm: () => {
        setAssets(prev => prev.filter(a => a.id !== id));
        setModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // GUARDAR
  const handleSave = () => {
    if (!editingAsset.name || !editingAsset.serial) {
      alert('Name and Serial are required');
      return;
    }

    if (editingAsset.id) {
      setAssets(prev =>
        prev.map(a => a.id === editingAsset.id ? editingAsset : a)
      );
    } else {
      const newAsset = {
        ...editingAsset,
        id: Date.now().toString()
      };
      setAssets(prev => [...prev, newAsset]);
    }

    setShowForm(false);
    setEditingAsset(initialAsset);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAsset(initialAsset);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'in-use': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'maintenance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'retired': 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const config = statusConfig[status] || statusConfig['available'];
    
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${config}`}>
        {status}
      </span>
    );
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl p-6 sm:p-8 md:p-12 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 mb-4 sm:mb-6 shadow-lg shadow-cyan-500/30">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">Admin Access</h1>
            <p className="text-slate-400 text-base sm:text-lg">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 sm:mb-3 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-12 sm:h-14 text-base bg-slate-800/50 border-white/20 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                autoFocus
              />
            </div>
            {error && (
              <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs sm:text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] rounded-xl"
            >
              Login
            </Button>
          </form>
          
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN SCREEN
  return (
    <div className="min-h-screen px-4 sm:px-6 pb-8 sm:pb-12">
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
      />

      <div className="container mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Asset Management
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={handleAdd} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-white/10 text-slate-300 w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Total Assets</p>
                <p className="text-xl sm:text-2xl font-semibold text-slate-300">{assets.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/5 flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500/60" />
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Available</p>
                <p className="text-xl sm:text-2xl font-semibold text-emerald-400">{assets.filter(a => a.status === 'available').length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400/60 fill-current" />
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">In Use</p>
                <p className="text-xl sm:text-2xl font-semibold text-blue-400">{assets.filter(a => a.status === 'in-use').length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/5 flex items-center justify-center">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400/60" />
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Maintenance</p>
                <p className="text-xl sm:text-2xl font-semibold text-amber-400">{assets.filter(a => a.status === 'maintenance').length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/5 flex items-center justify-center">
                <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/60" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER FORM */}
        {showFilters && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Input
              placeholder="Filter by Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-full"
            />
            <Input
              placeholder="Filter by Serial"
              value={filters.serial}
              onChange={(e) => setFilters({ ...filters, serial: e.target.value })}
              className="w-full"
            />
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full"
            >
              <option value="">All Types</option>
              <option value="Desktop Computer">Desktop Computer</option>
              <option value="Laptop">Laptop</option>
              <option value="Monitor">Monitor</option>
              <option value="Server">Server</option>
              <option value="Network Equipment">Network Equipment</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Printer">Printer</option>
              <option value="Other">Other</option>
            </Select>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </Select>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full"
            />
          </div>
        )}

        {/* FORM CREATE / EDIT */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              {editingAsset.id ? 'Edit Asset' : 'New Asset'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                placeholder="Asset Name *"
                value={editingAsset.name}
                onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="Serial Number *"
                value={editingAsset.serial}
                onChange={(e) => setEditingAsset({ ...editingAsset, serial: e.target.value })}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={editingAsset.quantity}
                onChange={(e) => setEditingAsset({ ...editingAsset, quantity: e.target.value })}
                className="w-full"
              />
              <Input
                type="date"
                value={editingAsset.date}
                onChange={(e) => setEditingAsset({ ...editingAsset, date: e.target.value })}
                className="w-full"
              />
              <Select
                value={editingAsset.type}
                onChange={(e) => setEditingAsset({ ...editingAsset, type: e.target.value })}
                className="w-full"
              >
                <option value="Desktop Computer">Desktop Computer</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Server">Server</option>
                <option value="Network Equipment">Network Equipment</option>
                <option value="Mobile Device">Mobile Device</option>
                <option value="Printer">Printer</option>
                <option value="Other">Other</option>
              </Select>
              <Select
                value={editingAsset.status}
                onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value })}
                className="w-full"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </Select>
              <Input
                placeholder="Assigned To (optional)"
                value={editingAsset.assignedTo}
                onChange={(e) => setEditingAsset({ ...editingAsset, assignedTo: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="Notes (optional)"
                value={editingAsset.notes}
                onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </motion.div>
        )}

        {/* TABLE - Responsive: Cards on mobile, Table on desktop */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
          
          {/* VISTA CARD PARA MÓVIL (oculta en md+) */}
          <div className="md:hidden divide-y divide-white/5">
            {filteredAssets.length > 0 ? (
              filteredAssets.map(asset => (
                <div key={asset.id} className="p-4 space-y-3">
                  {/* Header de la card */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{asset.name}</h3>
                      <p className="text-xs text-slate-500">{asset.serial}</p>
                    </div>
                    {getStatusBadge(asset.status)}
                  </div>
                  
                  {/* Grid de datos */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs">Type</span>
                      <p className="text-slate-300">{asset.type}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Quantity</span>
                      <p className="text-slate-300">{asset.quantity}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Date</span>
                      <p className="text-slate-300">{asset.date || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Assigned</span>
                      <p className="text-slate-300">{asset.assignedTo || '-'}</p>
                    </div>
                  </div>
                  
                  {/* Notas si existen */}
                  {asset.notes && (
                    <p className="text-xs text-slate-400 italic border-l-2 border-cyan-500/30 pl-2">
                      {asset.notes}
                    </p>
                  )}
                  
                  {/* Acciones */}
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleEdit(asset)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(asset.id)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No assets found</h3>
                <p className="text-slate-400 text-sm mb-4">Get started by adding your first asset</p>
                <Button onClick={handleAdd} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Asset
                </Button>
              </div>
            )}
          </div>

          {/* VISTA TABLA PARA DESKTOP (oculta en md-) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Name</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Serial</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Type</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Quantity</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Date</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Assigned To</th>
                  <th className="px-6 py-3 text-slate-400 text-xs uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{asset.name}</p>
                        <p className="text-xs text-slate-500 md:hidden">{asset.serial}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{asset.serial}</td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{asset.type}</td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{asset.quantity}</td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{asset.date || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{asset.assignedTo || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(asset)} className="text-cyan-400 hover:text-cyan-300 transition-colors p-1 hover:bg-cyan-500/10 rounded">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state para desktop (solo visible en md+) */}
          {filteredAssets.length === 0 && (
            <div className="hidden md:flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6">
                  <Package className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No assets found</h3>
                <p className="text-slate-400 mb-8">Get started by adding your first asset</p>
                <Button 
                  onClick={handleAdd}
                  className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Your First Asset
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
