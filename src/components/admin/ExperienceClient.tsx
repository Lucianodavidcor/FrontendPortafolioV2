"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Briefcase } from 'lucide-react';
import { Experience } from '@/types/api';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ExperienceClientProps {
  initialData: Experience[];
  token: string;
}

export const ExperienceClient = ({ initialData, token }: ExperienceClientProps) => {
  const [experiences, setExperiences] = useState<Experience[]>(initialData);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDelete = async (id: string, role: string, company: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${role} en ${company}"?`)) return;
    
    setIsLoading(id);
    try {
      await fetchApi(`/experience/${id}`, { 
        method: 'DELETE',
        token 
      });
      
      setExperiences(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      alert(error.message || "Error al eliminar la experiencia");
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Presente';
    const date = new Date(dateString);
    // Aseguramos que se muestre en un formato corto ej. "ene 2023"
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Experiencia</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona tu trayectoria profesional y puestos de trabajo.
          </p>
        </div>
        <Link href="/admin/experience/new">
          <Button icon={<Plus className="w-5 h-5" />}>
            Nueva Experiencia
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-150">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Empresa / Rol</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-primary/5">
            {experiences.length > 0 ? (
              experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{exp.role}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">{exp.company}</p>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-medium">
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-75">
                    <span className="line-clamp-2">{exp.description}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/experience/${exp.id}`} 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(exp.id, exp.role, exp.company)}
                        disabled={isLoading === exp.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">No hay experiencia registrada.</p>
                  <p className="text-sm">Añade tu primer trabajo o proyecto.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};