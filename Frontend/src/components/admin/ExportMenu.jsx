import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

const ExportMenu = ({ filteredAssets, itemPrefixMap, exchangeRate }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [debugMessage, setDebugMessage] = React.useState('');

  const exportToExcel = React.useCallback(() => {    
    if (!filteredAssets || filteredAssets.length === 0) {
      console.warn('No data to export');
      setDebugMessage('No data to export');
      setTimeout(() => setDebugMessage(''), 3000);
      return;
    }

    const workbook = XLSX.utils.book_new();
    const currentRate = exchangeRate || 3736;
    const exportDate = new Date().toLocaleString('en-US');
    const totalAssets = filteredAssets.length;
    const availableAssets = filteredAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    const assignedAssets = totalAssets - availableAssets;
    
    const itemsGrouped = {};
    filteredAssets.forEach(asset => {
      const name = asset.name || 'Unknown';
      if (!itemsGrouped[name]) {
        itemsGrouped[name] = { total: 0, available: 0, assigned: 0 };
      }
      itemsGrouped[name].total++;
      if (!asset.fecha_salida || asset.fecha_salida.trim() === '') {
        itemsGrouped[name].available++;
      } else {
        itemsGrouped[name].assigned++;
      }
    });

    const resumenData = [
      { 'METRIC': 'VALUE', 'NOTE': '' },
      { 'METRIC': 'Export Date', 'NOTE': exportDate },
      { 'METRIC': 'Exchange Rate (USD/COP)', 'NOTE': `${currentRate.toFixed(2)} COP` },
      { 'METRIC': '', 'NOTE': '' },
      { 'METRIC': 'Total Assets', 'NOTE': totalAssets },
      { 'METRIC': 'Available', 'NOTE': availableAssets },
      { 'METRIC': 'Assigned', 'NOTE': assignedAssets },
      { 'METRIC': 'Different Items', 'NOTE': Object.keys(itemsGrouped).length },
      { 'METRIC': '', 'NOTE': '' },
      { 'METRIC': 'ITEM', 'Total': '', 'Available': '', 'Assigned': '' },
    ];

    Object.entries(itemsGrouped).forEach(([itemName, counts]) => {
      resumenData.push({ 
        'METRIC': itemName.substring(0, 35), 
        'Total': counts.total,
        'Available': counts.available,
        'Assigned': counts.assigned,
        'NOTE': ''
      });
    });

    const worksheetResumen = XLSX.utils.json_to_sheet(resumenData, { skipHeader: false });
    worksheetResumen['!cols'] = [
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 }
    ];

    const rangeResumen = XLSX.utils.decode_range(worksheetResumen['!ref']);
    for (let C = rangeResumen.s.c; C <= rangeResumen.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheetResumen[address]) continue;
      worksheetResumen[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0F172A" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    for (let C = rangeResumen.s.c; C <= rangeResumen.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "10";
      if (!worksheetResumen[address]) continue;
      worksheetResumen[address].s = {
        font: { bold: true, color: { rgb: "0EA5E9" } },
        fill: { fgColor: { rgb: "1E293B" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Summary');

    const itemsSorted = Object.keys(itemsGrouped).sort();
    
    itemsSorted.forEach((itemName, index) => {
      const itemAssets = filteredAssets.filter(a => a.name === itemName);
      
      const itemData = itemPrefixMap?.[itemName];
      const unitPrice = typeof itemData === 'object' && itemData !== null 
        ? itemData.price_cop 
        : (typeof itemData === 'number' ? itemData : 10000);
      
      const totalAssigned = itemAssets.filter(ast => ast.fecha_salida && ast.fecha_salida.trim() !== '').length;
      const remaining = itemAssets.filter(ast => !ast.fecha_salida || ast.fecha_salida.trim() === '').length;

      const itemDataRows = itemAssets.map((a, idx) => ({
        'Number': idx + 1,
        'Item': a.name || '',
        'Serial': a.serial || '',
        'Entry Date': a.fecha_ingreso || '-',
        'Exit Date': a.fecha_salida || '-',
        'Destination': a.destino || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(itemDataRows);
      
      worksheet['!cols'] = [
        { wch: 8 },
        { wch: 35 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 }
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "FFFF00" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      const lastRow = range.e.r + 1;
      worksheet[`A${lastRow}`] = { t: 's', v: '', s: { fill: { fgColor: { rgb: "E0F2FE" } } } };
      worksheet[`B${lastRow}`] = { t: 's', v: 'Unit Price (COP):', s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } } } };
      worksheet[`C${lastRow}`] = { t: 'n', v: unitPrice, s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } }, numFmt: '#,##0' } };
      worksheet[`D${lastRow}`] = { t: 's', v: 'Total Assigned:', s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } } } };
      worksheet[`E${lastRow}`] = { t: 'n', v: totalAssigned, s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } } } };
      worksheet[`F${lastRow}`] = { t: 's', v: 'Remaining:', s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } } } };
      worksheet[`G${lastRow}`] = { t: 'n', v: remaining, s: { font: { bold: true }, fill: { fgColor: { rgb: "E0F2FE" } } } };

      for (let R = 2; R <= range.e.r; ++R) {
        const exitDateCell = XLSX.utils.encode_cell({ r: R, c: 4 });
        const hasExitDate = worksheet[exitDateCell] && worksheet[exitDateCell].v && worksheet[exitDateCell].v !== '-';
        
        if (hasExitDate) {
          const serialCell = XLSX.utils.encode_cell({ r: R, c: 2 });
          if (worksheet[serialCell]) {
            worksheet[serialCell].s = {
              fill: { fgColor: { rgb: "FEF9C3" } },
              font: { bold: true, color: { rgb: "000000" } }
            };
          }
          
          if (worksheet[exitDateCell]) {
            worksheet[exitDateCell].s = {
              fill: { fgColor: { rgb: "FEF9C3" } },
              font: { bold: true, color: { rgb: "000000" } }
            };
          }
          
          const destCell = XLSX.utils.encode_cell({ r: R, c: 5 });
          if (worksheet[destCell]) {
            worksheet[destCell].s = {
              fill: { fgColor: { rgb: "FEF9C3" } },
              font: { bold: true, color: { rgb: "000000" } }
            };
          }
        }
      }

      worksheet['!ref'] = `A1:G${lastRow}`;

      let sheetName = itemName.substring(0, 28).replace(/[\\/\?\*\[\]]/g, '');
      sheetName = `${index + 1}. ${sheetName}`.substring(0, 31);

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const costosData = Object.entries(itemPrefixMap || {}).map(([itemName, itemData]) => {
      const priceCop = typeof itemData === 'object' && itemData !== null 
        ? itemData.price_cop || 10000 
        : (typeof itemData === 'number' ? itemData : 10000);
      const priceUsd = currentRate ? (priceCop / currentRate).toFixed(2) : '0.00';
      
      return {
        'Item': itemName,
        'Prefix': typeof itemData === 'object' && itemData !== null ? itemData.prefix || '-' : '-',
        'Price (COP)': priceCop,
        'Price (USD)': parseFloat(priceUsd),
        'Exchange Rate': `${currentRate.toFixed(2)} COP`
      };
    });

    costosData.sort((a, b) => a.Item.localeCompare(b.Item));

    const worksheetCostos = XLSX.utils.json_to_sheet(costosData);
    
    worksheetCostos['!cols'] = [
      { wch: 45 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];

    const rangeCostos = XLSX.utils.decode_range(worksheetCostos['!ref']);
    for (let C = rangeCostos.s.c; C <= rangeCostos.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheetCostos[address]) continue;
      worksheetCostos[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "059669" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheetCostos, 'Costs');

    worksheetResumen['!protect'] = {
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

    const fileName = `assets_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setShowMenu(false);
    setDebugMessage(`Exported: ${itemsSorted.length + 2} sheets`);
    setTimeout(() => setDebugMessage(''), 5000);
  }, [filteredAssets, itemPrefixMap, exchangeRate]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        exportToExcel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
        title="Export (Ctrl + Alt + E)"
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
          className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-white/10 shadow-xl z-50 overflow-hidden"
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
            <div className="mt-2 pt-2 border-t border-white/10 px-3">
              <p className="text-[10px] text-slate-400 mb-1">📊 Includes:</p>
              <ul className="text-[10px] text-slate-500 space-y-0.5">
                <li>• Summary + Exchange rate</li>
                <li>• One sheet per item type</li>
                <li>• Costs and pricing</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportMenu;