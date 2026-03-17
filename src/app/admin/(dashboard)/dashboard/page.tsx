import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Eye, Mail, FolderKanban, Wrench, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Importamos correctamente las opciones tipadas
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, PaginatedApiResponse, Project, Stats } from '@/types/api';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // TypeScript ahora reconoce perfectamente 'session.user.token'
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  const [statsRes, projectsRes] = await Promise.all([
    fetchApi<ApiResponse<Stats>>('/stats', { token: session.user.token }).catch(() => null),
    fetchApi<PaginatedApiResponse<Project[]>>('/projects?page=1&limit=5').catch(() => null),
  ]);

  const stats = statsRes?.data;
  const recentProjects = projectsRes?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resumen del Panel</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Bienvenido de nuevo. Aquí tienes un resumen del rendimiento de tu portafolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Visitas a la página</p>
          <p className="text-2xl font-bold">{stats?.pageVisits || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Mail className="w-6 h-6" />
            </div>
            {stats?.messages?.unread ? (
              <span className="text-primary text-xs font-bold px-2 py-1 bg-primary/10 rounded-full">
                {stats.messages.unread} nuevos
              </span>
            ) : null}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mensajes Totales</p>
          <p className="text-2xl font-bold">{stats?.messages?.total || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Proyectos Publicados</p>
          <p className="text-2xl font-bold">{stats?.projects || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Habilidades Técnicas</p>
          <p className="text-2xl font-bold">{stats?.skills || 0}</p>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Proyectos Recientes</h3>
          <Link href="/admin/projects" className="text-primary text-sm font-bold hover:underline">
            Ver Todos
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-sm overflow-x-auto">
          {/* Corregido: min-w-[600px] a min-w-150 */}
          <table className="w-full text-left min-w-150">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-primary/5">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg bg-cover bg-center" 
                          style={{ backgroundImage: `url(${project.thumbnail})` }}
                        ></div>
                        <span className="font-bold text-sm">{project.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {project.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {tag}
                          </span>
                        ))}
                        {project.tags && project.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/projects/${project.id}`} target="_blank" className="p-2 hover:text-green-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button className="p-2 hover:text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No hay proyectos creados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}