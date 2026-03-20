"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LS_KEY = 'admin_notifications_read';

// Simulación de notificaciones — reemplaza con datos reales de tu API si quieres
const MOCK_NOTIFICATIONS = [
  { id: '1', text: 'Nuevo mensaje de contacto recibido', time: 'hace 5 min', read: false },
  { id: '2', text: 'Proyecto "Portfolio v2" actualizado', time: 'hace 1 h', read: false },
  { id: '3', text: 'Sesión iniciada desde Buenos Aires', time: 'hace 3 h', read: true },
];

/** Lee los IDs de notificaciones ya leídas desde localStorage */
function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

/** Guarda los IDs de notificaciones leídas en localStorage */
function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage puede no estar disponible (SSR, modo privado, etc.)
  }
}

export const AdminHeader = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  // Estado inicial igual al mock (sin localStorage), evita mismatch de hidratación SSR
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Post-mount: sincroniza las notificaciones con los IDs leídos guardados en localStorage
  // (solo se ejecuta en el cliente, después de la hidratación)
  useEffect(() => {
    const readIds = getReadIds();
    if (readIds.size > 0) {
      setNotifications(MOCK_NOTIFICATIONS.map(n => ({
        ...n,
        read: n.read || readIds.has(n.id),
      })));
    }
  }, []);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda: navega a la sección correspondiente al presionar Enter
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();

    if (q.includes('proyecto') || q.includes('project')) {
      router.push('/admin/projects');
    } else if (q.includes('mensaje') || q.includes('message')) {
      router.push('/admin/messages');
    } else if (q.includes('experiencia') || q.includes('experience')) {
      router.push('/admin/experience');
    } else if (q.includes('skill') || q.includes('habilidad') || q.includes('bio')) {
      router.push('/admin/bio-skills');
    } else if (q.includes('ajuste') || q.includes('setting') || q.includes('contraseña')) {
      router.push('/admin/settings');
    } else {
      router.push('/admin/dashboard');
    }

    setSearchQuery('');
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveReadIds(new Set(updated.map(n => n.id)));
      return updated;
    });
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">

      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Buscar sección… (Enter)"
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-10 py-2 text-sm w-80 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2" ref={notifRef}>

        {/* Campana con dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-primary/20 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Panel de Notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/20 rounded-xl shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Notificaciones</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 flex gap-3 items-start transition-colors ${notif.read ? '' : 'bg-primary/5'}`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary animate-pulse'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
                        {notif.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => { router.push('/admin/messages'); setShowNotifications(false); }}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Ver bandeja de entrada →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};