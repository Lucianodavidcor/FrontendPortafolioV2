"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Image as ImageIcon, 
  Layers, 
  Search,
  ChevronRight
} from 'lucide-react';
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
    if (!window.confirm(`¿Estás seguro de eliminar el proyecto "${title}"?`)) return;
    
    setIsLoading(id);
    try {
      await fetchApi(`/projects/${id}`, { 
        method: 'DELETE',
        token 
      });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      alert(error.message || "Error al eliminar el proyecto");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs técnicos */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        <span>Admin</span>
        <ChevronRight size={12} />
        <span>Portfolio</span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Projects</span>
      </div>

      {/* Header Estilo Admin Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Project Inventory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and monitor your professional showcase registry.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter projects..."
              className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none w-64 transition-all"
            />
          </div>
          <Link href="/admin/projects/new">
            <Button className="rounded-lg px-4 py-2.5" icon={<Plus size={18} />}>
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Resource</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Overview</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Stack</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-dark transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark bg-cover bg-center shrink-0 flex items-center justify-center overflow-hidden"
                          style={project.thumbnail ? { backgroundImage: `url(${project.thumbnail})` } : {}}
                        >
                          {!project.thumbnail && <ImageIcon size={20} className="text-slate-400" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                            {project.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                            REF: {project.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs line-clamp-1 font-medium italic">
                        {project.shortDescription || 'No description provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                        {project.tags && project.tags.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold px-1">+{project.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link 
                          href={`/projects/${project.id}`} 
                          target="_blank" 
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Preview Live"
                        >
                          <ExternalLink size={18} strokeWidth={1.5} />
                        </Link>
                        <Link 
                          href={`/admin/projects/${project.id}`} 
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Edit Resource"
                        >
                          <Edit3 size={18} strokeWidth={1.5} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(project.id, project.title)}
                          disabled={isLoading === project.id}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                          title="Remove"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Layers size={40} className="mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">Registry Empty</p>
                      <p className="text-xs">No project entries found in the database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer de Tabla / Meta */}
      {meta && (
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Total Records: {meta.total}
          </span>
          <div className="flex gap-4">
             {/* Paginación minimalista aquí */}
          </div>
        </div>
      )}
    </div>
  );
};