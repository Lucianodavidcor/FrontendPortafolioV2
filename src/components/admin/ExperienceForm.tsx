"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Experience } from '@/types/api';
import { fetchApi } from '@/lib/api';

// Esquema de validación con Zod corregido (sin .default)
const experienceSchema = z.object({
  company: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  role: z.string().min(2, 'El rol o cargo es obligatorio'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional().nullable(),
  description: z.string().min(10, 'Mínimo 10 caracteres para la descripción'),
  isCurrentJob: z.boolean(), // <-- Corrección aquí
}).refine(data => {
  // Si no es el trabajo actual, la fecha de fin es obligatoria
  if (!data.isCurrentJob && (!data.endDate || data.endDate.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "La fecha de fin es obligatoria si no es tu trabajo actual",
  path: ["endDate"]
}).refine(data => {
  // Validar que la fecha de fin no sea antes que la de inicio
  if (!data.isCurrentJob && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "La fecha de fin no puede ser anterior a la de inicio",
  path: ["endDate"]
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  initialData?: Experience | null;
  token: string;
}

// Helper para formatear fechas de la API (ISO) a formato de input type="date" (YYYY-MM-DD)
const formatDateForInput = (dateString?: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

export const ExperienceForm = ({ initialData, token }: ExperienceFormProps) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const defaultValues: Partial<ExperienceFormValues> = {
    company: initialData?.company || '',
    role: initialData?.role || '',
    startDate: formatDateForInput(initialData?.startDate),
    endDate: formatDateForInput(initialData?.endDate),
    description: initialData?.description || '',
    isCurrentJob: initialData ? !initialData.endDate : false,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues,
  });

  const isCurrentJob = watch('isCurrentJob');

  // Si marcan "Trabajo actual", limpiamos la fecha de fin y sus errores
  useEffect(() => {
    if (isCurrentJob) {
      setValue('endDate', '');
      clearErrors('endDate');
    }
  }, [isCurrentJob, setValue, clearErrors]);

  const onSubmit = async (data: ExperienceFormValues) => {
    setErrorMessage('');

    const payload = {
      company: data.company,
      role: data.role,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.isCurrentJob || !data.endDate ? null : new Date(data.endDate).toISOString(),
      description: data.description,
    };

    try {
      if (initialData?.id) {
        await fetchApi(`/experience/${initialData.id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/experience', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
      }

      router.push('/admin/experience');
      router.refresh();
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error al guardar la experiencia.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/experience" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {initialData ? 'Editar Experiencia' : 'Nueva Experiencia'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {initialData ? 'Actualiza los datos de tu puesto.' : 'Añade un nuevo puesto a tu trayectoria.'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Empresa *" 
              placeholder="Ej. Google, Freelance..." 
              {...register('company')} 
              error={errors.company?.message} 
            />
            
            <Input 
              label="Rol / Cargo *" 
              placeholder="Ej. Senior Frontend Developer" 
              {...register('role')} 
              error={errors.role?.message} 
            />

            <Input 
              label="Fecha de Inicio *" 
              type="date" 
              {...register('startDate')} 
              error={errors.startDate?.message} 
            />

            <div className="space-y-2">
              <Input 
                label="Fecha de Fin" 
                type="date" 
                disabled={isCurrentJob}
                {...register('endDate')} 
                error={errors.endDate?.message} 
              />
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                  {...register('isCurrentJob')}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Este es mi trabajo actual</span>
              </label>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary block">Descripción de responsabilidades *</label>
              <textarea 
                className={`w-full bg-transparent border-0 border-b-2 py-2 focus:ring-0 transition-colors font-medium resize-none outline-none ${errors.description ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-primary'}`}
                placeholder="Describe tus logros, tecnologías usadas y responsabilidades..." 
                rows={5} 
                {...register('description')}
              />
              {errors.description && <p className="text-xs font-semibold text-red-500">{errors.description.message}</p>}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" size="lg" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
              {initialData ? 'Guardar Cambios' : 'Añadir Experiencia'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};