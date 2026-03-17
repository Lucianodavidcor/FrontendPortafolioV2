import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Experience } from '@/types/api';
import { ExperienceForm } from '@/components/admin/ExperienceForm';

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  let experience: Experience | null = null;

  try {
    const res = await fetchApi<ApiResponse<Experience>>(`/experience/${id}`, {
      token: session.user.token
    });
    experience = res.data;
  } catch (error) {
    notFound();
  }

  if (!experience) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ExperienceForm initialData={experience} token={session.user.token} />
    </div>
  );
}