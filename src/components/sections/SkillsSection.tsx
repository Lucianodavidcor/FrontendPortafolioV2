"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Skill } from '@/types/api';

interface SkillsSectionProps {
  skills: Skill[];
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

const CAT_STYLES: Record<string, { bar: string; badge: string; dot: string }> = {
  Frontend:  { bar: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400' },
  Backend:   { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Database:  { bar: 'bg-violet-500',  badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',  dot: 'bg-violet-400' },
  Design:    { bar: 'bg-pink-500',    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',    dot: 'bg-pink-400' },
  Tools:     { bar: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Other:     { bar: 'bg-slate-500',   badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};
const getStyle = (cat: string) => CAT_STYLES[cat] ?? CAT_STYLES.Other;

function SkillPill({ skill, index, inView }: { skill: Skill; index: number; inView: boolean }) {
  const s = getStyle(skill.category);
  return (
    <div
      className={`transition-all duration-500 ease-out
        ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold
        transition-all duration-200 hover:scale-105 cursor-default ${s.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        {skill.name}
      </div>
    </div>
  );
}

function CategoryBar({
  category, count, total, inView, delay,
}: { category: string; count: number; total: number; inView: boolean; delay: number }) {
  const pct = Math.round((count / total) * 100);
  const s   = getStyle(category);
  return (
    <div
      className={`transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-xs font-bold text-slate-300">{category}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{count} · {pct}%</span>
      </div>
      <div className="h-1 w-full bg-border-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${s.bar}`}
          style={{ width: inView ? `${pct}%` : '0%', transitionDelay: `${delay + 200}ms` }}
        />
      </div>
    </div>
  );
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const { ref, inView }                    = useInView(0.08);
  const { ref: panelRef, inView: panelIn } = useInView(0.1);
  const [activeTab, setActiveTab]          = useState('All');
  const [animKey, setAnimKey]              = useState(0);

  if (!skills || skills.length === 0) return null;

  const categories = Array.from(new Set(skills.map(s => s.category)));
  const tabs       = ['All', ...categories];
  const filtered   = activeTab === 'All' ? skills : skills.filter(s => s.category === activeTab);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
    setAnimKey(k => k + 1);
  };

  const topCat = categories.reduce((a, b) =>
    skills.filter(s => s.category === a).length >= skills.filter(s => s.category === b).length ? a : b
  , categories[0]);

  return (
    <section id="habilidades" className="py-28 px-6 max-w-7xl mx-auto">

      {/* Encabezado */}
      <div
        ref={ref}
        className={`mb-16 transition-all duration-700
          ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-px bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Experticia</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
          Habilidades
        </h2>
      </div>

      {/* Layout: panel izquierdo + pills derecha */}
      <div ref={panelRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Columna izquierda: stats */}
        <div
          className={`lg:col-span-4 transition-all duration-700 delay-100
            ${panelIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
        >
          <div className="rounded-2xl border border-border-dark bg-surface-dark/40 p-7 space-y-7 lg:sticky lg:top-28">

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">Stack overview</p>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">{skills.length}</p>
                <p className="text-[10px] text-slate-600 font-medium mt-1">tecnologías</p>
              </div>
              {topCat && (() => {
                const s = getStyle(topCat);
                return (
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-2">Especialidad</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {topCat}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="h-px bg-border-dark" />

            <div className="space-y-5">
              {categories.map((cat, i) => (
                <CategoryBar
                  key={cat}
                  category={cat}
                  count={skills.filter(s => s.category === cat).length}
                  total={skills.length}
                  inView={panelIn}
                  delay={i * 70}
                />
              ))}
            </div>

            <div className="h-px bg-border-dark" />

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {categories.map(cat => {
                const s = getStyle(cat);
                return (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna derecha: tabs + pills */}
        <div
          className={`lg:col-span-8 space-y-8 transition-all duration-700 delay-200
            ${panelIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-200
                  ${activeTab === tab
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-transparent border-border-dark text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
              >
                {tab}
                {tab !== 'All' && (
                  <span className={`ml-2 text-[9px] ${activeTab === tab ? 'text-white/60' : 'text-slate-700'}`}>
                    {skills.filter(s => s.category === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div key={animKey} className="flex flex-wrap gap-2.5">
            {filtered.map((skill, i) => (
              <SkillPill key={skill.id} skill={skill} index={i} inView={panelIn} />
            ))}
          </div>

          <p className="text-[11px] font-mono text-slate-700">
            {filtered.length === skills.length
              ? `${skills.length} tecnologías en total`
              : `${filtered.length} de ${skills.length} tecnologías`
            }
          </p>
        </div>

      </div>
    </section>
  );
};