import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Package, ChevronLeft, ChevronRight, CheckSquare, Square, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 50;

// Componente Modal de Confirmación Personalizado
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Eliminar", cancelText = "Cancelar", variant = "destructive" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "destructive" ? "bg-red-500/10" : "bg-cyan-500/10"
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === "destructive" ? "text-red-400" : "text-cyan-400"
            }`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-slate-400 text-sm mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-slate-800 border-white/10 text-white hover:bg-slate-700"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 ${
                variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetTable = ({ assets, onEdit, onDelete, onDeleteBulk }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Estados para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'destructive'
  });

  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  
  const currentAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return assets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [assets, currentPage]);

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, assets.length);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // --- Lógica de Selección ---
  const isSelected = (id) => selectedIds.includes(id);

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIdsOnPage = currentAssets.map(a => a.id);
    const allSelected = allIdsOnPage.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allIdsOnPage])]);
    }
  };

  const isAllSelected = currentAssets.length > 0 && currentAssets.every(a => selectedIds.includes(a.id));

  // --- Mostrar Modal de Confirmación ---
  const showConfirmModal = ({ title, message, onConfirm, variant = 'destructive' }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant
    });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // --- Lógica de Eliminación ---
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    showConfirmModal({
      title: `Eliminar ${selectedIds.length} elemento${selectedIds.length === 1 ? '' : 's'}`,
      message: `¿Estás seguro de eliminar ${selectedIds.length} elemento${selectedIds.length === 1 ? '' : 's'} seleccionados? Esta acción no se puede deshacer y se eliminarán permanentemente de la base de datos.`,
      variant: 'destructive',
      onConfirm: () => {
        if (onDeleteBulk) {
          onDeleteBulk(selectedIds);
        } else {
          selectedIds.forEach(id => onDelete(id));
        }
        setSelectedIds([]);
        hideConfirmModal();
      }
    });
  };

  // Eliminar un solo elemento con modal
  const handleDeleteSingle = (id) => {
    showConfirmModal({
      title: 'Eliminar elemento',
      message: '¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer y es irréversible.',
      variant: 'destructive',
      onConfirm: () => {
        onDelete(id);
        hideConfirmModal();
      }
    });
  };

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
      
      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirmModal}
        variant={confirmModal.variant}
      />

      {/* Header de la Tabla */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-white">Assets</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">
              <span className="text-white font-bold">{assets.length}</span> total
            </span>
          </div>

          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20"
              from-sky-600 to-blue-500
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 w-10">
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Item</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Serial</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Entry Date</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Exit Date</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Destination</th>
              <th className="px-4 py-3 text-slate-400 text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map(asset => {
              const selected = isSelected(asset.id);
              return (
                <tr 
                  key={asset.id} 
                  className={`
                    border-b border-white/5 last:border-0 transition-colors
                    ${selected ? 'bg-cyan-900/20 hover:bg-cyan-900/30' : 'hover:bg-white/5'}
                  `}
                >
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleSelectOne(asset.id)}
                      className={`flex items-center justify-center transition-colors ${selected ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {selected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-white font-medium text-sm">
                    {asset.name}
                  </td>
                  
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                    {asset.serial}
                  </td>
                  
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {asset.fecha_ingreso || '-'}
                  </td>
                  
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {asset.fecha_salida || '-'}
                  </td>
                  
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {asset.destino || '-'}
                  </td>
                  
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
                        onClick={() => handleDeleteSingle(asset.id)} 
                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                className="disabled:opacity-50 bg-slate-800 border-white/10 text-white hover:bg-slate-700"
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
                className="disabled:opacity-50 bg-slate-800 border-white/10 text-white hover:bg-slate-700"
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