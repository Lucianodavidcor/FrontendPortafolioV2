import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AdminHeader = () => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar proyectos, mensajes..." 
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-80 focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-primary/20 text-slate-600 dark:text-slate-300 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          Nuevo Proyecto
        </Button>
      </div>

    </header>
  );
};