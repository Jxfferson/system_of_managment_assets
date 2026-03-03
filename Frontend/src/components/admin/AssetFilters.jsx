import React from 'react';
import { Input } from '@/components/ui/input';

const selectClass = `
  w-full h-10 px-3 rounded-md border border-white/10
  bg-slate-900 text-slate-200 text-sm
  focus:outline-none focus:ring-2 focus:ring-cyan-500
  appearance-none cursor-pointer
`.trim();

const AssetFilters = ({ filters, setFilters, availableItems = [] }) => {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div className="mb-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 grid md:grid-cols-3 gap-4">

      <Input
        placeholder="Filter by Serial"
        value={filters.serial}
        onChange={(e) => update('serial', e.target.value)}
      />

      <Input
        type="date"
        value={filters.date}
        onChange={(e) => update('date', e.target.value)}
        className="bg-slate-900 border-white/10 text-slate-200"
      />

      <select
        className={selectClass}
        value={filters.destino}
        onChange={(e) => update('destino', e.target.value)}
      >
        <option value="">All Destinations</option>
        <option value="COS-ARS">COS-ARS</option>
        <option value="COS-TMO">COS-TMO</option>
        <option value="COL-TMO">COL-TMO</option>
        <option value="COL-ATT">COL-ATT</option>
        <option value="COS-80TMO">COS-80TMO</option>
      </select>

      <select
        className={selectClass}
        value={filters.item}
        onChange={(e) => update('item', e.target.value)}
      >
        <option value="">All Items</option>
        {availableItems.length > 0 ? (
          availableItems.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))
        ) : (
          <>
            <option value="Teclado ESENSES Basico USB">Teclado ESENSES Basico USB</option>
            <option value="Mouse Alámbrico HP Óptico negro 100">Mouse Alámbrico HP Óptico negro 100</option>
            <option value="Ethernet 3.0 LAN a USB">Ethernet 3.0 LAN a USB</option>
            <option value="Cable Display Port a VGA 1,8">Cable Display Port a VGA 1,8</option>
            <option value="Cable Display VGA a VGA 1,8">Cable Display VGA a VGA 1,8</option>
            <option value="Extension de Cable eléctrico">Extension de Cable eléctrico</option>
          </>
        )}
      </select>

      <button
        onClick={() => setFilters({ name: '', serial: '', date: '', destino: '', item: '' })}
        className="h-10 px-4 rounded-md border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
      >
        Clear Filters
      </button>

    </div>
  );
};

export default AssetFilters;