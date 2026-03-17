"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from 'lucide-react';

interface ProjectGalleryClientProps {
  images: string[];
}

export const ProjectGalleryClient = ({ images }: ProjectGalleryClientProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Navegación
  const nextImage = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length]);

  const prevImage = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  const closeLightbox = () => setSelectedIndex(null);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, nextImage, prevImage]);

  if (!images || images.length === 0) return null;

  return (
    <section className="border-t border-border-dark bg-surface-dark/10 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-white mb-2">
              Visual <span className="text-primary">Assets</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              High-resolution interface captures
            </p>
          </div>
          <div className="hidden md:block text-slate-600 text-[10px] font-mono">
            TOTAL_FILES: {images.length.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Grid de Galería */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-video cursor-pointer overflow-hidden border border-border-dark bg-background-dark rounded-lg transition-all hover:border-primary/50"
            >
              <img 
                src={img} 
                alt={`Captura ${idx + 1}`} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                loading="lazy"
              />
              {/* Overlay de Hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl scale-75 group-hover:scale-100 transition-transform">
                  <Maximize2 size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Visor Pro */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background-dark/95 backdrop-blur-md animate-in fade-in duration-300">
          {/* Botón Cerrar */}
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-110 p-3 text-slate-400 hover:text-white transition-colors"
          >
            <X size={32} strokeWidth={1.5} />
          </button>

          {/* Navegación */}
          <button 
            onClick={prevImage}
            className="absolute left-4 z-110 p-4 text-slate-400 hover:text-primary transition-all hover:scale-110"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-4 z-110 p-4 text-slate-400 hover:text-primary transition-all hover:scale-110"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>

          {/* Imagen Principal */}
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg border border-border-dark shadow-2xl animate-in zoom-in-95 duration-300">
            <img 
              src={images[selectedIndex]} 
              className="h-full w-full object-contain"
              alt="Preview full"
            />
            {/* Contador Inferior */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-[10px] font-mono text-white backdrop-blur-md border border-white/10">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};