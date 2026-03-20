"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, Copy, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  message: z.string()
    .min(10, 'El mensaje es muy corto (mínimo 10 caracteres)')
    .max(1000, 'El mensaje es muy largo (máximo 1000 caracteres)'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactSection = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const rawEmail = 'lucianocortez2003@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(rawEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const messageValue = watch('message') || '';

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
    <section id="contact" className="py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto relative">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Título Principal */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-6 uppercase text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400">
          ¿Tienes un proyecto?
        </h2>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Hagamos realidad algo que la gente realmente use. Cuéntame sobre tu idea y veamos cómo podemos trabajar juntos.
        </p>
      </div>

      {/* Main Card */}
      <div className="relative z-10 mx-auto max-w-6xl rounded-[2.5rem] p-[1px] bg-gradient-to-br from-white/10 via-primary/10 to-transparent overflow-hidden shadow-2xl shadow-black/40">
        <div className="bg-surface-dark/80 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 lg:p-16 relative">
          
          {/* Notifications Toast */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
            {submitStatus === 'success' && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl shadow-green-500/5 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-sm tracking-wide">¡Mensaje enviado con éxito! Te responderé pronto.</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 shadow-xl shadow-red-500/5 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-sm tracking-wide">{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-20">
            
            {/* Columna Izquierda: Info */}
            <div className="lg:col-span-2 space-y-8 md:space-y-10">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Envía un mensaje
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  Ya sea para el desarrollo de un proyecto puntual como <strong>freelance</strong>, 
                  un <strong>contrato de dedicación o exclusividad</strong> con tu empresa, 
                  o simplemente para saludar, mi bandeja de entrada está abierta.
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t border-border-dark/50">
                <div className="group">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contacto Directo</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleCopyEmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-dark/50 border border-border-dark text-sm font-bold text-slate-300 hover:text-white hover:border-primary/40 transition-all"
                      title="Copiar email al portapapeles"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? '¡Copiado!' : 'Copiar Email'}
                    </button>
                    <a 
                      href={`mailto:${rawEmail}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                      title="Abrir aplicación de correo"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar Correo
                    </a>
                  </div>
                </div>
                <div className="group">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Disponibilidad</p>
                  <p className="text-lg font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    Disponible Contactame
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 mt-6 lg:mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="group">
                    <Input 
                      label="Tu Nombre" 
                      placeholder="Ej. Juan Pérez" 
                      {...register('name')}
                      error={errors.name?.message}
                      className="group-hover:border-slate-500 transition-colors bg-transparent px-0 rounded-none shadow-none"
                    />
                  </div>
                  <div className="group">
                    <Input 
                      label="Correo Electrónico" 
                      type="email" 
                      placeholder="juan@ejemplo.com" 
                      {...register('email')}
                      error={errors.email?.message}
                      className="group-hover:border-slate-500 transition-colors bg-transparent px-0 rounded-none shadow-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 group">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary block transition-colors group-focus-within:text-white">
                    Cuéntame sobre el proyecto
                  </label>
                  <div className="relative">
                    <textarea 
                      className={`w-full bg-transparent border-0 border-b-2 py-3 focus:ring-0 transition-all duration-300 font-medium resize-none outline-none peer leading-relaxed ${
                        errors.message 
                          ? 'border-red-500/50 focus:border-red-500 text-red-400' 
                          : 'border-slate-700 focus:border-primary text-slate-200 group-hover:border-slate-500'
                      }`}
                      placeholder="Estoy buscando crear una aplicación que..." 
                      rows={4}
                      maxLength={1000}
                      {...register('message')}
                    />
                    {/* Indicador de foco inferior animado (opcional extra styling) */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 peer-focus:w-full rounded-full" />
                  </div>
                  
                  {/* Fila de error + contador de caracteres */}
                  <div className="flex items-start justify-between mt-2">
                    <div className="flex-1">
                      {errors.message && (
                        <p className="text-xs font-medium text-red-400 animate-in fade-in slide-in-from-top-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <div 
                      className={`text-xs font-mono font-medium ml-4 transition-colors ${
                        messageValue.length > 900 ? 'text-orange-400' : 'text-slate-500'
                      } ${messageValue.length >= 1000 ? 'text-red-500' : ''}`}
                    >
                      {messageValue.length}/1000
                    </div>
                  </div>
                </div>
                
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto px-10 py-4 h-auto text-sm md:text-base tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl" 
                    isLoading={isSubmitting}
                    icon={<Send className="w-4 h-4 ml-2" />}
                  >
                    ENVIAR MENSAJE
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};