"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, LayoutDashboard, FolderOpen, UserCircle, Inbox, Settings, Briefcase } from 'lucide-react';

export const AdminSidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
    { name: 'Experiencia', href: '/admin/experience', icon: Briefcase },
    { name: 'Bio & Skills', href: '/admin/bio-skills', icon: UserCircle },
    { name: 'Bandeja', href: '/admin/messages', icon: Inbox, badge: 3 },
    { name: 'Ajustes', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-primary/20 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <Layers className="w-5 h-5" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">Portfoli<span className="text-primary">Admin</span></h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-2 py-4">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/20 border-l-4 border-primary text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-primary/10 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-sm font-semibold">{link.name}</span>
              
              {link.badge && (
                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil del Usuario */}
      <div className="p-4 border-t border-slate-200 dark:border-primary/10">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-primary/30 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop')" }}></div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">Alex Designer</p>
            <p className="text-xs text-slate-500 truncate">alex@portfolio.com</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
};