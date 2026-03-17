"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Infinity } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// 1. Esquema de validación para el Login
const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage('');
    
    // 2. Llamamos a NextAuth en lugar de hacer fetch directo
    const result = await signIn('credentials', {
      redirect: false, // Evitamos que NextAuth recargue la página automáticamente
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      // Credenciales inválidas o error en tu API
      setErrorMessage('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } else {
      // Login exitoso: Redirigimos al Dashboard y refrescamos el router para aplicar middlewares
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      {/* Fondo decorativo (coherente con el portafolio) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-primary/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Regreso al inicio */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
            <div className="bg-primary p-2 rounded-xl">
              <Infinity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter uppercase">Portfoli<span className="text-primary italic">Admin</span></span>
          </Link>
        </div>

        {/* Tarjeta de Login */}
        <div className="glass-card p-8 sm:p-10 rounded-4xl border-primary/20 shadow-2xl relative overflow-hidden">
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          {/* Alerta de Error */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold text-center animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="admin@tu-dominio.com" 
              {...register('email')}
              error={errors.email?.message}
            />
            
            <Input 
              label="Contraseña" 
              type="password" 
              placeholder="••••••••" 
              {...register('password')}
              error={errors.password?.message}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isSubmitting}
                icon={<Lock className="w-5 h-5" />}
              >
                INICIAR SESIÓN
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}