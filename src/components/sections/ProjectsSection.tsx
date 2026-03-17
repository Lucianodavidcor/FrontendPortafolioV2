import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/types/api';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="proyectos" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Trabajos Seleccionados</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase">PROYECTOS</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
          Una colección curada de productos digitales que priorizan el propósito sobre el flash.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {projects.map((project, index) => {
          // Recreamos el patrón de grilla asimétrica de tu HTML original (8 columnas, 4 columnas)
          const isLarge = index % 4 === 0 || index % 4 === 3;
          
          return (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id}
              className={`${isLarge ? 'md:col-span-8 aspect-[16/10]' : 'md:col-span-4 aspect-[9/10] md:aspect-auto'} group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-800`}
            >
              <img 
                src={project.thumbnail} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                {project.tags && project.tags.length > 0 && (
                  <span className="text-primary font-bold text-xs uppercase mb-2">
                    {project.tags.join(' • ')}
                  </span>
                )}
                <h4 className="text-3xl font-bold text-white mb-4">{project.title}</h4>
                <div className="flex gap-2">
                  <ArrowUpRight className="text-white w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};