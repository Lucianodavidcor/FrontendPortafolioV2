import React from 'react';
import { Download } from 'lucide-react';
import { Experience } from '@/types/api';

interface ExperienceSectionProps {
  experiences: Experience[];
}

// Formatea "2022-03-01T00:00:00.000Z" → "mar. 2022"
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Presente';
  const date = new Date(dateString);
  // Forzamos UTC para evitar que el offset horario adelante/atrase un día
  const month = date.toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' });
  const year = date.toLocaleDateString('es-AR', { year: 'numeric', timeZone: 'UTC' });
  return `${month} ${year}`;
};

export const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  if (!experiences || experiences.length === 0) return null;

  const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/CV-Luciano-Cortez.pdf';

  return (
    <section id="experiencia" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Cabecera */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">
            Trayectoria Profesional
          </h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase leading-none">
            MI <br />
            <span className="text-primary italic">VIAJE</span>
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Aporto valor a través de una mentalidad de producto combinada con
            excelencia técnica. He ayudado a proyectos a escalar sus experiencias
            digitales.
          </p>
          <div className="pt-4">
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              <Download className="w-5 h-5" />
              Descargar CV Completo
            </a>
          </div>
        </div>

        {/* Timeline Desktop */}
        <div className="lg:col-span-8 relative space-y-12 before:absolute before:left-0 md:before:left-1/2 before:top-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent before:-ml-[1px] hidden md:block">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className="relative flex items-center justify-between md:odd:flex-row-reverse group"
            >
              {/* Punto de la timeline */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-background-dark z-10 transition-colors ${
                  index === 0
                    ? 'bg-primary'
                    : 'bg-primary/40 group-hover:bg-primary'
                }`}
              />

              {/* Tarjeta */}
              <div className="w-full md:w-[45%] glass-card p-8 rounded-3xl border-primary/20 transition-all group-hover:bg-primary/10">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <div>
                    <h4 className="text-xl font-bold">{exp.role}</h4>
                    <p className="text-primary font-medium">{exp.company}</p>
                  </div>
                  {/* Badge de fechas — ahora muestra mes + año */}
                  <span className="text-xs font-bold px-3 py-1 bg-primary/20 text-primary rounded-full uppercase whitespace-nowrap">
                    {formatDate(exp.startDate)}&nbsp;—&nbsp;{formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>

              <div className="hidden md:block w-[45%]" />
            </div>
          ))}
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden space-y-8 relative before:absolute before:left-4 before:top-0 before:h-full before:w-[2px] before:bg-primary/20 lg:col-span-8">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="relative pl-12 space-y-2">
              <div
                className={`absolute left-3 top-1 w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-primary' : 'bg-primary/40'
                }`}
              />
              {/* Fechas con mes + año en mobile */}
              <span className="inline-block text-xs font-bold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">
                {formatDate(exp.startDate)}&nbsp;—&nbsp;{formatDate(exp.endDate)}
              </span>
              <h4 className="text-xl font-bold">{exp.role}</h4>
              <p className="text-sm text-slate-400">{exp.company}</p>
              <p className="text-sm opacity-70 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};