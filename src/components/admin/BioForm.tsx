"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Plus, Trash2, Globe, User, Briefcase, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export interface Bio {
  name: string;
  title: string;
  shortBio: string;
  socialLinks?: { platform: string; url: string }[];
}

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Requerido'),
  url: z.string().url('URL inválida'),
});

const bioSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  title: z.string().min(2, 'Mínimo 2 caracteres'),
  shortBio: z.string().min(10, 'Mínimo 10 caracteres'),
  socialLinks: z.array(socialLinkSchema).optional(),
});

type BioFormValues = z.infer<typeof bioSchema>;

interface BioFormProps {
  initialData?: Bio | null;
  token: string;
}

// Plataformas sugeridas con sus colores
const PLATFORM_SUGGESTIONS = [
  { name: 'GitHub',    placeholder: 'https://github.com/usuario' },
  { name: 'LinkedIn',  placeholder: 'https://linkedin.com/in/usuario' },
  { name: 'Twitter',   placeholder: 'https://twitter.com/usuario' },
  { name: 'Instagram', placeholder: 'https://instagram.com/usuario' },
  { name: 'Portfolio', placeholder: 'https://mi-sitio.com' },
];

export const BioForm = ({ initialData, token }: BioFormProps) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BioFormValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      shortBio: initialData?.shortBio || '',
      socialLinks: initialData?.socialLinks || [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'socialLinks' });

  const bioValue = watch('shortBio');
  const BIO_MAX = 300;

  const onSubmit = async (data: BioFormValues) => {
    setStatus('idle');
    setErrorMsg('');
    try {
      await fetchApi('/profile', { method: 'PUT', token, body: JSON.stringify(data) });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Error al actualizar el perfil.');
    }
  };

  return (
    <div className="rounded-2xl border border-border-dark bg-background-dark overflow-hidden">

      {/* ── Header ── */}
      <div className="px-8 py-6 bg-surface-dark/60 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">Perfil Público</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Información del portafolio</p>
          </div>
        </div>

        {/* Indicador de estado */}
        {status === 'success' && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 className="w-4 h-4" />
            Guardado
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            Error
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-border-dark">

        {/* ── Bloque: Identidad ── */}
        <div className="px-8 py-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">01</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">Identidad</span>
            <div className="flex-1 h-px bg-border-dark" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <User className="w-3 h-3" /> Nombre completo
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  placeholder="Tu nombre"
                  className={`w-full bg-surface-dark/40 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none transition-all
                    ${errors.name
                      ? 'border-red-500/50 focus:border-red-500 bg-red-500/5'
                      : 'border-border-dark focus:border-primary focus:bg-primary/5'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <Briefcase className="w-3 h-3" /> Título profesional
              </label>
              <input
                {...register('title')}
                placeholder="Fullstack Developer"
                className={`w-full bg-surface-dark/40 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none transition-all
                  ${errors.title
                    ? 'border-red-500/50 focus:border-red-500 bg-red-500/5'
                    : 'border-border-dark focus:border-primary focus:bg-primary/5'
                  }`}
              />
              {errors.title && (
                <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bloque: Biografía ── */}
        <div className="px-8 py-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">02</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">Presentación</span>
            <div className="flex-1 h-px bg-border-dark" />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <FileText className="w-3 h-3" /> Biografía corta
            </label>
            <div className="relative">
              <textarea
                {...register('shortBio')}
                rows={4}
                maxLength={BIO_MAX}
                placeholder="Cuéntale al mundo quién eres, qué hacés y qué te apasiona…"
                className={`w-full bg-surface-dark/40 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none transition-all resize-none leading-relaxed
                  ${errors.shortBio
                    ? 'border-red-500/50 focus:border-red-500 bg-red-500/5'
                    : 'border-border-dark focus:border-primary focus:bg-primary/5'
                  }`}
              />
              {/* Contador de caracteres */}
              <div className={`absolute bottom-3 right-3 text-[9px] font-mono font-bold transition-colors
                ${(bioValue?.length || 0) > BIO_MAX * 0.9 ? 'text-amber-400' : 'text-slate-700'}`}>
                {bioValue?.length || 0}/{BIO_MAX}
              </div>
            </div>
            {errors.shortBio && (
              <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.shortBio.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Bloque: Redes Sociales ── */}
        <div className="px-8 py-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">03</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">Redes Sociales</span>
              <div className="w-16 h-px bg-border-dark" />
            </div>
            <button
              type="button"
              onClick={() => append({ platform: '', url: '' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3 h-3" /> Agregar link
            </button>
          </div>

          {/* Sugerencias rápidas si no hay links */}
          {fields.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORM_SUGGESTIONS.slice(0, 3).map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => append({ platform: p.name, url: '' })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border-dark text-slate-600 hover:border-primary/30 hover:text-slate-400 hover:bg-primary/5 transition-all text-xs font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Campos de links */}
          {fields.length > 0 && (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group flex gap-3 items-start p-4 rounded-xl bg-surface-dark/40 border border-border-dark hover:border-primary/20 transition-colors"
                >
                  {/* Número */}
                  <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary mt-2.5 shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {/* Plataforma */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        Plataforma
                      </label>
                      <div className="relative">
                        <input
                          {...register(`socialLinks.${index}.platform`)}
                          placeholder="GitHub"
                          list={`platform-suggestions-${index}`}
                          className={`w-full bg-background-dark border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 outline-none transition-all
                            ${errors.socialLinks?.[index]?.platform
                              ? 'border-red-500/50'
                              : 'border-border-dark focus:border-primary'
                            }`}
                        />
                        <datalist id={`platform-suggestions-${index}`}>
                          {PLATFORM_SUGGESTIONS.map(p => (
                            <option key={p.name} value={p.name} />
                          ))}
                        </datalist>
                      </div>
                      {errors.socialLinks?.[index]?.platform && (
                        <p className="text-[9px] text-red-400 font-semibold">
                          {errors.socialLinks[index]?.platform?.message}
                        </p>
                      )}
                    </div>

                    {/* URL */}
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        URL
                      </label>
                      <input
                        {...register(`socialLinks.${index}.url`)}
                        placeholder="https://…"
                        className={`w-full bg-background-dark border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 outline-none transition-all
                          ${errors.socialLinks?.[index]?.url
                            ? 'border-red-500/50'
                            : 'border-border-dark focus:border-primary'
                          }`}
                      />
                      {errors.socialLinks?.[index]?.url && (
                        <p className="text-[9px] text-red-400 font-semibold">
                          {errors.socialLinks[index]?.url?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 mt-5 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer con botón guardar ── */}
        <div className="px-8 py-5 bg-surface-dark/40 flex items-center justify-between gap-4">
          <div className="text-[10px] text-slate-600 font-medium">
            {isDirty
              ? <span className="text-amber-400 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" /> Cambios sin guardar</span>
              : <span className="text-slate-700">Sin cambios pendientes</span>
            }
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100"
          >
            {isSubmitting
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</>
              : <><Save className="w-3.5 h-3.5" /> Guardar perfil</>
            }
          </button>
        </div>

      </form>
    </div>
  );
};