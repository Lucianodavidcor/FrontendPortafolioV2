import React from 'react';
import Link from 'next/link';
import { Infinity, Download } from 'lucide-react';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12 md:py-6">
      <nav className="flex items-center justify-between glass-card rounded-full px-6 py-3 max-w-7xl mx-auto border border-primary/20">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-1 rounded-lg transition-transform group-hover:rotate-45 flex items-center justify-center">
            <Infinity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter dark:text-white uppercase">ALEX.D</span>
        </Link>

        {/* Links de Navegación (Desktop) */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#proyectos" className="text-sm font-medium hover:text-primary transition-colors">Proyectos</a>
          <a href="#habilidades" className="text-sm font-medium hover:text-primary transition-colors">Habilidades</a>
          <a href="#experiencia" className="text-sm font-medium hover:text-primary transition-colors">Experiencia</a>
          <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">Sobre mí</a>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-4">
          <a href="/cv.pdf" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-800 text-primary dark:text-white px-5 py-2 rounded-full text-sm font-bold border-2 border-primary/20 hover:border-primary/50 transition-all">
            <Download className="w-4 h-4" />
            Descargar CV
          </a>
          <a href="#contact" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20">
            Contacto
          </a>
        </div>

      </nav>
    </header>
  );
};