import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 50;

const AssetTable = ({ assets, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  
  const currentAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return assets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [assets, currentPage]);

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, assets.length);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // Estado vacío
  if (assets.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6">
            <Package className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No assets found</h3>
          <p className="text-slate-400 mb-8">Get started by adding your first asset</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
      
      {/* Header con contador */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Assets</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
          <Package className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-300">
            <span className="text-white font-bold">{assets.length}</span> total
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Item</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Serial</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">F. Ingreso</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">F. Salida</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Destino</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-white/5 border-b border-white/5 last:border-0">
                
                {/* Item */}
                <td className="px-4 py-3 text-white font-medium text-sm">
                  {asset.name}
                </td>
                
                {/* Serial */}
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                  {asset.serial}
                </td>
                
                {/* Fecha Ingreso */}
                <td className="px-4 py-3 text-slate-300 text-xs">
                  {asset.fecha_ingreso || '-'}
                </td>
                
                {/* Fecha Salida */}
                <td className="px-4 py-3 text-slate-300 text-xs">
                  {asset.fecha_salida || '-'}
                </td>
                
                {/* Destino */}
                <td className="px-4 py-3 text-slate-300 text-xs">
                  {asset.destino || '-'}
                </td>
                
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(asset)} 
                      className="text-cyan-400 hover:text-cyan-300 transition-colors p-1 hover:bg-white/5 rounded"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(asset.id)} 
                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/5 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="border-t border-white/10 bg-slate-800/30 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">{startItem}-{endItem}</span> of {assets.length}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-slate-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTable;