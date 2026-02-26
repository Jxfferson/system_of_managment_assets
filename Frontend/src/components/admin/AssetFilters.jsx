import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const AssetFilters = ({ filters, setFilters }) => {
  return (
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
  );
};

export default AssetFilters;