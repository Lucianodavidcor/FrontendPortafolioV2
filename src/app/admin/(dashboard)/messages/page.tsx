import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { PaginatedApiResponse, Message } from '@/types/api';
import { MessagesClient } from '@/components/admin/MessagesClient';

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  // Obtenemos los mensajes de la API
  let initialData: PaginatedApiResponse<Message[]> | null = null;
  
  try {
    initialData = await fetchApi<PaginatedApiResponse<Message[]>>('/messages?page=1&limit=10', {
      token: session.user.token
    });
  } catch (error) {
    // Si la API falla, initialData será null, y el componente cliente mostrará la bandeja vacía o un error controlado
    console.error("Error fetching messages:", error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bandeja de Entrada</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Gestiona los mensajes enviados a través de tu formulario de contacto.
        </p>
      </div>

      <MessagesClient 
        initialMessages={initialData?.data || []} 
        meta={initialData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }}
        token={session.user.token}
      />
    </div>
  );
}