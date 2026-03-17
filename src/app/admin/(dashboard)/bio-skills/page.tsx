import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { BioForm, Bio } from '@/components/admin/BioForm';
import { SkillsManager, Skill } from '@/components/admin/SkillsManager';

export default async function BioSkillsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  let bioData: Bio | null = null;
  let skillsData: Skill[] = [];

  try {
    // CORRECCIÓN: Cambiamos /bio por /profile para el GET inicial
    const [bioRes, skillsRes] = await Promise.all([
      fetchApi<ApiResponse<Bio>>('/profile', { token: session.user.token }).catch(() => null),
      fetchApi<ApiResponse<Skill[]>>('/skills', { token: session.user.token }).catch(() => null)
    ]);

    if (bioRes?.data) bioData = bioRes.data;
    if (skillsRes?.data) skillsData = skillsRes.data;
  } catch (error) {
    console.error("Error fetching profile and skills:", error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bio & Habilidades</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Personaliza tu carta de presentación y las tecnologías que dominas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <BioForm initialData={bioData} token={session.user.token} />
        </div>
        
        <div className="xl:col-span-1 h-full">
          <SkillsManager initialSkills={skillsData} token={session.user.token} />
        </div>
      </div>
    </div>
  );
}