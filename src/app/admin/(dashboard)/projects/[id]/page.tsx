import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Project } from '@/types/api';
import { ProjectForm } from '@/components/admin/ProjectForm';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  let project: Project | null = null;

  try {
    const res = await fetchApi<ApiResponse<Project>>(`/projects/${id}`, {
      token: session.user.token
    });
    project = res.data;
  } catch (error) {
    notFound();
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProjectForm initialData={project} token={session.user.token} />
    </div>
  );
}