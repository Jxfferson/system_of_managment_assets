import React from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const AssetForm = ({ editingAsset, setEditingAsset, onSave, onCancel }) => {
  return (
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
        <Button onClick={onCancel} variant="outline">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button onClick={onSave} className="h-9 px-8 bg-gradient-to-r from-cyan-500 to-blue-600">
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetForm;