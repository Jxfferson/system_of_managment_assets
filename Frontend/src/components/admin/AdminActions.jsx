import React from 'react';
import { Plus, Layers, Filter, User, Settings, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
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
  onLogout,
  onChangePassword
}) => {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      {activeTab === 'assets' && (
        <>
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
          <ExportMenu filteredAssets={filteredAssets} />
        </>
      )}

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