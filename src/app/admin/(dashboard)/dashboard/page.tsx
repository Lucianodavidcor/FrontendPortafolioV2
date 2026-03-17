import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchApi } from '@/lib/api';
import { ApiResponse, PaginatedApiResponse, Project, Stats } from '@/types/api';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    redirect('/admin/login');
  }

  const [statsRes, projectsRes] = await Promise.all([
    fetchApi<ApiResponse<Stats>>('/stats', { token: session.user.token }).catch(() => null),
    fetchApi<PaginatedApiResponse<Project[]>>('/projects?page=1&limit=5').catch(() => null),
  ]);

  const stats = statsRes?.data ?? null;
  const recentProjects = projectsRes?.data ?? [];

  return (
    <DashboardClient stats={stats} recentProjects={recentProjects} />
  );
}