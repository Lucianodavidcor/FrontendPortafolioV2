import React from 'react';
import { Loader2 } from 'lucide-react';

// Es vital que diga "export default function"
export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="animate-pulse font-medium text-slate-500">
        Cargando panel...
      </p>
    </div>
  );
}