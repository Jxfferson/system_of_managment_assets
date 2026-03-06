import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

const ExportMenu = ({ filteredAssets }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [debugMessage, setDebugMessage] = React.useState('');

  const exportToExcel = React.useCallback(() => {
    console.log('Función exportToExcel ejecutándose');
    
    if (!filteredAssets || filteredAssets.length === 0) {
      console.warn('No hay datos para exportar');
      setDebugMessage('No hay datos para exportar');
      setTimeout(() => setDebugMessage(''), 3000);
      return;
    }

    const dataToExport = filteredAssets.map(a => ({
      'Item': a.name || '',
      'Serial': a.serial || '',
      'F. Ingreso': a.fecha_ingreso || '-',
      'F. Salida': a.fecha_salida || '-',
      'Destino': a.destino || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];

    worksheet['!protect'] = {
      password: 'OTDColombia2025.',
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      deleteColumns: false,
      deleteRows: false
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activos');
    
    const fileName = `activos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setShowMenu(false);
    setDebugMessage('Exportación completada');
    setTimeout(() => setDebugMessage(''), 3000);
  }, [filteredAssets]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Tecla presionada:', event.key);
      console.log('Ctrl:', event.ctrlKey, 'Alt:', event.altKey, 'Meta:', event.metaKey);
      
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        console.log('Atajo detectado: Ctrl+Alt+E');
        setDebugMessage('Atajo detectado - Exportando...');
        exportToExcel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('Listener de teclado registrado');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('Listener de teclado removido');
    };
  }, [exportToExcel]);

  return (
    <div className="relative">
      {debugMessage && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm z-[100]">
          {debugMessage}
        </div>
      )}
      
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="outline"
        className="border-white/10 text-slate-300"
        title="Exportar (Ctrl + Alt + E)"
      >
        <Download className="w-4 h-4 mr-2" />
        Export 
        <span className="ml-2 text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded hidden group-hover:inline-flex transition-opacity">
          Ctrl+Alt+E
        </span>
      </Button>
      
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-xl z-50 overflow-hidden"
        >
          <div className="p-2">
            <button
              onClick={exportToExcel}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export as Excel</span>
              </div>
              <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">
                Ctrl+Alt+E
              </kbd>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportMenu;