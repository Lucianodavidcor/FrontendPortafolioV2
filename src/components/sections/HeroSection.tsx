"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ArrowRight, DownloadCloud } from 'lucide-react';

interface HeroProps {
  name?: string;
  title?: string;
  shortBio?: string;
  cvUrl?: string;
}

// ── Dot Grid Canvas ─────────────────────────────────────────────────────────
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const gap = 36;           // espacio entre dots
    const dotR = 1.2;         // radio base del dot
    const influence = 140;    // radio de influencia del cursor
    const maxDisplace = 18;   // desplazamiento máximo de un dot
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, W, H);

    const cols = Math.ceil(W / gap) + 1;
    const rows = Math.ceil(H / gap) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * gap;
        const oy = r * gap;

        const dx = ox - mx;
        const dy = oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let x = ox;
        let y = oy;
        let alpha = 0.18;
        let radius = dotR;

        if (dist < influence) {
          const force = (1 - dist / influence);
          // Repulsión suave: el dot se aleja del cursor
          const angle = Math.atan2(dy, dx);
          x = ox + Math.cos(angle) * force * maxDisplace;
          y = oy + Math.sin(angle) * force * maxDisplace;
          // Dots cercanos se iluminan un poco
          alpha = 0.18 + force * 0.45;
          radius = dotR + force * 1.6;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 51, 242, ${alpha})`;
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse global para que funcione aunque el cursor no esté sobre el canvas
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}

// ── Texto animado letra a letra ───────────────────────────────────────────────
function AnimatedName({ text }: { text: string }) {
  return (
    <span className="inline-block">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
          style={{ animationDelay: `${600 + i * 45}ms`, animationDuration: '500ms' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// ── Hero principal ────────────────────────────────────────────────────────────
export function HeroSection({ name, title, shortBio, cvUrl = '/cv.pdf' }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-dark">

      {/* Grilla de puntos reactiva al cursor */}
      <DotGrid />

      {/* Gradiente radial central muy sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(13,51,242,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Línea horizontal decorativa */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none" />

      {/* ── Contenido ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center pt-24 pb-16">

        {/* Badge de disponibilidad */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold tracking-[0.2em] uppercase mb-12 animate-in fade-in slide-in-from-top-2 duration-700"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          Disponible para proyectos
        </div>

        {/* Nombre / headline */}
        <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black tracking-tighter leading-[0.88] uppercase text-white mb-8 select-none">
          {mounted && name ? (
            <>
              <span
                className="block text-slate-500 text-[0.38em] font-bold tracking-[0.4em] uppercase mb-4 animate-in fade-in duration-700"
                style={{ animationDelay: '400ms', animationFillMode: 'both' }}
              >
                Hola, soy
              </span>
              <AnimatedName text={name} />
            </>
          ) : (
            <span className="animate-in fade-in duration-700" style={{ animationFillMode: 'both' }}>
              Portfolio
            </span>
          )}
        </h1>

        {/* Título profesional */}
        {title && (
          <p
            className="text-primary text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-6 animate-in fade-in duration-700"
            style={{ animationDelay: '900ms', animationFillMode: 'both' }}
          >
            {title}
          </p>
        )}

        {/* Bio — corta y limpia */}
        <p
          className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-14 animate-in fade-in duration-700"
          style={{ animationDelay: '1000ms', animationFillMode: 'both' }}
        >
          {shortBio || 'Construyo experiencias digitales que combinan diseño y código con intención.'}
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: '1100ms', animationFillMode: 'both' }}
        >
          <a
            href="#proyectos"
            className="group flex items-center gap-2.5 bg-primary text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:scale-105 active:scale-100 transition-all shadow-xl shadow-primary/25"
          >
            Ver proyectos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href={cvUrl}
            target="_blank"
            rel="noreferrer"
            download={!cvUrl.startsWith('http')}
            className="group flex items-center gap-2.5 border border-border-dark bg-surface-dark/60 text-slate-300 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:border-primary/40 hover:text-white hover:bg-primary/5 transition-all backdrop-blur-sm"
          >
            <DownloadCloud className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            Descargar CV
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-20 flex flex-col items-center gap-2 text-slate-700 animate-in fade-in duration-700"
          style={{ animationDelay: '1400ms', animationFillMode: 'both' }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-border-dark to-transparent animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll</span>
        </div>

      </div>
    </section>
  );
}