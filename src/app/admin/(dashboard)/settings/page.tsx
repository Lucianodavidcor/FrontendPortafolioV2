import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { AdminProfileCard } from '@/components/admin/AdminProfileCard';
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  let adminInfo = null;

  try {
    const res = await fetchApi<ApiResponse<{email: string, name: string}>>('/auth/me', {
      token: session.user.token
    });
    adminInfo = res.data;
  } catch (error) {
    console.error("Error fetching identity:", error);
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Gestiona la seguridad de tu cuenta y visualiza tu perfil administrativo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AdminProfileCard data={adminInfo} />
        <ChangePasswordForm token={session.user.token} />
      </div>
    </div>
  );
}