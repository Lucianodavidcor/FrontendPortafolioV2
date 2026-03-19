"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Eye, Mail, FolderKanban, Wrench,
  Edit, ExternalLink, ArrowUpRight,
  TrendingUp, Activity, ChevronRight, Zap,
  BarChart3, Clock, MessageSquare, Code2
} from 'lucide-react';
import { Project, Stats } from '@/types/api';

interface DashboardClientProps {
  stats:          Stats | null;
  recentProjects: Project[];
}

const WEEKLY_ACTIVITY = [
  { day: 'Lun', visits: 42, messages: 3 },
  { day: 'Mar', visits: 78, messages: 5 },
  { day: 'Mié', visits: 55, messages: 2 },
  { day: 'Jue', visits: 91, messages: 8 },
  { day: 'Vie', visits: 110, messages: 6 },
  { day: 'Sáb', visits: 67, messages: 4 },
  { day: 'Dom', visits: 48, messages: 1 },
];

const MAX_VISITS = Math.max(...WEEKLY_ACTIVITY.map(d => d.visits));

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

function Bar({ height, label, visits, messages, index }: {
  height: number; label: string; visits: number; messages: number; index: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), index * 80 + 300);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 border border-border-dark text-white text-[10px] font-mono px-2 py-1.5 rounded-md whitespace-nowrap pointer-events-none shadow-xl z-10 relative">
        <div className="text-primary font-bold">{visits} visitas</div>
        <div className="text-slate-400">{messages} msgs</div>
      </div>

      <div className="relative w-full flex items-end justify-center h-32">
        <div
          className="w-full rounded-t-sm bg-primary/20 border border-primary/30 transition-all duration-700 ease-out group-hover:bg-primary/40 group-hover:border-primary/60 relative overflow-hidden"
          style={{ height: animated ? `${height}%` : '4px', minHeight: '4px' }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-transparent via-primary/10 to-primary/30" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/70" />
        </div>
      </div>

      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, accent, delay
}: {
  icon: React.ReactNode; label: string; value: number;
  sub?: string; accent?: boolean; delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-500 group cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${accent
          ? 'bg-primary border-primary/50 shadow-lg shadow-primary/20'
          : 'bg-background-dark border-border-dark hover:border-primary/40'
        }`}
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300
        ${accent ? 'bg-white/10' : 'bg-primary/0 group-hover:bg-primary/10'}`}
      />

      <div className="relative z-10">
        <div className={`inline-flex p-2 rounded-lg mb-4 ${accent ? 'bg-white/20' : 'bg-primary/10'}`}>
          <div className={accent ? 'text-white' : 'text-primary'}>
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-black tracking-tighter mb-1 ${accent ? 'text-white' : 'text-white'}`}>
          <AnimatedNumber value={value} />
        </div>
        <div className={`text-xs font-bold uppercase tracking-widest ${accent ? 'text-white/70' : 'text-slate-500'}`}>
          {label}
        </div>
        {sub && (
          <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit
            ${accent ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export const DashboardClient = ({ stats, recentProjects }: DashboardClientProps) => {
  // ── Fix hydration: la hora solo se calcula en el cliente ─────────────────
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hour     = now?.getHours() ?? 12;
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 font-display">

      {/* ── Encabezado ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Sistema operativo
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white leading-none">
            {greeting},<br />
            <span className="text-primary">Admin</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600 bg-surface-dark border border-border-dark rounded-lg px-4 py-2">
          <Clock className="w-3 h-3 text-primary" />
          <span>
            {now
              ? now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
              : '...'}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-primary">
            {now
              ? now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Visitas totales"
          value={stats?.pageVisits || 0}
          sub="esta semana"
          accent
          delay={0}
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Mensajes"
          value={stats?.messages?.total || 0}
          sub={stats?.messages?.unread ? `${stats.messages.unread} sin leer` : undefined}
          delay={100}
        />
        <StatCard
          icon={<FolderKanban className="w-5 h-5" />}
          label="Proyectos"
          value={stats?.projects || 0}
          delay={200}
        />
        <StatCard
          icon={<Code2 className="w-5 h-5" />}
          label="Habilidades"
          value={stats?.skills || 0}
          delay={300}
        />
      </div>

      {/* ── Gráfico + Panel rápido ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de actividad semanal */}
        <div className="lg:col-span-2 bg-background-dark border border-border-dark rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Actividad Semanal
              </h3>
              <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest">
                Visitas por día
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary/40 border border-primary/50" />
                Visitas
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[100, 75, 50, 25].map(pct => (
                <div key={pct} className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-slate-700 w-8 text-right">
                    {Math.round(MAX_VISITS * pct / 100)}
                  </span>
                  <div className="flex-1 border-t border-dashed border-slate-800/60" />
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2 pt-2 pl-12 pb-0">
              {WEEKLY_ACTIVITY.map((d, i) => (
                <Bar
                  key={d.day}
                  label={d.day}
                  visits={d.visits}
                  messages={d.messages}
                  height={Math.round((d.visits / MAX_VISITS) * 100)}
                  index={i}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-dark">
            {[
              { label: 'Total visitas', value: WEEKLY_ACTIVITY.reduce((a, b) => a + b.visits, 0).toLocaleString() },
              { label: 'Pico diario',   value: MAX_VISITS.toLocaleString() },
              { label: 'Mensajes',      value: WEEKLY_ACTIVITY.reduce((a, b) => a + b.messages, 0).toLocaleString() },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-black text-white">{item.value}</div>
                <div className="text-[9px] uppercase tracking-widest text-slate-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de acceso rápido */}
        <div className="bg-background-dark border border-border-dark rounded-xl p-6 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            Acceso Rápido
          </h3>

          {[
            { label: 'Nuevo Proyecto',    href: '/admin/projects/new',  icon: <FolderKanban className="w-4 h-4" />, accent: true },
            { label: 'Nueva Experiencia', href: '/admin/experience/new', icon: <Wrench className="w-4 h-4" /> },
            { label: 'Ver Mensajes',      href: '/admin/messages',       icon: <Mail className="w-4 h-4" />, badge: stats?.messages?.unread },
            { label: 'Editar Bio',        href: '/admin/bio-skills',     icon: <Edit className="w-4 h-4" /> },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all group cursor-pointer
                ${item.accent
                  ? 'bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/60'
                  : 'bg-surface-dark border-border-dark hover:border-primary/30 hover:bg-primary/5'
                }`}>
                <div className="flex items-center gap-3">
                  <span className={item.accent ? 'text-primary' : 'text-slate-400 group-hover:text-primary transition-colors'}>
                    {item.icon}
                  </span>
                  <span className={`text-xs font-bold ${item.accent ? 'text-primary' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge ? (
                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}

          <div className="mt-auto pt-4 border-t border-border-dark space-y-2">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-3">Estado del sistema</p>
            {[
              { label: 'API Backend',    ok: true },
              { label: 'Base de datos',  ok: true },
              { label: 'Sesión activa',  ok: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-[9px] font-bold ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                    {s.ok ? 'OK' : 'ERROR'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla de proyectos recientes ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Proyectos Recientes
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-0.5">
              Últimas entradas en el registro
            </p>
          </div>
          <Link href="/admin/projects">
            <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        <div className="bg-background-dark border border-border-dark rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-dark border-b border-border-dark text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <div className="col-span-5">Proyecto</div>
            <div className="col-span-4 hidden md:block">Stack</div>
            <div className="col-span-3 text-right">Acciones</div>
          </div>

          {recentProjects.length > 0 ? (
            <div className="divide-y divide-border-dark">
              {recentProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-dark transition-colors group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg bg-surface-dark border border-border-dark bg-cover bg-center shrink-0 group-hover:border-primary/30 transition-colors"
                      style={project.thumbnail ? { backgroundImage: `url(${project.thumbnail})` } : {}}
                    />
                    <div>
                      <p className="text-sm font-bold text-white leading-none mb-1">{project.title}</p>
                      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                        REF:{project.id.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-4 hidden md:flex flex-wrap gap-1.5">
                    {project.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-primary/10 text-primary border border-primary/20">
                        {tag}
                      </span>
                    ))}
                    {project.tags && project.tags.length > 3 && (
                      <span className="text-[9px] text-slate-600 font-bold">+{project.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-1">
                    <Link
                      href={`/projects/${project.id}`}
                      target="_blank"
                      className="p-2 text-slate-600 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                      title="Ver en vivo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="p-2 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <FolderKanban className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Sin proyectos</p>
              <p className="text-xs text-slate-700 mt-1">Crea tu primer proyecto desde el panel de Proyectos.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};