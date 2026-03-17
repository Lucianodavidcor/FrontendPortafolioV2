import React from 'react';
import { Skill } from '@/types/api';
import { Code2, PenTool, Layout, Terminal } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => {
  if (!skills || skills.length === 0) return null;

  // Agrupamos las habilidades por categoría para mostrarlas en los cards
  const categories = Array.from(new Set(skills.map(s => s.category)));

  // Mapeo simple de iconos lucide para las categorías principales
  const getCategoryIcon = (index: number) => {
    const icons = [<PenTool key={1} />, <Code2 key={2} />, <Layout key={3} />, <Terminal key={4} />];
    return icons[index % icons.length];
  };

  return (
    <section id="habilidades" className="py-24 bg-primary/5 dark:bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Tarjetas de Categorías */}
        <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {categories.slice(0, Math.ceil(categories.length / 2)).map((cat, idx) => (
              <div key={cat} className="glass-card p-6 rounded-2xl border-primary/20 hover:bg-primary/10 transition-colors group">
                <div className="text-primary mb-4 text-3xl *:w-8 *:h-8">
                  {getCategoryIcon(idx)}
                </div>
                <h5 className="font-bold text-lg">{cat}</h5>
                <p className="text-sm opacity-70 mt-2">
                  {skills.filter(s => s.category === cat).map(s => s.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-8">
            {categories.slice(Math.ceil(categories.length / 2)).map((cat, idx) => (
              <div key={cat} className="glass-card p-6 rounded-2xl border-primary/20 hover:bg-primary/10 transition-colors group">
                <div className="text-primary mb-4 text-3xl *:w-8 *:h-8">
                  {getCategoryIcon(idx + 2)}
                </div>
                <h5 className="font-bold text-lg">{cat}</h5>
                <p className="text-sm opacity-70 mt-2">
                  {skills.filter(s => s.category === cat).map(s => s.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Textos y Etiquetas (Pills) */}
        <div className="order-1 lg:order-2">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Experticia</h2>
          <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight uppercase">MIS <br /> <span className="text-stroke">HABILIDADES</span></h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            Creo en usar la herramienta adecuada para cada trabajo. Mi flujo de trabajo se basa en la velocidad, precisión y la búsqueda incansable de la calidad.
          </p>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span key={skill.id} className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold border border-slate-300/10 hover:border-primary/50 transition-colors uppercase">
                {skill.name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};