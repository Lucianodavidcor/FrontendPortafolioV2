"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/api';

// 1. Definimos el esquema de validación con Zod
const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  message: z.string().min(10, 'El mensaje es muy corto (mínimo 10 caracteres)'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactSection = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await fetchApi('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      setSubmitStatus('success');
      reset(); // Limpiamos el formulario
      
      // Ocultamos el mensaje de éxito después de 5 segundos
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error: any) {
      setSubmitStatus('error');
      // Manejamos específicamente el error 429 de tu backend o errores generales
      if (error.message.includes('429')) {
        setErrorMessage('Has enviado demasiados mensajes. Por favor, intenta más tarde.');
      } else {
        setErrorMessage(error.message || 'Ocurrió un error al enviar el mensaje.');
      }
    }
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase">¿TIENES UN PROYECTO?</h2>
        <p className="text-xl text-slate-500 dark:text-slate-400">Hagamos realidad algo que la gente realmente use.</p>
      </div>

      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-primary/10 relative overflow-hidden">
        
        {/* Mensaje de Éxito Flotante */}
        {submitStatus === 'success' && (
          <div className="absolute top-0 left-0 w-full bg-green-500 text-white text-center py-3 font-bold text-sm animate-in slide-in-from-top z-10">
            ¡Mensaje enviado con éxito! Te responderé pronto.
          </div>
        )}

        {/* Mensaje de Error Flotante */}
        {submitStatus === 'error' && (
          <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center py-3 font-bold text-sm animate-in slide-in-from-top z-10">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <Input 
            label="Tu Nombre" 
            placeholder="Juan Pérez" 
            {...register('name')}
            error={errors.name?.message}
          />
          
          <Input 
            label="Correo Electrónico" 
            type="email" 
            placeholder="juan@compania.com" 
            {...register('email')}
            error={errors.email?.message}
          />
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary block">
              Cuéntame sobre el proyecto
            </label>
            <textarea 
              className={`w-full bg-transparent border-0 border-b-2 py-4 focus:ring-0 transition-colors font-medium resize-none outline-none ${
                errors.message 
                  ? 'border-red-500 focus:border-red-500 text-red-500' 
                  : 'border-slate-300 dark:border-slate-700 focus:border-primary'
              }`}
              placeholder="Estoy buscando..." 
              rows={4}
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs font-semibold text-red-500 mt-1">{errors.message.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2 pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-xl" 
              isLoading={isSubmitting}
              icon={<Send className="w-5 h-5" />}
            >
              ENVIAR MENSAJE
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};