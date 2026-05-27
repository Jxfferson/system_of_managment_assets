import React from 'react';
import { Plus, Layers, Filter, User, Settings, Lock, LogOut, ScanLine, Radio, Power, PlugZap, CircleHelp, ClipboardPlus, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExportMenu from './ExportMenu';

export const AdminActions = ({
  activeTab,
  onAdd,
  onAddLot,
  onToggleFilters,
  filteredAssets,
  itemPrefixMap,
  exchangeRate,
  onLogout,
  onChangePassword,
  // 🔹 Props del scanner (agregar estos)
  scannerConnected = false,
  scannerActive = false,
  scannerMode = 'registro',
  onConfigureScanner,
  onToggleScanner,
  onDisconnectScanner,
  onScannerModeChange,
  onScannerHelp
}) => {
  // 🔹 Label para el modo del scanner
  const scannerModeLabel = scannerMode === 'registro'
    ? 'Register'
    : scannerMode === 'salida'
      ? 'Check Out'
      : scannerMode === 'retorno'
        ? 'Return'
        : 'Register';

  return (
    <div className="flex gap-3 flex-wrap items-center">
      {activeTab === 'assets' && (
        <>
          {/* 🔹 BOTÓN Y MENÚ DEL SCANNER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`group h-10 w-10 justify-start overflow-hidden border-white/10 px-3 transition-all duration-300 ease-out hover:w-[105px] focus-visible:w-[88px] hover:bg-white/5 ${scannerActive ? 'text-cyan-300 bg-cyan-500/10 border-cyan-400/40' : 'text-slate-300'}`}
                title="Configure and use scanner"
                aria-label="Scanner"
              >
                <ScanLine className="h-4 w-4 shrink-0" />
                <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[54px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[54px] group-focus-visible:opacity-100">
                  Scanner
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-slate-900 border-slate-700 text-white" sideOffset={8}>
              <DropdownMenuLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                SCANNER
              </DropdownMenuLabel>
              <DropdownMenuItem className="text-xs text-slate-400 cursor-default focus:bg-transparent">
                Status: {scannerConnected ? (scannerActive ? 'Connected and active' : 'Connected') : 'Disconnected'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-slate-400 cursor-default focus:bg-transparent">
                Mode: {scannerModeLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={onConfigureScanner} className="cursor-pointer hover:bg-slate-800">
                <PlugZap className="w-4 h-4 mr-2 text-cyan-400" /> Configure Scanner
              </DropdownMenuItem>
              {scannerConnected && (
                <DropdownMenuItem onClick={onDisconnectScanner} className="cursor-pointer hover:bg-slate-800 text-amber-300">
                  <Power className="w-4 h-4 mr-2 text-amber-300" /> Disconnect Scanner
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onToggleScanner} className="cursor-pointer hover:bg-slate-800">
                <Radio className="w-4 h-4 mr-2 text-emerald-400" /> {scannerActive ? 'Pause Scanner' : 'Activate Scanner'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuLabel className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                Scanning Mode
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={scannerMode} onValueChange={onScannerModeChange}>
                <DropdownMenuRadioItem value="registro" className="cursor-pointer hover:bg-slate-800">
                  <ClipboardPlus className="w-4 h-4 mr-2 text-cyan-300" /> Register
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="salida" className="cursor-pointer hover:bg-slate-800">
                  <ArrowRightLeft className="w-4 h-4 mr-2 text-cyan-300" /> Check Out
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="retorno" className="cursor-pointer hover:bg-slate-800">
                  <RotateCcw className="w-4 h-4 mr-2 text-cyan-300" /> Return
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={onScannerHelp} className="cursor-pointer hover:bg-slate-800">
                <CircleHelp className="w-4 h-4 mr-2 text-sky-300" /> Scanner Help
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 🔹 Botones existentes (se mantienen igual) */}
          <Button 
            onClick={onAdd} 
            className="h-10 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700" 
            title="Nuevo Activo (Ctrl+Alt+N)"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </Button>
          <Button 
            onClick={onAddLot} 
            className="h-10 px-6 bg-gradient-to-r from-slate-500 to-slate-700 text-white hover:from-slate-600 hover:to-slate-800" 
            title="Nuevo Lote (Ctrl+Alt+L)"
          >
            <Layers className="w-4 h-4 mr-2" /> Add Lot
          </Button>
          <Button 
            onClick={onToggleFilters} 
            variant="outline" 
            className="h-10 border-white/10 text-slate-300 hover:bg-white/5" 
            title="Filtros (Ctrl+Alt+F)"
          >
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <ExportMenu 
            filteredAssets={filteredAssets}
            itemPrefixMap={itemPrefixMap}
            exchangeRate={exchangeRate}
          />
        </>
      )}

      {/* 🔹 Menú de Admin (se mantiene igual) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 px-4 border-white/10 text-slate-300 hover:bg-white/5">
            <User className="w-4 h-4 mr-2" /> Admin <Settings className="w-3 h-3 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-slate-900 border-slate-700 text-white"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            ADMIN PANEL
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={onChangePassword} className="cursor-pointer hover:bg-slate-800">
            <Lock className="w-4 h-4 mr-2 text-cyan-400" /> Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer hover:bg-red-950 text-red-400">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminActions;