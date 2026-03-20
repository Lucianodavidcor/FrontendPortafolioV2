"use client";

import React, { createContext, useContext, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types/api';

interface LanguageContextValue {
  currentLang: string;
  languages:   Language[];
  isPending:   boolean;
  setLanguage: (code: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLang: 'es',
  languages:   [],
  isPending:   false,
  setLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  currentLang: string;
  languages:   Language[];
  children:    React.ReactNode;
}

export const LanguageProvider = ({ currentLang, languages, children }: LanguageProviderProps) => {
  const router               = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLanguage = async (code: string) => {
    if (code === currentLang) return;

    // 1. Setear cookie via API route
    await fetch('/api/language', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ lang: code }),
    });

    // 2. Refrescar server components con el nuevo idioma
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <LanguageContext.Provider value={{ currentLang, languages, isPending, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};