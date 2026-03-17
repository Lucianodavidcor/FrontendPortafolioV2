import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ExperienceForm } from '@/components/admin/ExperienceForm';

export default async function NewExperiencePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ExperienceForm token={session.user.token} />
    </div>
  );
}