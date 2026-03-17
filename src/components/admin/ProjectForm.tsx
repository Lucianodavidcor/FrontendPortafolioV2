"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { 
  Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, 
  Github, Globe, Info, Code, Eye, Edit2, ChevronRight, Terminal, CheckCircle2 
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
            SYSTEM <ChevronRight size={10} /> PROJECT_ENV <ChevronRight size={10} /> <span className="text-primary">WRITE</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Project Details</h2>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/projects">
            <button className="px-5 py-2 rounded border border-border-dark font-bold text-[10px] uppercase tracking-widest hover:bg-surface-dark transition-all text-slate-400">
              [ CANCEL ]
            </button>
          </Link>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            isLoading={isSubmitting} 
            className="rounded bg-primary px-8 py-2 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            SAVE_CHANGES
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Inputs Base */}
          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-6">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
              <Info size={14} /> Base Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Internal Title</label>
                <input {...register('title')} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-sm focus:border-primary outline-none transition-all text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Executive Summary</label>
                <textarea {...register('shortDescription')} className="w-full bg-background-dark border border-border-dark rounded px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-y min-h-[80px] text-slate-300" />
              </div>
            </div>
          </section>

          {/* Editor Markdown Profesional */}
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
          </section>
        </div>

        {/* Sidebar Lateral */}
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
            <Input label="Source URL" {...register('thumbnail')} error={errors.thumbnail?.message} className="bg-background-dark border-border-dark rounded" />
          </section>

          <section className="bg-surface-dark p-6 rounded-lg border border-border-dark space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Endpoints & Tags</h3>
            <Input label="GitHub" {...register('repoLink')} placeholder="https://github.com/..." />
            <Input label="Production" {...register('demoLink')} placeholder="https://..." />
            <Input label="Stack (CSV)" {...register('tags')} placeholder="Kotlin, Compose, NestJS" />
          </section>
        </div>
      </div>
    </div>
  );
};