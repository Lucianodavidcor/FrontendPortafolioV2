import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Experience } from '@/types/api';
import { ExperienceClient } from '@/components/admin/ExperienceClient';

export default async function AdminExperiencePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  let initialData: Experience[] = [];
  
  try {
    const res = await fetchApi<ApiResponse<Experience[]>>('/experience', {
      token: session.user.token
    });
    initialData = res.data || [];
  } catch (error) {
    console.error("Error fetching experience:", error);
  }

  return (
    <div className="animate-in fade-in duration-500">
      <ExperienceClient 
        initialData={initialData}
        token={session.user.token}
      />
    </div>
  );
}