import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, LogOut, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import Modal from '@/components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'admin123'; // Cambia esto por la contraseña que desees

const initialAsset = {
  id: null,
  name: '',
  type: 'Desktop Computer',
  serial: '',
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
  const [modalState, setModalState] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('assets');
    if (stored) {
      setAssets(JSON.parse(stored));
    } else {
      const exampleAssets = [
        { id: '1', name: 'Laptop Dell XPS 15', type: 'Laptop', serial: 'DELL12345', status: 'available', assignedTo: '', notes: '' },
        { id: '2', name: 'Monitor Samsung 24"', type: 'Monitor', serial: 'SAM67890', status: 'in-use', assignedTo: 'Juan Pérez', notes: '' },
      ];
      setAssets(exampleAssets);
      localStorage.setItem('assets', JSON.stringify(exampleAssets));
    }
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('assets', JSON.stringify(assets));
    }
  }, [assets]);

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

  const handleAdd = () => {
    setEditingAsset({ ...initialAsset, id: Date.now().toString() });
    setShowForm(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset({ ...asset });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this asset?',
      onConfirm: () => {
        setAssets(assets.filter(a => a.id !== id));
        setModalState({ ...modalState, isOpen: false });
      }
    });
  };

  const handleSave = () => {
    if (!editingAsset.name || !editingAsset.serial) {
      alert('Name and Serial are required');
      return;
    }
    if (editingAsset.id) {
      setAssets(assets.map(a => a.id === editingAsset.id ? editingAsset : a));
    } else {
      setAssets([...assets, { ...editingAsset, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingAsset(initialAsset);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAsset(initialAsset);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10"
        >
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pb-12">
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Management</span>
          </h1>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-white/10 text-slate-300">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">{editingAsset.id ? 'Edit Asset' : 'New Asset'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Asset Name *"
                value={editingAsset.name}
                onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
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
              <Input
                placeholder="Serial Number *"
                value={editingAsset.serial}
                onChange={(e) => setEditingAsset({ ...editingAsset, serial: e.target.value })}
              />
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
              <Button onClick={handleCancel} variant="outline" className="border-white/10">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </motion.div>
        )}

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Serial</th>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {assets.map(asset => (
                <tr key={asset.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{asset.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{asset.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{asset.serial}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      asset.status === 'in-use' ? 'bg-blue-500/20 text-blue-400' :
                      asset.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{asset.assignedTo || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(asset)} className="text-cyan-400 hover:text-cyan-300 mr-3">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No assets found. Add one!</td>
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