import React, { useState, useEffect } from 'react';
import { Plus, Filter, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '@/components/admin/AdminLogin';
import AssetStats from '@/components/admin/AssetStats';
import AssetFilters from '@/components/admin/AssetFilters';
import AssetForm from '@/components/admin/AssetForm';
import AssetTable from '@/components/admin/AssetTable';
import ExportMenu from '@/components/admin/ExportMenu';

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
  const [showFilters, setShowFilters] = useState(false);
  const [editingAsset, setEditingAsset] = useState(initialAsset);
  const [filters, setFilters] = useState({
    name: '',
    serial: '',
    type: '',
    status: '',
    date: ''
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onConfirm: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('assets');
    if (stored) {
      setAssets(JSON.parse(stored));
    } else {
      const exampleAssets = [
        { id: '1', name: 'Laptop Dell XPS 15', type: 'Laptop', serial: 'DELL12345', quantity: 1, date: '2026-02-01', status: 'available', assignedTo: '', notes: '' },
        { id: '2', name: 'Monitor Samsung 24"', type: 'Monitor', serial: 'SAM67890', quantity: 2, date: '2026-01-15', status: 'in-use', assignedTo: 'Juan Perez', notes: '' },
      ];
      setAssets(exampleAssets);
      localStorage.setItem('assets', JSON.stringify(exampleAssets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  const filteredAssets = assets.filter(asset => {
    return (
      (filters.name === '' || asset.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.serial === '' || asset.serial.toLowerCase().includes(filters.serial.toLowerCase())) &&
      (filters.type === '' || asset.type === filters.type) &&
      (filters.status === '' || asset.status === filters.status) &&
      (filters.date === '' || asset.date === filters.date)
    );
  });

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
    setEditingAsset(initialAsset);
    setShowForm(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

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

  const handleSave = () => {
    if (!editingAsset.name || !editingAsset.serial) {
      alert('Name and Serial are required');
      return;
    }
    if (editingAsset.id) {
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? editingAsset : a));
    } else {
      const newAsset = { ...editingAsset, id: Date.now().toString() };
      setAssets(prev => [...prev, newAsset]);
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
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="h-10 px-7 bg-gradient-to-r from-cyan-500 to-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-white/10 text-slate-300">
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
          <AssetFilters filters={filters} setFilters={setFilters} />
        )}

        {showForm && (
          <AssetForm
            editingAsset={editingAsset}
            setEditingAsset={setEditingAsset}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        <AssetTable
          assets={filteredAssets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>
    </div>
  );
};

export default AdminPage;