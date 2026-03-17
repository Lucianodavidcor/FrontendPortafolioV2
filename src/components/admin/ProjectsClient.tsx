"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, ExternalLink, Image as ImageIcon, FolderKanban } from 'lucide-react';
import { Project, PaginationMeta } from '@/types/api';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ProjectsClientProps {
  initialProjects: Project[];
  meta?: PaginationMeta;
  token: string;
}

export const ProjectsClient = ({ initialProjects, meta, token }: ProjectsClientProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el proyecto "${title}"? Esta acción no se puede deshacer.`)) return;
    
    setIsLoading(id);
    try {
      await fetchApi(`/projects/${id}`, { 
        method: 'DELETE',
        token 
      });
      
      // Removemos el proyecto del estado local
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      alert(error.message || "Error al eliminar el proyecto");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera con botón de crear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona tu portafolio de trabajos. Añade, edita o elimina proyectos.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button icon={<Plus className="w-5 h-5" />}>
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      {/* Tabla de Proyectos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-150">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Proyecto</th>
              <th className="px-6 py-4">Descripción Corta</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-primary/5">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {project.thumbnail ? (
                        <div 
                          className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" 
                          style={{ backgroundImage: `url(${project.thumbnail})` }}
                        ></div>
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <span className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                    <span className="line-clamp-2">{project.shortDescription || 'Sin descripción'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                          {tag}
                        </span>
                      ))}
                      {project.tags && project.tags.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">...</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/projects/${project.id}`} 
                        target="_blank" 
                        title="Ver página pública"
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/admin/projects/${project.id}`} 
                        title="Editar proyecto"
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={isLoading === project.id}
                        title="Eliminar proyecto"
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
                  <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">No hay proyectos todavía.</p>
                  <p className="text-sm">Comienza creando tu primer proyecto para mostrarlo en tu portafolio.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Paginación */}
      {meta && meta.totalPages > 1 && (
        <div className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mt-4">
          Página {meta.page} de {meta.totalPages} (Total: {meta.total})
        </div>
      )}
    </div>
  );
};