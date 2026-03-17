import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Stats } from '@/types/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Verificamos la sesión del servidor
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  // 2. Obtenemos la identidad y las estadísticas en paralelo para optimizar la carga
  const [userRes, statsRes] = await Promise.all([
    fetchApi<ApiResponse<{ email: string; name: string }>>('/auth/me', { 
      token: session.user.token 
    }).catch(() => null),
    fetchApi<ApiResponse<Stats>>('/stats', { 
      token: session.user.token 
    }).catch(() => null),
  ]);

  // 3. Extraemos los datos o definimos valores por defecto si la petición falla
  const userData = userRes?.data || { 
    name: 'Administrador', 
    email: session.user.email || '' 
  };
  
  const unreadCount = statsRes?.data?.messages?.unread || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* 4. Pasamos la información real al Sidebar */}
      <AdminSidebar 
        userName={userData.name} 
        userEmail={userData.email} 
        unreadMessages={unreadCount} 
      />
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <AdminHeader />
        <div className="p-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}