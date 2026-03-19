"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Layers,
  LayoutDashboard,
  FolderOpen,
  UserCircle,
  Inbox,
  Settings,
  Briefcase,
  Languages,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  userName:        string;
  userEmail:       string;
  unreadMessages:  number;
}

export const AdminSidebar = ({ userName, userEmail, unreadMessages }: AdminSidebarProps) => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard',  href: '/admin/dashboard',   icon: LayoutDashboard },
    { name: 'Proyectos',  href: '/admin/projects',    icon: FolderOpen },
    { name: 'Experiencia', href: '/admin/experience', icon: Briefcase },
    { name: 'Bio & Skills', href: '/admin/bio-skills', icon: UserCircle },
    { name: 'Bandeja',    href: '/admin/messages',    icon: Inbox, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { name: 'Idiomas',    href: '/admin/languages',   icon: Languages },
    { name: 'Ajustes',    href: '/admin/settings',    icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-primary/20 flex flex-col">

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
          const Icon     = link.icon;

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

              {link.badge !== undefined && (
                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil + Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-primary/10 space-y-2">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {userName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};