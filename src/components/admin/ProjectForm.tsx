"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/types/api';
import { fetchApi } from '@/lib/api';

// 1. Esquema de validación estricto según tu API
const projectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  thumbnail: z.string().url('Debe ser una URL válida (ej. https://...)'),
  shortDescription: z.string().min(10, 'Mínimo 10 caracteres para el resumen'),
  longDescription: z.string().min(20, 'Mínimo 20 caracteres para la descripción detallada'),
  tags: z.string().optional(),
  gallery: z.string().optional(),
  repoLink: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  demoLink: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  token: string;
}

export const ProjectForm = ({ initialData, token }: ProjectFormProps) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-poblamos el formulario si estamos en modo "Editar"
  const defaultValues: Partial<ProjectFormValues> = {
    title: initialData?.title || '',
    thumbnail: initialData?.thumbnail || '',
    shortDescription: initialData?.shortDescription || '',
    longDescription: initialData?.longDescription || '',
    // Convertimos los arrays de la API a strings separados por comas para el input
    tags: initialData?.tags?.join(', ') || '',
    gallery: initialData?.gallery?.join(', ') || '',
    repoLink: initialData?.repoLink || '',
    demoLink: initialData?.demoLink || '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProjectFormValues) => {
    setErrorMessage('');

    // Transformamos los strings separados por comas de vuelta a arrays limpios
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      gallery: data.gallery ? data.gallery.split(',').map(g => g.trim()).filter(Boolean) : [],
      // Si enviaron un string vacío en los links, lo pasamos como undefined para la API
      repoLink: data.repoLink || undefined,
      demoLink: data.demoLink || undefined,
    };

    try {
      if (initialData?.id) {
        // MODO EDICIÓN
        await fetchApi(`/projects/${initialData.id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(processedData),
        });
      } else {
        // MODO CREACIÓN
        await fetchApi('/projects', {
          method: 'POST',
          token,
          body: JSON.stringify(processedData),
        });
      }

      // Si todo sale bien, volvemos a la tabla de proyectos y refrescamos
      router.push('/admin/projects');
      router.refresh();
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error al guardar el proyecto.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {initialData ? 'Actualiza los detalles de tu trabajo.' : 'Completa los datos para publicar un nuevo trabajo.'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <Input label="Título del Proyecto *" placeholder="Ej. E-commerce Minimalista" {...register('title')} error={errors.title?.message} />
            </div>

            <div className="md:col-span-2">
              <Input label="URL de la Imagen Principal (Thumbnail) *" placeholder="https://..." {...register('thumbnail')} error={errors.thumbnail?.message} />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary block">Descripción Corta *</label>
              <textarea 
                className={`w-full bg-transparent border-0 border-b-2 py-2 focus:ring-0 transition-colors font-medium resize-none outline-none ${errors.shortDescription ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-primary'}`}
                placeholder="Breve resumen para la tarjeta..." rows={2} {...register('shortDescription')}
              />
              {errors.shortDescription && <p className="text-xs font-semibold text-red-500">{errors.shortDescription.message}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary block">Descripción Detallada *</label>
              <textarea 
                className={`w-full bg-transparent border-0 border-b-2 py-2 focus:ring-0 transition-colors font-medium resize-none outline-none ${errors.longDescription ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-primary'}`}
                placeholder="Explica el proceso, el problema resuelto, etc..." rows={6} {...register('longDescription')}
              />
              {errors.longDescription && <p className="text-xs font-semibold text-red-500">{errors.longDescription.message}</p>}
            </div>

            <Input label="Tags (separados por coma)" placeholder="React, Node.js, UI/UX" {...register('tags')} error={errors.tags?.message} />
            
            <Input label="URLs de Galería (separadas por coma)" placeholder="https://img1.jpg, https://img2.jpg" {...register('gallery')} error={errors.gallery?.message} />

            <Input label="Link del Repositorio (Opcional)" placeholder="https://github.com/..." {...register('repoLink')} error={errors.repoLink?.message} />
            
            <Input label="Link de Demo / En Vivo (Opcional)" placeholder="https://..." {...register('demoLink')} error={errors.demoLink?.message} />
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" size="lg" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
              {initialData ? 'Guardar Cambios' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};