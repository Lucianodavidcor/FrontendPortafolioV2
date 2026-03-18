"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Proyectos',   href: '#proyectos' },
  { label: 'Habilidades', href: '#habilidades' },
  { label: 'Experiencia', href: '#experiencia' },
];

const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/cv.pdf';

export const Header = () => {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          <Link href="/" className="flex items-center shrink-0 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logoLycheedOS.png"
                alt="LycheedOS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* ── Nav Desktop ── */}
          <div className={`hidden md:flex items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300
            ${scrolled
              ? 'bg-surface-dark/60 border border-border-dark'
              : 'bg-white/5 border border-white/10 backdrop-blur-sm'
            }`}>
            {NAV_LINKS.map(link => {
              const id       = link.href.replace('#', '');
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
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </nav>
      </header>

      {/* ── Drawer Mobile ── */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300
          ${mobileOpen ? 'visible' : 'invisible pointer-events-none'}`}>

        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-background-dark/80 backdrop-blur-sm transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className={`absolute top-0 right-0 h-full w-72 bg-surface-dark border-l border-border-dark shadow-2xl flex flex-col transition-transform duration-300 ease-out
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark">
            <div className="relative w-8 h-8">
              <Image src="/logoLycheedOS.png" alt="Logo" fill className="object-contain" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-dark text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV_LINKS.map((link, i) => {
              const id       = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ transitionDelay: `${i * 40}ms` }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border
                    ${isActive
                      ? 'bg-primary/15 text-white border-primary/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </a>
              );
            })}
          </nav>

          <div className="px-4 pb-8 pt-4 space-y-3 border-t border-border-dark">
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
              href="#contact"
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