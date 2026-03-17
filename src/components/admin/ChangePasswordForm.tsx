"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/api';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "La nueva contraseña y la confirmación no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ChangePasswordForm = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setStatus(null);
    try {
      await fetchApi('/auth/change-password', {
        method: 'POST',
        token,
        body: JSON.stringify(data)
      });

      setStatus({ type: 'success', msg: 'Contraseña actualizada exitosamente.' });
      reset(); // Limpiamos el formulario
    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message || 'Error al actualizar la contraseña.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold">Seguridad de la Cuenta</h3>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold animate-in fade-in ${
          status.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="Contraseña Actual *" 
          type="password" 
          placeholder="••••••••" 
          {...register('currentPassword')} 
          error={errors.currentPassword?.message} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nueva Contraseña *" 
            type="password" 
            placeholder="••••••••" 
            {...register('newPassword')} 
            error={errors.newPassword?.message} 
          />
          <Input 
            label="Confirmar Nueva Contraseña *" 
            type="password" 
            placeholder="••••••••" 
            {...register('confirmPassword')} 
            error={errors.confirmPassword?.message} 
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
            Actualizar Contraseña
          </Button>
        </div>
      </form>
    </div>
  );
};