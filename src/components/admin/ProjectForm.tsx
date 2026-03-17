"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { 
  Save, ArrowLeft, Image as ImageIcon,
  Code, ChevronRight, Terminal
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/types/api';
import { fetchApi } from '@/lib/api';

const projectSchema = z.object({
  title: z.string().min(3, 'Requerido'),
  thumbnail: z.string().url('URL inválida'),
  shortDescription: z.string().min(10, 'Muy corto'),
  longDescription: z.string().min(20, 'Markdown requerido'),
  tags: z.string().optional(),
  gallery: z.string().optional(),
  repoLink: z.string().url('URL inválida').optional().or(z.literal('')),
  demoLink: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export const ProjectForm = ({ initialData, token }: { initialData?: Project | null; token: string }) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      thumbnail: initialData?.thumbnail || '',
      shortDescription: initialData?.shortDescription || '',
      longDescription: initialData?.longDescription || '',
      tags: initialData?.tags?.join(', ') || '',
      gallery: initialData?.gallery?.join(', ') || '',
      repoLink: initialData?.repoLink || '',
      demoLink: initialData?.demoLink || '',
    },
  });

  const thumbnailURL = watch('thumbnail');
  const longDescriptionContent = watch('longDescription');

  const onSubmit = async (data: ProjectFormValues) => {
    setErrorMessage('');
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      gallery: data.gallery ? data.gallery.split(',').map(g => g.trim()).filter(Boolean) : [],
      repoLink: data.repoLink || undefined,
      demoLink: data.demoLink || undefined,
    };

    try {
      await fetchApi(initialData?.id ? `/projects/${initialData.id}` : '/projects', {
        method: initialData?.id ? 'PUT' : 'POST',
        token,
        body: JSON.stringify(processedData),
      });
      router.push('/admin/projects');
      router.refresh();
    } catch (error: any) {
      setErrorMessage(error.message || 'Error de sistema.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-display">
      {/* Header Estilo Consola */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
            SYSTEM <ChevronRight size={10} /> PROJECT_ENV <ChevronRight size={10} /> <span className="text-primary">{initialData ? 'EDIT' : 'WRITE'}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">
            {initialData ? 'Edit Project' : 'New Project'}
          </h2>
        </div>

        <div className="flex gap-3">
          {/* Botón Cancelar — Link directo, sin submit */}
          <Link href="/admin/projects">
            <button
              type="button"
              className="px-5 py-2 rounded border border-border-dark font-bold text-[10px] uppercase tracking-widest hover:bg-surface-dark transition-all text-slate-400"
            >
              [ CANCEL ]
            </button>
          </Link>

          {/* Botón Guardar — dispara el submit del form */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded bg-primary px-8 py-2 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              'SAVE_CHANGES'
            )}
          </button>
        </div>
      </div>

      {/* Error global */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Inputs Base */}
          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-6">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
              Base Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Internal Title</label>
                <input
                  {...register('title')}
                  className={`w-full bg-background-dark border rounded px-4 py-3 text-sm outline-none transition-all text-white ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-border-dark focus:border-primary'}`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Executive Summary</label>
                <textarea
                  {...register('shortDescription')}
                  className={`w-full bg-background-dark border rounded px-4 py-3 text-sm outline-none transition-all resize-y min-h-[80px] text-slate-300 ${errors.shortDescription ? 'border-red-500' : 'border-border-dark focus:border-primary'}`}
                />
                {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription.message}</p>}
              </div>
            </div>
          </section>

          {/* Editor Markdown */}
          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
                <Code size={14} /> Technical Documentation (.md)
              </h3>
              <div className="flex bg-background-dark p-1 rounded border border-border-dark">
                <button type="button" onClick={() => setPreviewMode(false)} className={`px-4 py-1 text-[9px] font-bold rounded ${!previewMode ? 'bg-surface-dark text-primary' : 'text-slate-500'}`}>EDITOR</button>
                <button type="button" onClick={() => setPreviewMode(true)} className={`px-4 py-1 text-[9px] font-bold rounded ${previewMode ? 'bg-surface-dark text-primary' : 'text-slate-500'}`}>PREVIEW</button>
              </div>
            </div>

            <div className="border border-border-dark rounded overflow-hidden bg-background-dark">
              {!previewMode ? (
                <textarea
                  {...register('longDescription')}
                  className="w-full p-6 text-sm font-mono focus:ring-0 outline-none border-none bg-transparent resize-y min-h-[400px] text-slate-300 leading-relaxed"
                  placeholder="# Enter Markdown..."
                />
              ) : (
                <div className="p-8 prose prose-invert prose-blue max-w-none min-h-[400px] bg-background-dark">
                  <ReactMarkdown>{longDescriptionContent || '_No data to render_'}</ReactMarkdown>
                </div>
              )}
            </div>
            {errors.longDescription && <p className="text-xs text-red-500">{errors.longDescription.message}</p>}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-5">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
              <ImageIcon size={14} /> Resource Preview
            </h3>
            <div className="aspect-video w-full rounded border border-border-dark overflow-hidden bg-background-dark flex items-center justify-center">
              {thumbnailURL?.startsWith('http') ? (
                <img src={thumbnailURL} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <Terminal size={24} className="text-slate-700" />
              )}
            </div>
            <Input label="Source URL" {...register('thumbnail')} error={errors.thumbnail?.message} />
          </section>

          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Endpoints & Tags</h3>
            <Input label="GitHub" {...register('repoLink')} placeholder="https://github.com/..." error={errors.repoLink?.message} />
            <Input label="Production" {...register('demoLink')} placeholder="https://..." error={errors.demoLink?.message} />
            <Input label="Stack (CSV)" {...register('tags')} placeholder="Kotlin, Compose, NestJS" />
            <Input label="Gallery URLs (CSV)" {...register('gallery')} placeholder="https://img1.com, https://img2.com" />
          </section>
        </div>
      </div>
    </div>
  );
};