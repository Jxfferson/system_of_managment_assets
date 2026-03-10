import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const ItemManager = ({ items, onItemCreated, onItemUpdated, onItemDeleted }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrefix, setNewItemPrefix] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, itemName: '' });

  const handleCreate = () => {
    const name = newItemName.trim();
    if (!name) return;
    if (items[name]) {
      toast({ title: "Error", description: "Item already exists", variant: "destructive" });
      return;
    }
    onItemCreated(name, newItemPrefix.trim().toUpperCase());
    setNewItemName('');
    setNewItemPrefix('');
    toast({ title: "Item created", description: `${name} added successfully.` });
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    const newName = editingItem.newName?.trim() || editingItem.originalName;
    const newPrefix = editingItem.newPrefix?.trim().toUpperCase() || '';
    if (!newName) return;
    if (newName !== editingItem.originalName && items[newName]) {
      toast({ title: "Error", description: "An item with that name already exists", variant: "destructive" });
      return;
    }
    onItemUpdated(editingItem.originalName, newName, newPrefix);
    setEditingItem(null);
    toast({ title: "Item updated" });
  };

  const handleDelete = (name) => {
    setDeleteConfirm({ isOpen: true, itemName: name });
  };

  const confirmDelete = () => {
    onItemDeleted(deleteConfirm.itemName);
    setDeleteConfirm({ isOpen: false, itemName: '' });
    toast({ title: "Item deleted" });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, itemName: '' });
  };

  const startEdit = (name, prefix) => {
    setEditingItem({ originalName: name, newName: name, newPrefix: prefix || '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Item Management</h2>

      {}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Create new item</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-slate-400 block mb-1">Item name *</label>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Monitor LG 24'"
            />
          </div>
          <div className="w-32">
            <label className="text-sm text-slate-400 block mb-1">Prefix (optional)</label>
            <Input
              value={newItemPrefix}
              onChange={(e) => setNewItemPrefix(e.target.value.toUpperCase().slice(0,6))}
              placeholder="e.g. MON"
              maxLength={6}
              className="uppercase"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!newItemName.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white h-10"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Item
          </Button>
        </div>
      </div>

      {}
      <div className="rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Item</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Prefix</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(items).map(([name, prefix]) => {
              if (editingItem && editingItem.originalName === name) {
                return (
                  <tr key={name} className="border-b border-white/5">
                    <td className="px-4 py-2">
                      <Input
                        value={editingItem.newName}
                        onChange={(e) => setEditingItem({ ...editingItem, newName: e.target.value })}
                        className="bg-slate-800"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editingItem.newPrefix}
                        onChange={(e) => setEditingItem({ ...editingItem, newPrefix: e.target.value.toUpperCase().slice(0,6) })}
                        className="bg-slate-800 uppercase"
                        maxLength={6}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="text-green-400 hover:text-green-300 p-1" title="Save"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingItem(null)} className="text-red-400 hover:text-red-300 p-1" title="Cancel"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{name}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{prefix || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(name, prefix)} className="text-cyan-400 hover:text-cyan-300 p-1" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(name)} className="text-red-400 hover:text-red-300 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Item"
        message={`Are you sure you want to delete the item "${deleteConfirm.itemName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default ItemManager;