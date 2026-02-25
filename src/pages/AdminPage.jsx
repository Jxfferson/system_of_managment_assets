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
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl p-12 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 mb-6 shadow-lg shadow-cyan-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">Admin Access</h1>
            <p className="text-slate-400 text-lg">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-14 text-base bg-slate-800/50 border-white/20 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                autoFocus
              />
            </div>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] rounded-xl"
            >
              Login
            </Button>
          </form>
          
          <div className="mt-8 text-center">
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
    <div className="min-h-screen px-6 pb-12">
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">
            Asset Management
          </h1>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-white/10 text-slate-300"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* STATS CARDS - Disimuladas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Total Assets</p>
                <p className="text-2xl font-semibold text-slate-300">{assets.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/5 flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-500/60" />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Available</p>
                <p className="text-2xl font-semibold text-emerald-400">{assets.filter(a => a.status === 'available').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                <Circle className="w-5 h-5 text-emerald-400/60 fill-current" />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">In Use</p>
                <p className="text-2xl font-semibold text-blue-400">{assets.filter(a => a.status === 'in-use').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/5 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-400/60" />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">Maintenance</p>
                <p className="text-2xl font-semibold text-amber-400">{assets.filter(a => a.status === 'maintenance').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/5 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-amber-400/60" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER FORM */}
        {showFilters && (
          <div className="mb-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Filter by Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Input
              placeholder="Filter by Serial"
              value={filters.serial}
              onChange={(e) => setFilters({ ...filters, serial: e.target.value })}
            />
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
            />
          </div>
        )}

        {/* FORM CREATE / EDIT */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-white/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingAsset.id ? 'Edit Asset' : 'New Asset'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Asset Name *"
                value={editingAsset.name}
                onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
              />
              <Input
                placeholder="Serial Number *"
                value={editingAsset.serial}
                onChange={(e) => setEditingAsset({ ...editingAsset, serial: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={editingAsset.quantity}
                onChange={(e) => setEditingAsset({ ...editingAsset, quantity: e.target.value })}
              />
              <Input
                type="date"
                value={editingAsset.date}
                onChange={(e) => setEditingAsset({ ...editingAsset, date: e.target.value })}
              />
              <Select
                value={editingAsset.type}
                onChange={(e) => setEditingAsset({ ...editingAsset, type: e.target.value })}
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
              />
              <Input
                placeholder="Notes (optional)"
                value={editingAsset.notes}
                onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </motion.div>
        )}

        {/* TABLE */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Name</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Serial</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Type</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Quantity</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Date</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Status</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Assigned To</th>
                <th className="px-6 py-3 text-slate-400 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{asset.name}</td>
                  <td className="px-6 py-4 text-slate-300">{asset.serial}</td>
                  <td className="px-6 py-4 text-slate-300">{asset.type}</td>
                  <td className="px-6 py-4 text-slate-300">{asset.quantity}</td>
                  <td className="px-6 py-4 text-slate-300">{asset.date || '-'}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(asset.status)}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{asset.assignedTo || '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(asset)} className="mr-3 text-cyan-400">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-16">
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
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;