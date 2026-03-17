"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Project } from '@/types/api';

interface ProjectsSectionProps {
  projects: Project[];
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function CardInner({
  project, index, isLarge, inView,
}: { project: Project; index: number; isLarge: boolean; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  // Mostrar hasta 6 tags
  const visibleTags = project.tags?.slice(0, 6) ?? [];
  const extraCount  = (project.tags?.length ?? 0) - 6;

  return (
    <div
      className={`transition-all duration-700 ease-out h-full
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${(index % 2) * 120}ms` }}
    >
      <Link href={`/projects/${project.id}`} className="block h-full">
        <div
          className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-border-dark
            hover:border-primary/30 transition-all duration-500 h-full"
          style={{ minHeight: '360px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Imagen */}
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
                ${hovered ? 'scale-105 brightness-75' : 'scale-100 brightness-50'}`}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-surface-dark to-background-dark" />
          )}

          {/* Gradiente */}
          <div className="absolute inset-0 bg-linear-to-t from-background-dark/92 via-background-dark/15 to-transparent" />

          {/* Número */}
          <div className="absolute top-5 right-5 text-[10px] font-mono font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* Tags — hasta 6, con +N si hay más */}
          <div className="absolute top-5 left-5 flex flex-wrap gap-1.5 max-w-[70%]">
            {visibleTags.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-background-dark/70 backdrop-blur-sm border border-border-dark text-[9px] font-bold uppercase tracking-widest text-slate-400 rounded-full"
              >
                {tag}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="px-2.5 py-1 bg-background-dark/70 backdrop-blur-sm border border-border-dark text-[9px] font-bold text-slate-600 rounded-full">
                +{extraCount}
              </span>
            )}
          </div>

          {/* Contenido inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-black text-white tracking-tighter leading-none mb-2
                    ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}
                >
                  {project.title}
                </h3>
                <p
                  className={`text-sm text-slate-400 leading-relaxed line-clamp-2 max-w-md transition-all duration-300
                    ${hovered ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0 overflow-hidden'}`}
                >
                  {project.shortDescription}
                </p>
              </div>

              <div
                className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300
                  ${hovered
                    ? 'bg-primary border-primary text-white scale-110 rotate-0'
                    : 'bg-transparent border-slate-700 text-slate-500 -rotate-45'
                  }`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Borde izquierdo accent */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-0.5 bg-primary transition-opacity duration-500
              ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </Link>
    </div>
  );
}

// Fila como componente propio para tener su propio useInView
function ProjectRow({
  row, rowIndex, globalStart,
}: { row: Project[]; rowIndex: number; globalStart: number }) {
  const { ref, inView } = useInView(0.1);
  const isEvenRow = rowIndex % 2 === 0;

  const getSpan  = (col: number) => isEvenRow ? (col === 0 ? 'md:col-span-8' : 'md:col-span-4') : (col === 0 ? 'md:col-span-4' : 'md:col-span-8');
  const getIsLarge = (col: number) => isEvenRow ? col === 0 : col === 1;

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:items-stretch">
      {row.map((project, colIdx) => (
        <div key={project.id} className={getSpan(colIdx)}>
          <CardInner
            project={project}
            index={globalStart + colIdx}
            isLarge={getIsLarge(colIdx)}
            inView={inView}
          />
        </div>
      ))}
      {row.length === 1 && (
        <div className={`hidden md:block ${isEvenRow ? 'md:col-span-4' : 'md:col-span-8'}`} />
      )}
    </div>
  );
}

export const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  const { ref: titleRef, inView: titleIn } = useInView(0.2);

  if (!projects || projects.length === 0) return null;

  const rows: Project[][] = [];
  for (let i = 0; i < projects.length; i += 2) {
    rows.push(projects.slice(i, i + 2));
  }

  return (
    <section id="proyectos" className="py-28 px-6 max-w-7xl mx-auto">

      <div
        ref={titleRef}
        className={`flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8
          transition-all duration-700 ${titleIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Trabajos seleccionados
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
            Proyectos
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-sm font-medium hidden md:block">
            {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
          </span>
          <div className="w-px h-6 bg-border-dark hidden md:block" />
          <p className="text-slate-500 text-sm max-w-55 leading-relaxed">
            Interfaces que priorizan el propósito sobre el flash.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((row, rowIdx) => (
          <ProjectRow key={rowIdx} row={row} rowIndex={rowIdx} globalStart={rowIdx * 2} />
        ))}
      </div>

      {projects.length >= 6 && (
        <div className={`mt-14 text-center transition-all duration-700 delay-500 ${titleIn ? 'opacity-100' : 'opacity-0'}`}>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 border border-border-dark bg-surface-dark/50 text-slate-300 hover:text-white hover:border-primary/30 hover:bg-primary/5 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all"
          >
            Ver todos los proyectos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  );
};