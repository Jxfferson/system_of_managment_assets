import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const selectClass = `
  w-full h-10 px-3 rounded-md border border-white/10
  bg-slate-900 text-slate-200 text-sm
  focus:outline-none focus:ring-2 focus:ring-cyan-500
  appearance-none cursor-pointer
`.trim();

const AssetFilters = ({ filters, setFilters, availableItems = [] }) => {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  
  const serialRef = useRef(null);
  const [debugMessage, setDebugMessage] = useState('');

  const clearFilters = () => {
    setFilters({ 
      serial: '', 
      destino: '', 
      item: '',
      fechaEntrada: '', 
      fechaSalida: '',
      tipo_retorno: '',
      observaciones: ''
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Tecla presionada:', event.key);
      console.log('Ctrl:', event.ctrlKey, 'Alt:', event.altKey, 'Shift:', event.shiftKey);
      
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        console.log('Atajo detectado: Ctrl+Alt+F - Enfocar Serial');
        setDebugMessage('Enfocando búsqueda...');
        serialRef.current?.focus();
        setTimeout(() => setDebugMessage(''), 2000);
      }

      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        console.log('Atajo detectado: Ctrl+Alt+C - Limpiar filtros');
        setDebugMessage('Filtros limpiados');
        clearFilters();
        setTimeout(() => setDebugMessage(''), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('Listener de teclado registrado en AssetFilters');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('Listener de teclado removido de AssetFilters');
    };
  }, []);

  return (
    <div className="mb-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 grid md:grid-cols-3 gap-4">
      
      {debugMessage && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm z-[100]">
          {debugMessage}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-slate-400 text-xs block">Serial (Ctrl+Alt+F)</label>
        <Input
          ref={serialRef}
          placeholder="Filter by Serial"
          value={filters.serial}
          onChange={(e) => update('serial', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-slate-400 text-xs block">Destino</label>
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
      </div>

      <div className="space-y-2">
        <label className="text-slate-400 text-xs block">Item</label>
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
      </div>

      <div className="space-y-2">
        <label className="text-slate-400 text-xs font-medium block">Entry Date</label>
        <Input
          type="date"
          value={filters.fechaEntrada || ''}
          onChange={(e) => update('fechaEntrada', e.target.value)}
          className="bg-slate-900 border-emerald-500/30 text-slate-200 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-slate-400 text-xs font-medium block">Exit Date</label>
        <Input
          type="date"
          value={filters.fechaSalida || ''}
          onChange={(e) => update('fechaSalida', e.target.value)}
          className="bg-slate-900 border-rose-500/30 text-slate-200 focus:ring-rose-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-slate-400 text-xs font-medium block">Return Type</label>
        <select
          className={selectClass}
          value={filters.tipo_retorno || ''}
          onChange={(e) => update('tipo_retorno', e.target.value)}
        >
          <option value="">All Return Types</option>
          <option value="Retorno">Retorno</option>
          <option value="Perdida">Pérdida</option>
          <option value="Daño">Daño</option>
        </select>
      </div>

      <div className="md:col-span-3">
        <label className="text-slate-400 text-xs font-medium block">Observations (search in text)</label>
        <Input
          type="text"
          placeholder="Search in observations..."
          value={filters.observaciones || ''}
          onChange={(e) => update('observaciones', e.target.value)}
          className="bg-slate-900 border-cyan-500/30 text-slate-200 focus:ring-cyan-500"
        />
      </div>

      <div className="md:col-span-3">
        <button
          onClick={clearFilters}
          className="h-10 px-4 rounded-md border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors w-full"
          title="Clear Filters (Ctrl+Alt+C)"
        >
          Clear Filters
        </button>
      </div>

    </div>
  );
};

export default AssetFilters;