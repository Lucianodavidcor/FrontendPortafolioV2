import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <AdminHeader />
        <div className="p-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}