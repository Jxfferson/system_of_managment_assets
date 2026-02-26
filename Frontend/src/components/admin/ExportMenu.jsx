import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportMenu = ({ filteredAssets }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const exportToExcel = () => {
    const dataToExport = filteredAssets.map(a => ({
      Nombre: a.name,
      Serial: a.serial,
      Tipo: a.type,
      Cantidad: a.quantity,
      Fecha: a.date,
      Estado: a.status,
      Asignado: a.assignedTo || 'N/A',
      Notas: a.notes || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

     // Proteger la hoja (solo lectura)
    worksheet['!protect'] = {
        password: 'OTDEdit123',
        selectLockedCells: true,
        selectUnlockedCells: false,
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
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="outline"
        className="border-white/10 text-slate-300"
      >
        <Download className="w-4 h-4 mr-2" /> Export
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
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export as Excel</span>
            </button>

          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportMenu;