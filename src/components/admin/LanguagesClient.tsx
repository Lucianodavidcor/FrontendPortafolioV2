"use client";

import React, { useState } from 'react';
import {
  Globe, Plus, Trash2, RefreshCw, CheckCircle2,
  AlertCircle, Loader2, Star, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Language, TranslationStats, ApiResponse } from '@/types/api';

interface LanguagesClientProps {
  initialLanguages: Language[];
  initialStats:     TranslationStats[];
  token:            string;
}

const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇺🇸' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
  { code: 'zh', name: '中文',        flag: '🇨🇳' },
  { code: 'ja', name: '日本語',      flag: '🇯🇵' },
];

export const LanguagesClient = ({ initialLanguages, initialStats, token }: LanguagesClientProps) => {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [stats, setStats]         = useState<TranslationStats[]>(initialStats);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState('');

  // Form state
  const [code, setCode]   = useState('');
  const [name, setName]   = useState('');
  const [flag, setFlag]   = useState('');

  // Loading states
  const [adding, setAdding]             = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [retranslatingId, setRetranslatingId] = useState<string | null>(null);
  const [togglingId, setTogglingId]     = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const refreshStats = async () => {
    try {
      const res = await fetchApi<ApiResponse<TranslationStats[]>>('/languages/stats', { token });
      setStats(res.data);
    } catch { /* silencioso */ }
  };

  const getStats = (langId: string) => stats.find(s => s.languageId === langId);

  const fillQuickAdd = (preset: typeof POPULAR_LANGUAGES[0]) => {
    setCode(preset.code);
    setName(preset.name);
    setFlag(preset.flag);
    setShowForm(true);
  };

  // ── Acciones ─────────────────────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !name.trim() || !flag.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setAdding(true);
    try {
      const res = await fetchApi<ApiResponse<Language>>('/languages', {
        method: 'POST',
        token,
        body:   JSON.stringify({ code: code.trim().toLowerCase(), name: name.trim(), flag: flag.trim() }),
      });
      setLanguages(prev => [...prev, res.data]);
      setCode(''); setName(''); setFlag('');
      setShowForm(false);
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error al agregar el idioma.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, langName: string) => {
    if (!window.confirm(`¿Eliminar "${langName}" y todas sus traducciones?`)) return;
    setDeletingId(id);
    try {
      await fetchApi(`/languages/${id}`, { method: 'DELETE', token });
      setLanguages(prev => prev.filter(l => l.id !== id));
      setStats(prev => prev.filter(s => s.languageId !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (lang: Language) => {
    setTogglingId(lang.id);
    try {
      const res = await fetchApi<ApiResponse<Language>>(`/languages/${lang.id}`, {
        method: 'PUT',
        token,
        body:   JSON.stringify({ isActive: !lang.isActive }),
      });
      setLanguages(prev => prev.map(l => l.id === lang.id ? res.data : l));
    } catch (err: any) {
      alert(err.message || 'Error al actualizar.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRetranslate = async (lang: Language) => {
    if (!window.confirm(`¿Re-traducir TODO el contenido al ${lang.name}? Esto puede tardar varios minutos.`)) return;
    setRetranslatingId(lang.id);
    try {
      await fetchApi(`/languages/${lang.id}/retranslate`, { method: 'POST', token });
      // 202 Accepted — el proceso corre en background
      alert(`Re-traducción de "${lang.name}" iniciada en background. Revisá las estadísticas en unos minutos.`);
    } catch (err: any) {
      alert(err.message || 'Error al iniciar la re-traducción.');
    } finally {
      setRetranslatingId(null);
      setTimeout(refreshStats, 3000); // refresca stats luego de unos segundos
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const nonDefaultLanguages = languages.filter(l => !l.isDefault);
  const defaultLang         = languages.find(l => l.isDefault);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Idiomas</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestioná los idiomas disponibles. La IA traduce automáticamente todo el contenido.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
            ${showForm
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-primary text-white border-transparent hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancelar' : 'Nuevo idioma'}
        </button>
      </div>

      {/* ── Formulario ── */}
      <div className={`overflow-hidden transition-all duration-300 ${showForm ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm space-y-5">

          {/* Idiomas populares rápidos */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Agregar rápido</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_LANGUAGES.filter(p => !languages.some(l => l.code === p.code)).map(preset => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => fillQuickAdd(preset)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border-dark text-slate-500 hover:border-primary/40 hover:text-slate-300 hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  <span>{preset.flag}</span> {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Flag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Bandera (emoji) *
              </label>
              <input
                value={flag}
                onChange={e => setFlag(e.target.value)}
                placeholder="🇺🇸"
                className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-primary py-2 text-2xl outline-none transition-colors"
              />
            </div>
            {/* Código */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Código *
              </label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="en"
                maxLength={10}
                className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-primary py-2 outline-none font-mono transition-colors"
              />
            </div>
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Nombre *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="English"
                className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-primary py-2 outline-none transition-colors"
              />
            </div>
            {/* Submit */}
            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'Guardando…' : 'Agregar'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Idioma por defecto ── */}
      {defaultLang && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Idioma por defecto</p>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <span className="text-3xl">{defaultLang.flag}</span>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">{defaultLang.name}</p>
              <p className="text-xs font-mono text-slate-500">{defaultLang.code}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
              <Star className="w-3 h-3" /> Default
            </div>
            <p className="text-xs text-slate-400">El contenido original está en este idioma.</p>
          </div>
        </div>
      )}

      {/* ── Lista de idiomas adicionales ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Idiomas adicionales ({nonDefaultLanguages.length})
          </p>
          <button
            onClick={refreshStats}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Actualizar stats
          </button>
        </div>

        {nonDefaultLanguages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Globe className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No hay idiomas adicionales.</p>
            <p className="text-xs text-slate-400 mt-1">Agregá uno para que la IA traduzca tu contenido automáticamente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {nonDefaultLanguages.map(lang => {
              const s = getStats(lang.id);
              const pct = s?.percentage ?? 0;

              return (
                <div key={lang.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">

                  {/* Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-3xl shrink-0">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white">{lang.name}</p>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500">
                          {lang.code}
                        </span>
                        {!lang.isActive && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                            Inactivo
                          </span>
                        )}
                      </div>

                      {/* Barra de progreso */}
                      {s ? (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{s.translated} / {s.total} campos traducidos</span>
                            <span className="font-bold">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct === 100 ? 'bg-green-500' : pct > 50 ? 'bg-primary' : 'bg-amber-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Sin traducciones aún</p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">

                    {/* Toggle activo/inactivo */}
                    <button
                      onClick={() => handleToggleActive(lang)}
                      disabled={togglingId === lang.id}
                      title={lang.isActive ? 'Desactivar' : 'Activar'}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {togglingId === lang.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : lang.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5" />
                      }
                    </button>

                    {/* Re-traducir */}
                    <button
                      onClick={() => handleRetranslate(lang)}
                      disabled={retranslatingId === lang.id || !lang.isActive}
                      title="Re-traducir todo el contenido"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary border border-primary/20 hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {retranslatingId === lang.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <RefreshCw className="w-4 h-4" />
                      }
                      Re-traducir todo
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => handleDelete(lang.id, lang.name)}
                      disabled={deletingId === lang.id}
                      title="Eliminar idioma y traducciones"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deletingId === lang.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cómo funciona ── */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">¿Cómo funciona la traducción automática?</p>
        </div>
        <ul className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 ml-6">
          <li>Cada vez que creás o editás un proyecto, experiencia, skill o perfil, la IA lo traduce automáticamente a todos los idiomas activos.</li>
          <li>La traducción se ejecuta en background — no bloquea la respuesta del admin.</li>
          <li>Si agregás un idioma nuevo, usá <strong className="text-slate-600 dark:text-slate-300">"Re-traducir todo"</strong> para traducir el contenido existente.</li>
          <li>Cada campo se guarda una sola vez en la base de datos — la IA no se vuelve a llamar a menos que el contenido cambie.</li>
        </ul>
      </div>

    </div>
  );
};