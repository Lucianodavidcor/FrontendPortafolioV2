import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Language, TranslationStats } from '@/types/api';
import { LanguagesClient } from '@/components/admin/LanguagesClient';

export default async function LanguagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  // Cargar idiomas y stats en paralelo
  const [languagesRes, statsRes] = await Promise.all([
    fetchApi<ApiResponse<Language[]>>('/languages', {
      token: session.user.token,
    }).catch(() => null),
    fetchApi<ApiResponse<TranslationStats[]>>('/languages/stats', {
      token: session.user.token,
    }).catch(() => null),
  ]);

  const initialLanguages = languagesRes?.data ?? [];
  const initialStats     = statsRes?.data     ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <LanguagesClient
        initialLanguages={initialLanguages}
        initialStats={initialStats}
        token={session.user.token}
      />
    </div>
  );
}