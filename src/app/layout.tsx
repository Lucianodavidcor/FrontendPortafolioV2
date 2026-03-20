import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies, headers } from 'next/headers';
import './globals.css';

import { fetchApi } from '@/lib/api';
import { detectLanguage } from '@/lib/i18n';
import { LanguageProvider } from '@/context/LanguageContext';
import { Language, ApiResponse } from '@/types/api';

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'Software Developer | Luciano Cortez',
  description: 'Desarrollador de software con talento para crear soluciones elegantes en diferentes plataformas.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Obtener idiomas activos
  let activeLanguages: Language[] = [];
  try {
    const res       = await fetchApi<ApiResponse<Language[]>>('/languages?active=true');
    activeLanguages = res.data ?? [];
  } catch {
    // Si la API falla, continuar sin i18n
  }

  // Detectar idioma actual
  const currentLang = await detectLanguage(activeLanguages);

  return (
    <html lang={currentLang} className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} font-display antialiased selection:bg-primary selection:text-white flex min-h-screen w-full flex-col overflow-x-hidden`}
      >
        <LanguageProvider currentLang={currentLang} languages={activeLanguages}>
          {children}
        </LanguageProvider>
      </body>

      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}