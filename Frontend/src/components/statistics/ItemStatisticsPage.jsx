import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Box, CheckCircle2, ArrowUpRight, BarChart3, Table2, Clock, X, AlertCircle, AlertTriangle, Download, ArrowLeftRight } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';

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
  for (const [key, price] of Object.entries(PRODUCT_PRICES)) {
    if (itemName.toLowerCase().includes(key.toLowerCase())) return price;
  }
  return 10000;
};

// 🔹 Indicador de tendencia (zigzag con flecha)
const TrendIndicator = ({ trend }) => {
  if (trend === 'up') {
    return (
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  } else if (trend === 'down') {
    return (
      <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  } else {
    return (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4-4 4M3 12h18" />
      </svg>
    );
  }
};

const OrderModal = ({ isOpen, onClose, item, available, total }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(3736);
  const [previousRate, setPreviousRate] = useState(null);
  const [rateTrend, setRateTrend] = useState('neutral');
  const [rateLoading, setRateLoading] = useState(false);
  const [editingPriceCop, setEditingPriceCop] = useState('');
  const [editingPriceUsd, setEditingPriceUsd] = useState('');

  const fetchExchangeRate = useCallback(async () => {
    setRateLoading(true);
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
      const data = await response.json();
      if (data.usd?.cop) {
        const newRate = data.usd.cop;
        if (exchangeRate !== null) {
          if (newRate > exchangeRate) setRateTrend('up');
          else if (newRate < exchangeRate) setRateTrend('down');
          else setRateTrend('neutral');
        }
        setPreviousRate(exchangeRate);
        setExchangeRate(newRate);
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
    } finally {
      setRateLoading(false);
    }
  }, [exchangeRate]);

  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate();
      const interval = setInterval(fetchExchangeRate, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchExchangeRate]);

  useEffect(() => {
    if (isOpen && item && orderItems.length === 0) {
      const priceCop = getSuggestedPrice(item);
      setOrderItems([{
        name: item,
        total: total,
        available: available,
        unitPriceCop: priceCop,
        unitPriceUsd: (priceCop / exchangeRate).toFixed(2),
        quantity: 0,
      }]);
    }
  }, [isOpen, item, available, total, exchangeRate]);

  const updateQuantity = (quantity) => {
    setOrderItems([{ ...orderItems[0], quantity: Math.max(0, quantity) }]);
  };

  const handlePriceCopChange = (value) => {
    setEditingPriceCop(value);
  };

  const handlePriceCopBlur = () => {
    const value = editingPriceCop;
    const priceCop = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    const priceUsd = (priceCop / exchangeRate).toFixed(2);
    
    setOrderItems([{ ...orderItems[0], unitPriceCop: priceCop, unitPriceUsd: priceUsd }]);
    setEditingPriceCop('');
  };

  const handlePriceUsdChange = (value) => {
    setEditingPriceUsd(value);
  };

  const handlePriceUsdBlur = () => {
    const value = editingPriceUsd;
    const priceUsd = value === '' ? 0 : Math.max(0, parseFloat(value) || 0);
    const priceCop = Math.round(priceUsd * exchangeRate);
    
    setOrderItems([{ ...orderItems[0], unitPriceCop: priceCop, unitPriceUsd: priceUsd.toFixed(2) }]);
    setEditingPriceUsd('');
  };

  const currentItem = orderItems[0];
  const calculateItemTotalCop = () => currentItem?.quantity * currentItem?.unitPriceCop || 0;
  const calculateItemTotalUsd = () => currentItem?.quantity * parseFloat(currentItem?.unitPriceUsd || 0);

  const exportToExcel = () => {
    if (!currentItem) return;
    const exportData = [{
      '#': 1,
      'Item': currentItem.name,
      'Total en Inventario': currentItem.total,
      'Disponibles': currentItem.available,
      'Cantidad a Pedir': currentItem.quantity,
      'Precio Unitario (COP)': `$ ${currentItem.unitPriceCop.toLocaleString('es-CO')}`,
      'Precio Unitario (USD)': `$ ${parseFloat(currentItem.unitPriceUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'Total (COP)': `$ ${calculateItemTotalCop().toLocaleString('es-CO')}`,
      'Total (USD)': `$ ${calculateItemTotalUsd().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }];

    exportData.push({
      '#': '', 'Item': 'TOTAL GENERAL', 'Total en Inventario': '', 'Disponibles': '',
      'Cantidad a Pedir': currentItem.quantity, 'Precio Unitario (COP)': '', 'Precio Unitario (USD)': '',
      'Total (COP)': `$ ${calculateItemTotalCop().toLocaleString('es-CO')}`,
      'Total (USD)': `$ ${calculateItemTotalUsd().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orden de Compra');
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 18 }];
    XLSX.writeFile(wb, `Orden_${currentItem.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isOpen || orderItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/95 backdrop-blur">
          <div>
            <h3 className="text-2xl font-bold text-white">Purchase Order</h3>
            <p className="text-slate-400 text-sm mt-1">Manage items in COP and USD</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-white/10">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">1 USD =</span>
              {rateLoading ? (
                <div className="w-20 h-5 bg-slate-700/50 rounded animate-pulse" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    ${exchangeRate?.toLocaleString('es-CO')} COP
                  </span>
                  {previousRate && <TrendIndicator trend={rateTrend} />}
                </div>
              )}
              <button onClick={fetchExchangeRate} disabled={rateLoading} className="p-1 hover:bg-white/10 rounded transition-colors" title="Actualizar tasa">
                <svg className={`w-4 h-4 text-slate-400 ${rateLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium text-right">In Stock</th>
                    <th className="px-4 py-3 font-medium text-right">Available</th>
                    <th className="px-4 py-3 font-medium text-right">To Order</th>
                    <th className="px-4 py-3 font-medium text-right">Unit Price (COP)</th>
                    <th className="px-4 py-3 font-medium text-right">Unit Price (USD)</th>
                    <th className="px-4 py-3 font-medium text-right">Total (COP)</th>
                    <th className="px-4 py-3 font-medium text-right">Total (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{currentItem.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{currentItem.total}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        currentItem.available <= 3 ? 'bg-rose-500/20 text-rose-400' :
                        currentItem.available < 15 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {currentItem.available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={currentItem.quantity}
                        onChange={(e) => updateQuantity(parseInt(e.target.value) || 0)}
                        className="w-16 bg-slate-800 border border-white/10 rounded px-2 py-1 text-right text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-500 text-xs">$</span>
                        <input
                          type="text"
                          value={editingPriceCop || currentItem.unitPriceCop}
                          onChange={(e) => handlePriceCopChange(e.target.value.replace(/[^0-9]/g, ''))}
                          onBlur={handlePriceCopBlur}
                          className="w-24 bg-slate-800 border border-white/10 rounded px-2 py-1 text-right text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                          title="Precio en COP"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-500 text-xs">$</span>
                        <input
                          type="text"
                          value={editingPriceUsd || currentItem.unitPriceUsd}
                          onChange={(e) => handlePriceUsdChange(e.target.value.replace(/[^0-9.]/g, ''))}
                          onBlur={handlePriceUsdBlur}
                          className="w-20 bg-slate-800 border border-white/10 rounded px-2 py-1 text-right text-cyan-400 text-sm font-medium focus:ring-2 focus:ring-cyan-500/50"
                          title="Precio en USD"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-semibold">
                        ${calculateItemTotalCop().toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-cyan-400 font-semibold">
                        ${calculateItemTotalUsd().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-800/50 border-t border-white/10">
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-right text-slate-400 font-medium">
                      Grand Total:
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-emerald-400">
                        ${calculateItemTotalCop().toLocaleString('es-CO')} COP
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-cyan-400">
                        ${calculateItemTotalUsd().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemStatisticsPage = ({ assets = [], availableItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const params = new URLSearchParams(location.search);
      const itemFromUrl = params.get('item');
      if (itemFromUrl) setSelectedItem(decodeURIComponent(itemFromUrl));
      else if (availableItems.length > 0) setSelectedItem(availableItems[0]);

      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      setDateRange({ start: oneMonthAgo.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
      setIsInitialized(true);
    }
  }, [location.search, availableItems, isInitialized]);

  const itemAssets = useMemo(() => {
    if (!selectedItem) return [];
    return assets.filter(a => {
      const name = a.nombre || a.asset_type || a.name || a.item || '';
      return name === selectedItem;
    });
  }, [assets, selectedItem]); 

  const stats = useMemo(() => {
    const total = itemAssets.length;
    const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    return { total, available, assigned: total - available };
  }, [itemAssets]);

  const lowStockAlert = useMemo(() => {
    if (!selectedItem || itemAssets.length === 0) return null;
    const available = itemAssets.filter(a => !a.fecha_salida || a.fecha_salida.trim() === '').length;
    if (available < 15 && available >= 0 && itemAssets.length > 0) {
        return { item: selectedItem, available, total: itemAssets.length, severity: available <= 3 ? 'critical' : 'warning' };
    }
    return null;
  }, [itemAssets, selectedItem]);

  const chartData = useMemo(() => {
    if (!selectedItem) return {  data: [], config: viewMode };
    const relevantAssets = itemAssets.filter(a => a.fecha_salida && a.fecha_salida.trim() !== '');
    const now = new Date();
    let groups = [];
    if (viewMode === 'day') groups = [{ time: now.toISOString().split('T')[0], count: 0 }];
    else if (viewMode === 'week') {
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - (i * 7));
        groups.push({ time: `W${i === 0 ? 'Current' : i}`, count: 0, label: `Week -${i}` });
      }
    } else if (viewMode === 'month') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        groups.push({ time: d.toLocaleString('en-US', { month: 'short' }), count: 0, label: 'Month' });
      }
    }
    relevantAssets.forEach(a => {
      const exitDate = new Date(a.fecha_salida);
      if (viewMode === 'day' && a.fecha_salida.startsWith(now.toISOString().split('T')[0])) groups[0].count++;
      else if (viewMode === 'week') {
        const diffWeeks = Math.floor(Math.abs(now - exitDate) / (1000 * 60 * 60 * 24 * 7));
        if (diffWeeks < 4 && groups[3 - diffWeeks]) groups[3 - diffWeeks].count++;
      } else if (viewMode === 'month') {
        const diffMonths = (now.getFullYear() - exitDate.getFullYear()) * 12 + (now.getMonth() - exitDate.getMonth());
        if (diffMonths < 3 && groups[2 - diffMonths]) groups[2 - diffMonths].count++;
      }
    });
    return {  data: groups.map(g => ({ name: g.label || g.time, value: g.count })), config: viewMode };
  }, [itemAssets, selectedItem, viewMode]);

  const yAxisConfig = useMemo(() => {
    const maxValue = chartData.data && chartData.data.length > 0 ? Math.max(...chartData.data.map(d => d.value || 0), 0) : 0;
    let step = viewMode === 'day' ? 2 : viewMode === 'week' ? 5 : 10;
    const minTicks = 2;
    const calculatedMax = Math.max(maxValue, step * minTicks);
    const roundedMax = Math.ceil(calculatedMax / step) * step;
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += step) ticks.push(i);
    return { ticks, domain: [0, roundedMax] };
  }, [viewMode, chartData.data]);

  if (!selectedItem) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
          <p>Loading item statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin', { replace: true })} className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white transition-all">←</button>
          <div>
            <h2 className="text-2xl font-bold text-white">Item Statistics</h2>
            <p className="text-slate-400 text-sm">Detailed analytics for: <span className="text-cyan-400">{selectedItem}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="w-4 h-4" /> <span>Real-time Analytics</span>
        </div>
      </div>

      {lowStockAlert && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-rose-950/40 to-orange-950/40 backdrop-blur-md border border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20"><AlertCircle className="w-6 h-6 text-rose-400" /></div>
              <div>
                <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
                <p className="text-slate-400 text-sm">This item requires attention</p>
              </div>
            </div>
            <button 
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Create Order
            </button>
          </div>
          
          <div className={`flex items-center justify-between p-4 rounded-lg border ${lowStockAlert.severity === 'critical' ? 'bg-rose-950/30 border-rose-500/30' : 'bg-orange-950/30 border-orange-500/30'}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${lowStockAlert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'}`} />
              <div>
                <p className="text-white font-medium text-sm">{lowStockAlert.item}</p>
                <p className="text-slate-400 text-xs">Only <span className="text-white font-semibold">{lowStockAlert.available}</span> of {lowStockAlert.total} units available</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${lowStockAlert.severity === 'critical' ? 'text-rose-400' : 'text-orange-400'}`}>
                {lowStockAlert.available <= 3 ? 'Critical' : 'Low Stock'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Units</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform"><Box className="w-5 h-5 text-slate-300" /></div>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Available</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.available}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between group hover:border-amber-500/30 transition-all">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Assigned</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{stats.assigned}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowUpRight className="w-5 h-5 text-amber-400" /></div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium"><Calendar className="w-4 h-4 text-cyan-400" /><span>Filter Configuration</span></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Selected Asset</label>
            <div className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-cyan-400 font-medium">{selectedItem}</div>
          </div>
          <div>
            <label className="block text-slate-500 text-xs mb-2 uppercase tracking-wider">Time View</label>
            <div className="flex bg-slate-950/50 border border-white/10 rounded-lg p-1">
              {['day', 'week', 'month'].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${viewMode === mode ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" /> Liberaciones (Exits)</h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/5">{viewMode.toUpperCase()}</span>
        </div>
        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <LineChart data={chartData.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} ticks={yAxisConfig.ticks} domain={yAxisConfig.domain} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} cursor={{ stroke: '#38bdf8', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Table2 className="w-5 h-5 text-cyan-400" /> Asset Inventory List</h3>
          <span className="text-xs text-slate-400">{itemAssets.length} records</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10"><tr className="border-b border-white/10">
              <th className="pb-3 pt-1 text-slate-400 font-medium">Item</th>
              <th className="pb-3 pt-1 text-slate-400 font-medium">Serial</th>
              <th className="pb-3 pt-1 text-slate-400 font-medium">Status</th>
              <th className="pb-3 pt-1 text-slate-400 font-medium">Exit Date</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {itemAssets.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-500">No assets found matching filters</td></tr>
              ) : (
                itemAssets.map((asset, i) => {
                  const isAvailable = !asset.fecha_salida || asset.fecha_salida.trim() === '';
                  return (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-slate-200 font-medium truncate max-w-[200px]">{asset.nombre || asset.name || 'N/A'}</td>
                      <td className="py-3 text-slate-400 font-mono text-xs">{asset.serial || '-'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isAvailable ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-amber-900/30 text-amber-400 border border-amber-500/20'}`}>
                          {isAvailable ? 'In Stock' : 'Assigned'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{asset.fecha_salida || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal 
        isOpen={showOrderModal} 
        onClose={() => setShowOrderModal(false)} 
        item={selectedItem}
        available={stats.available}
        total={stats.total}
      />
    </div>
  );
};

export default ItemStatisticsPage;