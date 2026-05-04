import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Box, CheckCircle2, ArrowUpRight, BarChart3, Table2, Clock, ChevronDown, X, AlertCircle, AlertTriangle, Package, Trash2, Download, Plus } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';

// 🔹 NUEVO: Precios de productos
const PRODUCT_PRICES = {
  'Extensión de Cable eléctrico': 8000,
  'Conversores Displayport a VGA Hembra': 13500,
  'Cable LAN-RJ45 1,8 Metros': 10169,
  'Cable Display VGA a VGA 1,8': 13500,
  'Cable HDMI a HDMI 1,8 Metros': 14200,
  'Cable VGA a HDMI 1,8 Metros': 15000,
  'Cable Display Port a HDMI 1,8': 14538,
  'Cable Display Port a VGA 1,8': 16082,
  'Ethernet 3,0 LAN a USB': 29500,
  'Mouse': 21000,
  'Teclado': 49700
};

const getSuggestedPrice = (itemName) => {
  // Buscar coincidencia parcial en el nombre
  for (const [key, price] of Object.entries(PRODUCT_PRICES)) {
    if (itemName.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  return 10000; // Precio por defecto
};

// 🔹 NUEVO: Modal de Orden de Compra con Tabla
const OrderModal = ({ isOpen, onClose, lowStockItems, allItems }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);

  useEffect(() => {
    if (isOpen && lowStockItems) {
      // Inicializar con items de bajo stock
      const initialItems = lowStockItems.map(alert => ({
        name: alert.item,
        total: alert.total,
        available: alert.available,
        unitPrice: getSuggestedPrice(alert.item),
        quantity: Math.max(10, alert.total - alert.available), 
        // Se sugiere cantidad Pero si se quire iniciar desde 0 SIEMPRE se debe eliminar el valor despues de quantity y dejarlo asi quantity: 0;
      }));
      setOrderItems(initialItems);
    }
  }, [isOpen, lowStockItems]);

  const addItem = (itemName) => {
    if (orderItems.find(item => item.name === itemName)) return;
    
    const newItem = {
      name: itemName,
      total: 0,
      available: 0,
      unitPrice: getSuggestedPrice(itemName),
      quantity: 10,
    };
    setOrderItems([...orderItems, newItem]);
    setShowItemSelector(false);
  };

  const removeItem = (itemName) => {
    setOrderItems(orderItems.filter(item => item.name !== itemName));
  };

  const updateQuantity = (itemName, quantity) => {
    setOrderItems(orderItems.map(item => 
      item.name === itemName ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const updateUnitPrice = (itemName, unitPrice) => {
    setOrderItems(orderItems.map(item => 
      item.name === itemName ? { ...item, unitPrice: Math.max(0, unitPrice) } : item
    ));
  };

  const calculateItemTotal = (item) => {
    return item.quantity * item.unitPrice;
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const exportToExcel = () => {
    const exportData = orderItems.map((item, index) => ({
      '#': index + 1,
      'Item': item.name,
      'Total en Inventario': item.total,
      'Disponibles': item.available,
      'Cantidad a Pedir': item.quantity,
      'Precio Unitario (COP)': `$ ${item.unitPrice.toLocaleString('es-CO')}`,
      'Total (COP)': `$ ${calculateItemTotal(item).toLocaleString('es-CO')}`
    }));

    // Agregar fila de total general
    exportData.push({
      '#': '',
      'Item': 'TOTAL GENERAL',
      'Total en Inventario': '',
      'Disponibles': '',
      'Cantidad a Pedir': orderItems.reduce((sum, item) => sum + item.quantity, 0),
      'Precio Unitario (COP)': '',
      'Total (COP)': `$ ${calculateGrandTotal().toLocaleString('es-CO')}`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orden de Compra');
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 }
    ];

    XLSX.writeFile(wb, `Orden_de_Compra_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isOpen) return null;

  const availableItemsToAdd = allItems.filter(itemName => 
    !orderItems.find(orderItem => orderItem.name === itemName)
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/95 backdrop-blur">
          <div>
            <h3 className="text-2xl font-bold text-white">Purchase Order</h3>
            <p className="text-slate-400 text-sm mt-1">Manage and export your order items</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowItemSelector(!showItemSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
                
                {showItemSelector && (
                  <div className="absolute z-50 mt-2 w-80 max-h-60 overflow-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                    {availableItemsToAdd.length === 0 ? (
                      <p className="p-4 text-slate-400 text-sm">All items added</p>
                    ) : (
                      availableItemsToAdd.map(itemName => (
                        <button
                          key={itemName}
                          onClick={() => addItem(itemName)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          {itemName}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <span className="text-slate-400 text-sm">
                {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} in order
              </span>
            </div>

            <button 
              onClick={exportToExcel}
              disabled={orderItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {/* Table */}
          {orderItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">No items in order</p>
              <p className="text-slate-500 text-sm mt-1">Click "Add Item" to start building your order</p>
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium text-right">In Stock</th>
                    <th className="px-4 py-3 font-medium text-right">Available</th>
                    <th className="px-4 py-3 font-medium text-right">To Order</th>
                    <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orderItems.map((item, index) => (
                    <tr key={item.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{item.name}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">{item.total}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.available <= 3 ? 'bg-rose-500/20 text-rose-400' :
                          item.available < 15 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.available}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.name, parseInt(e.target.value) || 1)}
                          className="w-20 bg-slate-800 border border-white/10 rounded px-2 py-1 text-right text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-500 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateUnitPrice(item.name, parseInt(e.target.value) || 0)}
                            className="w-24 bg-slate-800 border border-white/10 rounded px-2 py-1 text-right text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-emerald-400 font-semibold">
                          ${calculateItemTotal(item).toLocaleString('es-CO')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => removeItem(item.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800/50 border-t border-white/10">
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-right text-slate-400 font-medium">
                      Grand Total:
                    </td>
                    <td colSpan="3" className="px-4 py-4 text-right">
                      <span className="text-2xl font-bold text-cyan-400">
                        ${calculateGrandTotal().toLocaleString('es-CO')} COP
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatisticsPage = ({ assets = [], availableItems = [] }) => {
  const location = useLocation();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ✅ Estados para la modal de orden
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (!isInitialized && availableItems.length > 0) {
      const stateItem = location.state?.initialItem;
      
      if (stateItem) {
        setSelectedItems([stateItem]);
      } else {
        setSelectedItems([...availableItems]);
      }
      
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      setDateRange({
        start: oneMonthAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      });
      
      setIsInitialized(true);
      window.history.replaceState({}, document.title);
    }
  }, [availableItems, isInitialized, location.state]);

  const baseAssets = useMemo(() => {
    let filtered = [...assets];
    
    const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    
    if (!isAllSelected) {
      filtered = filtered.filter(a => {
        const name = a.nombre || a.asset_type || a.name || a.item || '';
        return selectedItems.includes(name);
      });
    }
    
    return filtered;
  }, [assets, selectedItems, availableItems.length]);

  const stats = useMemo(() => {
    const total = baseAssets.length;
    const available = baseAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    const assigned = total - available;
    return { total, available, assigned };
  }, [baseAssets]);

  const itemsAvailability = useMemo(() => {
    const itemsToShow = selectedItems.length > 0 && selectedItems.length < availableItems.length 
      ? selectedItems 
      : availableItems;
    
    return itemsToShow.map(itemName => {
      const itemAssets = baseAssets.filter(a => {
        const name = a.nombre || a.asset_type || a.name || a.item || '';
        return name === itemName;
      });
      const total = itemAssets.length;
      const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
      const percentage = total > 0 ? Math.round((available / total) * 100) : 0;
      
      return { name: itemName, total, available, percentage };
    }).filter(item => item.total > 0);
  }, [baseAssets, selectedItems, availableItems]);

  const lowStockAlerts = useMemo(() => {
    const alerts = [];
    const itemsGrouped = {};
    
    baseAssets.forEach(asset => {
      const name = asset.nombre || asset.asset_type || asset.name || asset.item || '';
      if (!itemsGrouped[name]) {
        itemsGrouped[name] = { total: 0, available: 0 };
      }
      itemsGrouped[name].total++;
      if (!asset.fecha_salida || asset.fecha_salida.trim() === '') {
        itemsGrouped[name].available++;
      }
    });
    
    Object.entries(itemsGrouped).forEach(([itemName, counts]) => {
      if (counts.available < 15 && counts.available >= 0 && counts.total > 0) {
        alerts.push({
          item: itemName,
          available: counts.available,
          total: counts.total,
          severity: counts.available <= 3 ? 'critical' : 'warning'
        });
      }
    });
    
    return alerts.sort((a, b) => a.available - b.available);
  }, [baseAssets]); 

  const chartData = useMemo(() => {
    const relevantAssets = baseAssets.filter(a => a.fecha_salida && a.fecha_salida.trim() !== '');
    
    const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    const isSingleItem = selectedItems.length === 1;
    
    if (isSingleItem) {
      const now = new Date();
      const selectedItem = selectedItems[0];
      const itemAssets = relevantAssets.filter(a => {
        const name = a.nombre || a.asset_type || a.name || a.item || '';
        return name === selectedItem;
      });
      
      let groups = [];
      if (viewMode === 'day') {
        const todayStr = now.toISOString().split('T')[0];
        groups = [{ time: todayStr, count: 0 }];
      } else if (viewMode === 'week') {
        for (let i = 3; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - (i * 7));
          const weekKey = `W${i === 0 ? 'Current' : i}`;
          groups.push({ time: weekKey, count: 0, label: `Week -${i}` });
        }
      } else if (viewMode === 'month') {
        for (let i = 2; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = d.toLocaleString('en-US', { month: 'short' });
          groups.push({ time: monthKey, count: 0, label: monthKey });
        }
      }

      itemAssets.forEach(a => {
        const exitDate = new Date(a.fecha_salida);
        if (viewMode === 'day') {
          const todayStr = now.toISOString().split('T')[0];
          if (a.fecha_salida.startsWith(todayStr)) groups[0].count++;
        } else if (viewMode === 'week') {
          const diffTime = Math.abs(now - exitDate);
          const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
          if (diffWeeks < 4) {
            const idx = 3 - diffWeeks;
            if (groups[idx]) groups[idx].count++;
          }
        } else if (viewMode === 'month') {
          const diffMonths = (now.getFullYear() - exitDate.getFullYear()) * 12 + (now.getMonth() - exitDate.getMonth());
          if (diffMonths < 3) {
            const idx = 2 - diffMonths;
            if (groups[idx]) groups[idx].count++;
          }
        }
      });

      return { 
        data: groups.map(g => ({ name: g.label || g.time, value: g.count })),
        config: viewMode 
      };

    } else {
      if (!dateRange.start || !dateRange.end) return { data: [], config: 'all' };

      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      let aggregationLevel = 'day';
      if (totalDays > 90) aggregationLevel = 'month';
      else if (totalDays > 30) aggregationLevel = 'week';
      
      const groupedData = {};
      
      relevantAssets.forEach(a => {
        const exitDate = new Date(a.fecha_salida);
        let key = '';
        
        if (aggregationLevel === 'day') {
          key = exitDate.toISOString().split('T')[0];
        } else if (aggregationLevel === 'week') {
          const weekNum = Math.floor((exitDate - start) / (1000 * 60 * 60 * 24 * 7));
          key = `Week ${weekNum + 1}`;
        } else if (aggregationLevel === 'month') {
          key = exitDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        }
        
        if (!groupedData[key]) {
          groupedData[key] = 0;
        }
        groupedData[key]++;
      });
      
      const data = Object.entries(groupedData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA - dateB;
        });
      
      return {  data, config: 'range' };
    }
  }, [baseAssets, selectedItems, availableItems.length, viewMode, dateRange]);

  const yAxisConfig = useMemo(() => {
    const isAllItems = selectedItems.length === 0 || selectedItems.length === availableItems.length;
    const isSingleItem = selectedItems.length === 1;
    
    const maxValue = chartData.data && chartData.data.length > 0 
      ? Math.max(...chartData.data.map(d => d.value || 0), 0)
      : 0;
    
    let step = 10;
    
    if (!isAllItems) {
      if (viewMode === 'day') step = 2;
      else if (viewMode === 'week') step = 5;
      else if (viewMode === 'month') step = 10;
    }
    
    const minTicks = 2;
    const calculatedMax = Math.max(maxValue, step * minTicks);
    const roundedMax = Math.ceil(calculatedMax / step) * step;
    
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += step) {
      ticks.push(i);
    }
    
    return { 
      ticks,
      domain: [0, roundedMax]
    };
  }, [selectedItems.length, availableItems.length, viewMode, chartData.data]);

  const toggleItem = (itemName) => {
    setSelectedItems(prev => {
      if (prev.includes(itemName)) {
        if (prev.length === 2) {
          return prev; 
        }
        return prev.filter(i => i !== itemName);
      }
      return [...prev, itemName];
    });
  };

  const removeItem = (itemName) => {
    setSelectedItems(prev => {
      if (prev.length === 2) {
        return prev; 
      }
      return prev.filter(i => i !== itemName);
    });
  };

  const toggleAll = () => {
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...availableItems]);
    }
  };

  const isAllSelected = selectedItems.length === 0 || selectedItems.length === availableItems.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Statistics Dashboard</h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Real-time Asset Analytics</span>
        </div>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-rose-950/40 to-orange-950/40 backdrop-blur-md border border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                <p className="text-slate-400 text-sm">{lowStockAlerts.length} items require attention</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Package className="w-4 h-4" />
              Create Order
            </button>
          </div>
          
          <div className="space-y-3">
            {lowStockAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-rose-950/30 border-rose-500/30' 
                    : 'bg-orange-950/30 border-orange-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium text-sm">{alert.item}</p>
                    <p className="text-slate-400 text-xs">
                      Only <span className="text-white font-semibold">{alert.available}</span> of {alert.total} units available
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    alert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'
                  }`}>
                    {alert.available <= 3 ? 'Critical' : 'Low Stock'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {itemsAvailability.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 text-sm font-medium">Item Availability</span>
            </div>
            <span className="text-slate-500 text-xs">{itemsAvailability.length} items</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-right">Available</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">%</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {itemsAvailability.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 text-slate-300 truncate max-w-[150px]" title={item.name}>
                      {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}
                    </td>
                    <td className="py-2 text-emerald-400 text-right font-medium">{item.available}</td>
                    <td className="py-2 text-slate-400 text-right">{item.total}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        item.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        item.percentage >= 50 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="w-16 bg-slate-700/50 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            item.percentage >= 80 ? 'bg-emerald-500' :
                            item.percentage >= 50 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {itemsAvailability.length > 5 && (
            <p className="text-center text-slate-500 text-xs mt-3">
              +{itemsAvailability.length - 5} more items
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Units</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Box className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Available</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.available}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-amber-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Assigned</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{stats.assigned}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Filter Configuration</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative" style={{ zIndex: 9999 }}>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Select Asset</label>
            
            {!isAllSelected && selectedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedItems.slice(0, 3).map(item => (
                  <span 
                    key={item} 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-900/30 text-cyan-400 text-xs border border-cyan-500/20"
                  >
                    {item.length > 15 ? item.substring(0, 15) + '...' : item}
                    <button onClick={() => removeItem(item)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedItems.length > 3 && (
                  <span className="text-xs text-slate-500">+{selectedItems.length - 3} more</span>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 hover:border-white/20 transition-all"
            >
              <span className="text-slate-400">
                {isAllSelected ? 'All Items' : `${selectedItems.length} item(s) selected`}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div 
                className="absolute z-[99999] w-full mt-1 max-h-60 overflow-auto bg-slate-950 border border-white/10 rounded-lg shadow-2xl"
                style={{ zIndex: 99999, position: 'relative' }}
              >
                <label className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors sticky top-0 bg-slate-950">
                  <input
                    type="checkbox"
                    checked={isAllSelected && availableItems.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-sm font-medium text-white">Select All</span>
                </label>
                
                {availableItems.map(item => (
                  <label 
                    key={item} 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      onChange={() => toggleItem(item)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-sm text-slate-300 truncate">{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {!isAllSelected && selectedItems.length === 1 ? (
            <div>
              <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Time View</label>
              <div className="flex bg-slate-950/50 border border-white/10 rounded-lg p-1">
                {['day', 'week', 'month'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === mode 
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Liberaciones (Exits)
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/5">
            {isAllSelected ? 'All Assets' : selectedItems.length === 1 ? selectedItems[0] : `${selectedItems.length} items`}
          </span>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                ticks={yAxisConfig.ticks}
                domain={yAxisConfig.domain}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #334155', 
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
                cursor={{ stroke: '#38bdf8', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Table2 className="w-5 h-5 text-cyan-400" />
            Asset Inventory List
          </h3>
          <span className="text-xs text-slate-400">{baseAssets.length} records</span>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
              <tr className="border-b border-white/10">
                <th className="pb-3 pt-1 text-slate-400 font-medium">Item</th>
                <th className="pb-3 pt-1 text-slate-400 font-medium">Serial</th>
                <th className="pb-3 pt-1 text-slate-400 font-medium">Status</th>
                <th className="pb-3 pt-1 text-slate-400 font-medium">Exit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {baseAssets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">No assets found matching filters</td>
                </tr>
              ) : (
                baseAssets.map((asset, i) => {
                  const isAvailable = !asset.fecha_salida || asset.fecha_salida.trim() === '';
                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-slate-200 font-medium truncate max-w-[200px]">
                        {asset.nombre || asset.name || 'N/A'}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-xs">{asset.serial || '-'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isAvailable 
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-900/30 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isAvailable ? 'In Stock' : 'Assigned'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs">
                        {asset.fecha_salida || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ NUEVO: Modal de Orden de Compra con Tabla */}
      <OrderModal 
        isOpen={showOrderModal} 
        onClose={() => setShowOrderModal(false)} 
        lowStockItems={lowStockAlerts}
        allItems={availableItems}
      />
    </div>
  );
};

export default StatisticsPage;