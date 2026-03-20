"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageSwitcher = () => {
  const { currentLang, languages, isPending, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Solo mostrar si hay más de un idioma activo
  const activeLanguages = languages.filter(l => l.isActive);
  if (activeLanguages.length <= 1) return null;

  const current = activeLanguages.find(l => l.code === currentLang) ?? activeLanguages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-dark bg-surface-dark/60 text-slate-300 hover:text-white hover:border-primary/40 transition-all text-sm font-bold disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <span className="text-base leading-none">{current.flag}</span>
        )}
        <span className="font-mono text-xs uppercase">{current.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-surface-dark border border-border-dark rounded-xl shadow-2xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {activeLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={async () => {
                setOpen(false);
                await setLanguage(lang.code);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                ${lang.code === currentLang
                  ? 'bg-primary/15 text-white font-bold'
                  : 'text-slate-400 hover:bg-primary/10 hover:text-white'
                }`}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <div className="text-left">
                <p className="font-semibold leading-none">{lang.name}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">{lang.code}</p>
              </div>
              {lang.code === currentLang && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};