"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Download, Menu, X, ArrowUpRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const NAV_ITEMS = [
  { label: 'Proyectos',   hash: 'proyectos' },
  { label: 'Habilidades', hash: 'habilidades' },
  { label: 'Experiencia', hash: 'experiencia' },
];

const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/CV-Luciano-Cortez.pdf';

export const Header = () => {
  const pathname                          = usePathname();
  const isHome                            = pathname === '/';
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!isHome) return;
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ hash }) => {
      const el = document.getElementById(hash);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(hash); },
        { rootMargin: '-40% 0px -50% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [isHome]);

  const getHref  = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;
  const isActive = (hash: string) => isHome && activeSection === hash;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-70 transition-all duration-500
          ${scrolled || mobileOpen
            ? 'py-3 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark shadow-2xl shadow-black/20'
            : 'py-5 bg-transparent'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            onClick={e => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center shrink-0 group"
          >
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
              <Image src="/logoLycheedOS.png" alt="LycheedOS Logo" fill className="object-contain" priority />
            </div>
          </Link>

          {/* Nav Desktop */}
          <div className={`hidden md:flex items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300
            ${scrolled
              ? 'bg-surface-dark/60 border border-border-dark'
              : 'bg-white/5 border border-white/10 backdrop-blur-sm'
            }`}>
            {NAV_ITEMS.map(({ label, hash }) => (
              <a
                key={hash}
                href={getHref(hash)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive(hash)
                    ? 'text-white bg-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {isActive(hash) && (
                  <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-primary" />
                )}
                {label}
              </a>
            ))}
          </div>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* ── Selector de idioma ── */}
            <LanguageSwitcher />

            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              download={!cvUrl.startsWith('http')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 hover:scale-105
                ${scrolled
                  ? 'bg-surface-dark border-border-dark text-slate-300 hover:border-primary/40 hover:text-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                }`}
            >
              <Download className="w-4 h-4" />
              CV
            </a>

            <a
              href={isHome ? '#contact' : '/#contact'}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:scale-105 transition-transform shadow-lg shadow-primary/25 group"
            >
              Contacto
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Hamburguesa Mobile */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark/60 text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Drawer Mobile — empieza debajo del header */}
      <div className={`fixed inset-x-0 top-16 bottom-0 z-60 md:hidden transition-all duration-300
          ${mobileOpen ? 'visible' : 'invisible pointer-events-none'}`}>

        {/* Fondo oscuro */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-background-dark/80 backdrop-blur-sm transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Panel deslizable */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-surface-dark border-l border-border-dark shadow-2xl flex flex-col transition-transform duration-300 ease-out
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Links nav */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV_ITEMS.map(({ label, hash }, i) => (
              <a
                key={hash}
                href={getHref(hash)}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border
                  ${isActive(hash)
                    ? 'bg-primary/15 text-white border-primary/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                  }`}
              >
                <span>{label}</span>
                {isActive(hash) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </a>
            ))}
          </nav>

          {/* Acciones mobile */}
          <div className="px-4 pb-8 pt-4 space-y-3 border-t border-border-dark">

            {/* Selector idioma mobile */}
            <div className="flex justify-center pb-1">
              <LanguageSwitcher />
            </div>

            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              download={!cvUrl.startsWith('http')}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border-dark bg-surface-dark/60 text-sm font-bold text-slate-300 hover:text-white hover:border-primary/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar CV
            </a>
            <a
              href={isHome ? '#contact' : '/#contact'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Contacto
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};