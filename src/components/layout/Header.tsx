"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Infinity, Download, Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Proyectos',   href: '#proyectos' },
  { label: 'Habilidades', href: '#habilidades' },
  { label: 'Experiencia', href: '#experiencia' },
];

const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/cv.pdf';

export const Header = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Detectar scroll para cambiar apariencia del header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Detectar sección activa con IntersectionObserver
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.replace('#', ''));
    const observers: IntersectionObserver[] = [];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -50% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Cerrar menú mobile al hacer click en un link
  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
          ${scrolled
            ? 'py-3 bg-background-dark/80 backdrop-blur-xl border-b border-border-dark shadow-2xl shadow-black/20'
            : 'py-5 bg-transparent'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className={`p-1.5 rounded-xl transition-all duration-300 group-hover:rotate-[20deg] group-hover:scale-110
              ${scrolled ? 'bg-primary' : 'bg-primary/90'}`}>
              <Infinity className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-white">
              ALEX<span className="text-primary">.</span>D
            </span>
          </Link>

          {/* ── Nav Desktop ── */}
          <div className={`hidden md:flex items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300
            ${scrolled
              ? 'bg-surface-dark/60 border border-border-dark'
              : 'bg-white/5 border border-white/10 backdrop-blur-sm'
            }`}>
            {NAV_LINKS.map(link => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? 'text-white bg-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-primary" />
                  )}
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* ── Acciones Desktop ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
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
              href="#contact"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:scale-105 transition-transform shadow-lg shadow-primary/25 group"
            >
              Contacto
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* ── Hamburguesa Mobile ── */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark/60 text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </nav>
      </header>

      {/* ── Menú Mobile (drawer) ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300
          ${mobileOpen ? 'visible' : 'invisible pointer-events-none'}`}
      >
        {/* Overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-background-dark/80 backdrop-blur-sm transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-surface-dark border-l border-border-dark shadow-2xl transition-transform duration-300 ease-out flex flex-col
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header del drawer */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Infinity className="text-white w-4 h-4" />
              </div>
              <span className="text-sm font-black tracking-tighter uppercase text-white">
                ALEX<span className="text-primary">.</span>D
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-dark text-slate-500 hover:text-white hover:border-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links del drawer */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV_LINKS.map((link, i) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick}
                  style={{ transitionDelay: `${i * 40}ms` }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? 'bg-primary/15 text-white border border-primary/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </a>
              );
            })}
          </nav>

          {/* Acciones del drawer */}
          <div className="px-4 pb-8 space-y-3 border-t border-border-dark pt-4">
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              download={!cvUrl.startsWith('http')}
              onClick={handleNavClick}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border-dark bg-surface-dark/60 text-sm font-bold text-slate-300 hover:text-white hover:border-primary/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar CV
            </a>
            <a
              href="#contact"
              onClick={handleNavClick}
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