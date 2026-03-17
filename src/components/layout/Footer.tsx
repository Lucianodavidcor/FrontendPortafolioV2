import React from 'react';
import Link from 'next/link';
import { Infinity, Github, Linkedin, Twitter, Instagram, Globe, ExternalLink, ArrowUpRight, Mail } from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterProps {
  socialLinks?: SocialLink[];
  authorName?: string;
}

// Mapeo de plataformas a iconos de Lucide
const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github'))    return <Github className="w-4 h-4" />;
  if (p.includes('linkedin'))  return <Linkedin className="w-4 h-4" />;
  if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-4 h-4" />;
  if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
  if (p.includes('mail') || p.includes('email')) return <Mail className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
};

const NAV_LINKS = [
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Habilidades', href: '#habilidades' },
  { label: 'Experiencia', href: '#experiencia' },
  { label: 'Contacto', href: '#contact' },
];

export const Footer = ({ socialLinks = [], authorName = 'Portfolio' }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border-dark bg-background-dark">

      {/* Glow de fondo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Franja superior ── */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-border-dark">

          {/* Columna: Marca */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Infinity className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-white">
                {authorName}
              </span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Construyendo interfaces que no se olvidan, una línea de código a la vez.
            </p>

            {/* Redes sociales dinámicas de la DB */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    title={link.platform}
                    className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl border border-border-dark bg-surface-dark/60 text-slate-400 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 text-xs font-bold"
                  >
                    <span className="text-primary group-hover/btn:scale-110 transition-transform">
                      {getPlatformIcon(link.platform)}
                    </span>
                    {link.platform}
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-60 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            {/* Fallback si no hay redes en la DB */}
            {socialLinks.length === 0 && (
              <div className="flex gap-3 pt-2">
                {[Github, Linkedin, Twitter].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-xl border border-border-dark bg-surface-dark/40 flex items-center justify-center text-slate-700"
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna: Navegación */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">Navegación</p>
            <ul className="space-y-3">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-medium"
                  >
                    <span className="w-4 h-px bg-border-dark group-hover:bg-primary group-hover:w-6 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna: CTA */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">¿Trabajamos juntos?</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Abierto a proyectos freelance, colaboraciones y oportunidades full-time.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 group px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Hablemos
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* ── Franja inferior ── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-700 font-medium">
            © {year} {authorName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Disponible para proyectos
          </div>
        </div>

      </div>
    </footer>
  );
};