import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const ITEMS_PER_PAGE =20
;

const AssetTable = ({ assets, onEdit, onDelete, onAdd }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular totales y datos de la página actual
  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  
  const currentAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return assets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [assets, currentPage]);

  // Calcular rangos para mostrar
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, assets.length);

  // Manejadores de paginación
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Si no hay datos en absoluto, mostrar estado vacío
  if (assets.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6">
            <Package className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No assets found</h3>
          <p className="text-slate-400 mb-8">Get started by adding your first asset</p>
          <Button
            onClick={onAdd}
            className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Your First Asset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      {/* Header con contador de total */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Assets</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
          <Package className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-300">
            <span className="text-white font-bold">{assets.length}</span> total assets
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {currentAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-white/5 border-b border-white/5 last:border-0">
                <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                <td className="px-6 py-4 text-slate-300 font-mono text-sm">{asset.serial}</td>
                <td className="px-6 py-4 text-slate-300">{asset.type}</td>
                <td className="px-6 py-4 text-slate-300">{asset.quantity}</td>
                <td className="px-6 py-4 text-slate-300 text-sm">{asset.date || '-'}</td>
                <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                <td className="px-6 py-4 text-slate-300">{asset.assignedTo || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(asset)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(asset.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación - Solo se muestra si hay más de 1 página */}
      {totalPages > 1 && (
        <div className="border-t border-white/10 bg-slate-800/30 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Información de rango */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Showing</span>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-semibold">
                {startItem} - {endItem}
              </span>
              <span className="text-sm text-slate-400">of</span>
              <span className="px-2 py-1 bg-slate-700 text-white rounded text-sm font-semibold">
                {assets.length}
              </span>
            </div>
            
            {/* Controles de navegación */}
            <div className="flex items-center gap-3">
              {/* Botón Anterior */}
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentPage === 1 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              {/* Indicador de página actual */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-white/10">
                <span className="text-slate-400 text-sm">Page</span>
                <span className="text-cyan-400 font-bold text-lg">{currentPage}</span>
                <span className="text-slate-400 text-sm">of</span>
                <span className="text-white font-bold text-lg">{totalPages}</span>
              </div>
              
              {/* Botón Siguiente */}
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentPage === totalPages 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105'
                  }
                `}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando hay menos de 20 items (opcional, para claridad) */}
      {totalPages === 1 && assets.length > 0 && (
        <div className="border-t border-white/10 bg-slate-800/30 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Showing</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm font-semibold">
                {assets.length}
              </span>
              <span className="text-sm text-slate-400">of</span>
              <span className="px-2 py-1 bg-slate-700 text-white rounded text-sm font-semibold">
                {assets.length}
              </span>
              <span className="text-sm text-slate-500">(All items on one page)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTable;