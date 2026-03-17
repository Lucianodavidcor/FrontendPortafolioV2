"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, UserCircle, Plus, Trash2, Globe } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/api';

// SOLUCIÓN: Exportamos la interfaz Bio con los campos exactos del backend
export interface Bio {
  name: string;
  title: string;
  shortBio: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'La plataforma es requerida'),
  url: z.string().url('Debe ser una URL válida'),
});

const bioSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  title: z.string().min(2, 'El título es muy corto'),
  shortBio: z.string().min(10, 'La biografía debe tener al menos 10 caracteres'),
  socialLinks: z.array(socialLinkSchema).optional(),
});

type BioFormValues = z.infer<typeof bioSchema>;

interface BioFormProps {
  initialData?: Bio | null;
  token: string;
}

export const BioForm = ({ initialData, token }: BioFormProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BioFormValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      shortBio: initialData?.shortBio || '',
      socialLinks: initialData?.socialLinks || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const onSubmit = async (data: BioFormValues) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await fetchApi('/profile', {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      });

      setSuccessMessage('Perfil actualizado correctamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al actualizar el perfil.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/50">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <UserCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Información del Perfil</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Datos principales y redes sociales.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nombre completo *" 
            placeholder="Tu nombre" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Título profesional *" 
            placeholder="Ej. Fullstack Developer" 
            {...register('title')} 
            error={errors.title?.message} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary block">Biografía corta *</label>
          <textarea 
            className={`w-full bg-transparent border-0 border-b-2 py-2 focus:ring-0 transition-colors font-medium resize-none outline-none ${errors.shortBio ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-primary'}`}
            placeholder="Cuéntale al mundo quién eres..." 
            rows={3} 
            {...register('shortBio')}
          />
          {errors.shortBio && <p className="text-xs font-semibold text-red-500">{errors.shortBio.message}</p>}
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" /> Redes Sociales
            </label>
            <button
              type="button"
              onClick={() => append({ platform: '', url: '' })}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar link
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex-1 w-full">
                  <Input 
                    label="Plataforma" 
                    placeholder="GitHub, LinkedIn..." 
                    {...register(`socialLinks.${index}.platform` as const)} 
                    error={errors.socialLinks?.[index]?.platform?.message}
                  />
                </div>
                <div className="flex-[2] w-full">
                  <Input 
                    label="URL" 
                    placeholder="https://..." 
                    {...register(`socialLinks.${index}.url` as const)} 
                    error={errors.socialLinks?.[index]?.url?.message}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button type="submit" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
            Guardar Perfil
          </Button>
        </div>
      </form>
    </div>
  );
};