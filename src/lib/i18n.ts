import { cookies, headers } from 'next/headers';
import { Language } from '@/types/api';

// ── Detectar el mejor idioma para el usuario ──────────────────────────────
// Prioridad: 1) cookie NEXT_LOCALE  2) Accept-Language header  3) default DB

export async function detectLanguage(activeLanguages: Language[]): Promise<string> {
  if (activeLanguages.length === 0) return 'es';

  // 1. Cookie
  const cookieStore = await cookies();
  const cookieLang  = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLang && activeLanguages.some(l => l.code === cookieLang && l.isActive)) {
    return cookieLang;
  }

  // 2. Accept-Language header  (ej: "en-US,en;q=0.9,es;q=0.8")
  const headersList  = await headers();
  const acceptLang   = headersList.get('accept-language') ?? '';
  const langCodes    = acceptLang
    .split(',')
    .map(part => part.split(';')[0].trim().toLowerCase().slice(0, 2));

  for (const code of langCodes) {
    const match = activeLanguages.find(l => l.code === code && l.isActive);
    if (match) return match.code;
  }

  // 3. Idioma marcado como default en la DB
  const defaultLang = activeLanguages.find(l => l.isDefault);
  return defaultLang?.code ?? 'es';
}

// ── Aplicar traducciones sobre una entidad ────────────────────────────────
// Si no hay traducciones, devuelve la entidad original sin modificar

export function applyTranslations<T extends object>(
  entity: T,
  translations: Record<string, string> | undefined
): T {
  if (!translations || Object.keys(translations).length === 0) return entity;
  return { ...entity, ...translations } as T;
}

// ── Aplicar traducciones a un array de entidades ──────────────────────────

export function applyTranslationsToArray<T extends { id: string }>(
  entities: T[],
  translationsMap: Record<string, Record<string, string>> | undefined
): T[] {
  if (!translationsMap) return entities;
  return entities.map(entity => applyTranslations(entity, translationsMap[entity.id]));
}