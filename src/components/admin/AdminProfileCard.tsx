"use client";

import React from 'react';
import { User, Mail, ShieldCheck } from 'lucide-react';

interface AdminProfileCardProps {
  data: {
    email: string;
    name: string;
  } | null;
}

export const AdminProfileCard = ({ data }: AdminProfileCardProps) => {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{data.name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Administrador del Sistema
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" /> Correo electrónico
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{data.email}</span>
        </div>
      </div>
    </div>
  );
};