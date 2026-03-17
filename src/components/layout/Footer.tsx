import React from 'react';
import { Infinity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Infinity className="text-primary w-4 h-4" />
          </div>
          <span className="text-lg font-bold uppercase">Luciano Cortez</span>
        </div>
        <div className="flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} luciano Cortez. Lycheed. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};