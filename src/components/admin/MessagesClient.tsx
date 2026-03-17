"use client";

import React, { useState } from 'react';
import { Mail, MailOpen, Trash2, CheckCircle2 } from 'lucide-react';
import { Message, PaginationMeta } from '@/types/api';
import { fetchApi } from '@/lib/api';

interface MessagesClientProps {
  initialMessages: Message[];
  meta: PaginationMeta;
  token: string;
}

export const MessagesClient = ({ initialMessages, meta, token }: MessagesClientProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Marcar como leído
  const handleMarkAsRead = async (id: string) => {
    setIsLoading(id);
    try {
      await fetchApi(`/messages/${id}/read`, { 
        method: 'PUT',
        token 
      });
      
      // Actualizamos el estado local
      setMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, isRead: true } : msg)
      );
    } catch (error) {
      alert("Error al marcar como leído");
    } finally {
      setIsLoading(null);
    }
  };

  // Eliminar mensaje
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este mensaje?')) return;
    
    setIsLoading(id);
    try {
      await fetchApi(`/messages/${id}`, { 
        method: 'DELETE',
        token 
      });
      
      // Removemos el mensaje del estado local
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      alert("Error al eliminar el mensaje");
    } finally {
      setIsLoading(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm text-center">
        <MailOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold">Bandeja vacía</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">No tienes mensajes por el momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100 dark:divide-primary/5">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-6 transition-colors group flex flex-col md:flex-row gap-4 md:items-start justify-between ${
              msg.isRead ? 'bg-transparent' : 'bg-primary/5 dark:bg-primary/10'
            }`}
          >
            {/* Contenido del mensaje */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className={`text-base ${msg.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                  {msg.name}
                </h4>
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {msg.email}
                </span>
                {!msg.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${msg.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {msg.message}
              </p>
              {msg.createdAt && (
                <p className="text-xs text-slate-400">
                  {new Date(msg.createdAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
              {!msg.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(msg.id)}
                  disabled={isLoading === msg.id}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                  title="Marcar como leído"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden md:inline">Leído</span>
                </button>
              )}
              <button 
                onClick={() => handleDelete(msg.id)}
                disabled={isLoading === msg.id}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                title="Eliminar mensaje"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline">Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación simple (Muestra info de la página actual) */}
      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
          Página {meta.page} de {meta.totalPages} (Total: {meta.total})
        </div>
      )}
    </div>
  );
};