import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { PaginatedApiResponse, Project } from '@/types/api';
import { ProjectsClient } from '@/components/admin/ProjectsClient';

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  let initialData: PaginatedApiResponse<Project[]> | null = null;
  
  try {
    // Pedimos un límite alto por ahora para ver la lista (luego puedes agregar paginación real si la requieres)
    initialData = await fetchApi<PaginatedApiResponse<Project[]>>('/projects?page=1&limit=20', {
      token: session.user.token
    });
  } catch (error) {
    console.error("Error fetching admin projects:", error);
  }

  return (
    <div className="animate-in fade-in duration-500">
      <ProjectsClient 
        initialProjects={initialData?.data || []}
        meta={initialData?.meta}
        token={session.user.token}
      />
    </div>
  );
}