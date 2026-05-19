import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const ItemManager = ({ items, onRefresh }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrefix, setNewItemPrefix] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(10000);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, itemName: '' });
  const [loading, setLoading] = useState(false);
  const API = 'http://localhost:8000/api/almacen';

  const handleCreate = async () => {
    const name = newItemName.trim();
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prefix: newItemPrefix.trim().toUpperCase() || null, price_cop: newItemPrice })
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setNewItemName(''); setNewItemPrefix(''); setNewItemPrice(10000);
      toast({ title: "Item created" });
      onRefresh();
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/items/${encodeURIComponent(editingItem.originalName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editingItem.newName !== editingItem.originalName ? editingItem.newName : undefined,
          prefix: editingItem.newPrefix || null,
          price_cop: editingItem.newPrice
        })
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setEditingItem(null);
      toast({ title: "Item updated" });
      onRefresh();
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/items/${encodeURIComponent(deleteConfirm.itemName)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast({ title: "Item deleted" });
      onRefresh();
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); setDeleteConfirm({ isOpen: false, itemName: '' }); }
  };

  const getPrice = (data) => {
    if (typeof data === 'object' && data !== null) return data.price_cop || 10000;
    return 10000;
  };

  const getPrefix = (data) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) return data.prefix || '-';
    return '-';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Item Management</h2>
      
      <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Create new item</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-slate-400 block mb-1">Item name *</label>
            <Input 
              value={newItemName} 
              onChange={e => setNewItemName(e.target.value)} 
              placeholder="e.g. Monitor LG 24'" 
              disabled={loading}
              className="bg-slate-800/50 border-white/10"
            />
          </div>
          <div className="w-24">
            <label className="text-sm text-slate-400 block mb-1">Prefix</label>
            <Input 
              value={newItemPrefix} 
              onChange={e => setNewItemPrefix(e.target.value.toUpperCase().slice(0,6))} 
              placeholder="MON" 
              maxLength={6} 
              className="uppercase bg-slate-800/50 border-white/10"
              disabled={loading}
            />
          </div>
          <div className="w-28">
            <label className="text-sm text-slate-400 block mb-1">Price (COP)</label>
            <Input 
              type="number" 
              min="0" 
              value={newItemPrice} 
              onChange={e => setNewItemPrice(parseInt(e.target.value)||0)} 
              disabled={loading}
              className="bg-slate-800/50 border-white/10"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            disabled={!newItemName.trim() || loading} 
            className="bg-cyan-600 hover:bg-cyan-700 text-white h-10"
          >
            {loading ? 'Saving...' : <><Plus className="w-4 h-4 mr-2" /> Create</>}
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase font-semibold">Item</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase font-semibold text-center">Prefix</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase font-semibold text-right">Price</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Object.entries(items).map(([name, data]) => {
              const prefix = getPrefix(data);
              const price = getPrice(data);
              
              if (editingItem && editingItem.originalName === name) {
                return (
                  <tr key={name} className="bg-slate-800/30">
                    <td className="px-4 py-2">
                      <Input 
                        value={editingItem.newName} 
                        onChange={e => setEditingItem({...editingItem, newName: e.target.value})} 
                        className="bg-slate-800 border-white/10"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        value={editingItem.newPrefix} 
                        onChange={e => setEditingItem({...editingItem, newPrefix: e.target.value.toUpperCase().slice(0,6)})} 
                        className="bg-slate-800 border-white/10 uppercase text-center"
                        maxLength={6}
                        disabled={loading}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input 
                        type="number" 
                        min="0" 
                        value={editingItem.newPrice ?? price} 
                        onChange={e => setEditingItem({...editingItem, newPrice: parseInt(e.target.value)||0})} 
                        className="bg-slate-800 border-white/10 text-right"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={handleUpdate} 
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                          disabled={loading}
                        >
                          <Check className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => setEditingItem(null)} 
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                          disabled={loading}
                        >
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              return (
                <tr key={name} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 rounded bg-slate-800 text-cyan-400 font-mono text-sm">
                      {prefix}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-2 py-1 rounded bg-emerald-950/30 text-emerald-400 font-mono text-sm font-semibold">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingItem({originalName: name, newName: name, newPrefix: prefix, newPrice: price})} 
                        className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                        disabled={loading}
                      >
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({isOpen: true, itemName: name})} 
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen} 
        title="Delete Item" 
        message={`Delete "${deleteConfirm.itemName}"?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteConfirm({isOpen:false, itemName:''})} 
        confirmText="Delete" 
        variant="destructive" 
        disabled={loading}
      />
    </div>
  );
};

export default ItemManager;