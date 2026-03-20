"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Languages, Plus, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, CheckCircle2, AlertCircle, Loader2,
  Zap, X, Activity, Clock, ChevronDown,
} from 'lucide-react';
import { Language, TranslationStats } from '@/types/api';
import { fetchApi } from '@/lib/api';

interface LanguagesClientProps {
  initialLanguages: Language[];
  initialStats:     TranslationStats[];
  token:            string;
}

interface RetranslationStatus {
  running:   boolean;
  startedAt: string | null;
  done:      number;
  total:     number;
  errors:    string[];
}

interface AITestResult {
  ok:       boolean;
  response?: string;
  error?:   string;
  latency?: number;
  model?:   string;
  code?:    number | null;
}

// Sugerencias rápidas de idiomas
const QUICK_LANGS = [
  { code: 'en', name: 'Inglés',    flag: '🇬🇧' },
  { code: 'pt', name: 'Portugués', flag: '🇧🇷' },
  { code: 'fr', name: 'Francés',   flag: '🇫🇷' },
  { code: 'de', name: 'Alemán',    flag: '🇩🇪' },
  { code: 'it', name: 'Italiano',  flag: '🇮🇹' },
  { code: 'zh', name: 'Chino',     flag: '🇨🇳' },
  { code: 'ja', name: 'Japonés',   flag: '🇯🇵' },
];

// Formatear tiempo transcurrido
function elapsed(isoDate: string | null): string {
  if (!isoDate) return '—';
  const secs = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (secs < 60)   return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h`;
}

export const LanguagesClient = ({ initialLanguages, initialStats, token }: LanguagesClientProps) => {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [stats,     setStats]     = useState<TranslationStats[]>(initialStats);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error,     setError]     = useState('');

  // Formulario nuevo idioma
  const [showForm, setShowForm]     = useState(false);
  const [newCode,  setNewCode]      = useState('');
  const [newName,  setNewName]      = useState('');
  const [newFlag,  setNewFlag]      = useState('');
  const [adding,   setAdding]       = useState(false);

  // Polling de progreso por idioma
  const [retranslating, setRetranslating] = useState<Record<string, RetranslationStatus>>({});
  const pollRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Test de la API de IA
  const [aiTest,     setAiTest]     = useState<AITestResult | null>(null);
  const [testingAI,  setTestingAI]  = useState(false);

  // ── Polling de progreso ──────────────────────────────────────────────────
  const startPolling = useCallback((langId: string) => {
    if (pollRef.current[langId]) return;

    pollRef.current[langId] = setInterval(async () => {
      try {
        const res = await fetchApi<{ success: boolean; data: RetranslationStatus }>(
          `/languages/${langId}/retranslation-status`,
          { token }
        );
        const status = res.data;

        setRetranslating(prev => ({ ...prev, [langId]: status }));

        // Actualizar stats mientras corre
        if (status.running) {
          const statsRes = await fetchApi<{ success: boolean; data: TranslationStats[] }>(
            '/languages/stats',
            { token }
          );
          setStats(statsRes.data ?? []);
        }

        // Terminó
        if (!status.running) {
          clearInterval(pollRef.current[langId]);
          delete pollRef.current[langId];

          // Actualizar stats finales
          const statsRes = await fetchApi<{ success: boolean; data: TranslationStats[] }>(
            '/languages/stats',
            { token }
          );
          setStats(statsRes.data ?? []);
        }
      } catch {
        // silencioso — no romper la UI si el poll falla puntualmente
      }
    }, 2000); // cada 2 segundos
  }, [token]);

  // Limpiar polls al desmontar
  useEffect(() => {
    return () => {
      Object.values(pollRef.current).forEach(clearInterval);
    };
  }, []);

  // ── Retransladar ──────────────────────────────────────────────────────────
  const handleRetranslate = async (id: string) => {
    setError('');
    setLoadingId(id);
    try {
      const res = await fetchApi<{ success: boolean; data?: { total: number }; error?: { message: string } }>(
        `/languages/${id}/retranslate`,
        { method: 'POST', token }
      );

      if (!res.success) throw new Error((res as any).error?.message ?? 'Error al iniciar');

      setRetranslating(prev => ({
        ...prev,
        [id]: { running: true, startedAt: new Date().toISOString(), done: 0, total: res.data?.total ?? 0, errors: [] },
      }));
      startPolling(id);
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar la re-traducción');
    } finally {
      setLoadingId(null);
    }
  };

  // ── Toggle activo/inactivo ────────────────────────────────────────────────
  const handleToggle = async (lang: Language) => {
    setLoadingId(lang.id);
    try {
      const updated = await fetchApi<{ success: boolean; data: Language }>(
        `/languages/${lang.id}`,
        { method: 'PUT', token, body: JSON.stringify({ isActive: !lang.isActive }) }
      );
      setLanguages(prev => prev.map(l => l.id === lang.id ? updated.data : l));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleDelete = async (lang: Language) => {
    if (!confirm(`¿Eliminar "${lang.name}" y todas sus traducciones?`)) return;
    setLoadingId(lang.id);
    try {
      await fetchApi(`/languages/${lang.id}`, { method: 'DELETE', token });
      setLanguages(prev => prev.filter(l => l.id !== lang.id));
      setStats(prev => prev.filter(s => s.languageId !== lang.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // ── Agregar idioma ────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;
    setAdding(true);
    try {
      const created = await fetchApi<{ success: boolean; data: Language }>(
        '/languages',
        {
          method: 'POST',
          token,
          body: JSON.stringify({
            code:      newCode.trim().toLowerCase(),
            name:      newName.trim(),
            flag:      newFlag.trim() || '🌐',
            isDefault: false,
            isActive:  true,
          }),
        }
      );
      setLanguages(prev => [...prev, created.data]);
      setNewCode(''); setNewName(''); setNewFlag('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  // ── Test API ──────────────────────────────────────────────────────────────
  const handleTestAI = async () => {
    setTestingAI(true);
    setAiTest(null);
    try {
      const res = await fetchApi<{ success: boolean; data: AITestResult }>(
        '/languages/test-ai',
        { token }
      );
      setAiTest(res.data);
    } catch (err: any) {
      setAiTest({ ok: false, error: err.message });
    } finally {
      setTestingAI(false);
    }
  };

  // ── Stats helper ──────────────────────────────────────────────────────────
  const getStats = (langId: string) => stats.find(s => s.languageId === langId);

  return (
    <div className="space-y-8">

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Idiomas</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestioná los idiomas y las traducciones automáticas con IA.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Botón Test AI */}
          <button
            onClick={handleTestAI}
            disabled={testingAI}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-dark bg-surface-dark text-sm font-bold text-slate-300 hover:text-white hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {testingAI
              ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
              : <Zap className="w-4 h-4 text-primary" />
            }
            Probar API
          </button>

          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Nuevo Idioma'}
          </button>
        </div>
      </div>

      {/* ── Resultado del test AI ── */}
      {aiTest && (
        <div className={`p-5 rounded-2xl border ${aiTest.ok ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            {aiTest.ok
              ? <CheckCircle2 className="w-5 h-5 text-green-400" />
              : <AlertCircle  className="w-5 h-5 text-red-400" />
            }
            <span className={`font-bold text-sm ${aiTest.ok ? 'text-green-400' : 'text-red-400'}`}>
              {aiTest.ok ? '✅ API de Gemini funcionando correctamente' : '❌ Error en la API de Gemini'}
            </span>
            <button onClick={() => setAiTest(null)} className="ml-auto text-slate-600 hover:text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            {aiTest.ok && (
              <>
                <div className="bg-surface-dark rounded-lg p-3">
                  <p className="text-slate-600 mb-1">Respuesta</p>
                  <p className="text-white font-bold">{aiTest.response}</p>
                </div>
                <div className="bg-surface-dark rounded-lg p-3">
                  <p className="text-slate-600 mb-1">Latencia</p>
                  <p className="text-white font-bold">{aiTest.latency}ms</p>
                </div>
                <div className="bg-surface-dark rounded-lg p-3">
                  <p className="text-slate-600 mb-1">Modelo</p>
                  <p className="text-white font-bold">{aiTest.model}</p>
                </div>
              </>
            )}
            {!aiTest.ok && (
              <div className="col-span-4 bg-surface-dark rounded-lg p-3">
                <p className="text-slate-600 mb-1">Error</p>
                <p className="text-red-400">{aiTest.error}</p>
                {aiTest.code && <p className="text-slate-500 mt-1">Código HTTP: {aiTest.code}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Formulario nuevo idioma ── */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-5">Nuevo Idioma</h3>

          {/* Atajos rápidos */}
          <div className="flex flex-wrap gap-2 mb-5">
            {QUICK_LANGS.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setNewCode(l.code); setNewName(l.name); setNewFlag(l.flag); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
                  ${newCode === l.code
                    ? 'bg-primary border-primary text-white'
                    : 'border-border-dark text-slate-400 hover:border-primary/40 hover:text-white'
                  }`}
              >
                <span>{l.flag}</span> {l.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Código *</label>
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="en"
                maxLength={5}
                required
                className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nombre *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Inglés"
                required
                className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bandera</label>
              <input
                value={newFlag}
                onChange={e => setNewFlag(e.target.value)}
                placeholder="🇬🇧"
                className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {adding ? 'Agregando…' : 'Agregar Idioma'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lista de idiomas ── */}
      <div className="space-y-4">
        {languages.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Languages className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest">Sin idiomas configurados</p>
          </div>
        )}

        {languages.map(lang => {
          const stat    = getStats(lang.id);
          const status  = retranslating[lang.id];
          const isRunning = status?.running ?? false;
          const pct     = stat ? Math.round((stat.translated / Math.max(stat.total, 1)) * 100) : 0;
          const runPct  = isRunning && status.total > 0
            ? Math.round((status.done / status.total) * 100)
            : null;

          return (
            <div
              key={lang.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-colors
                ${lang.isDefault
                  ? 'border-primary/30'
                  : 'border-slate-200 dark:border-primary/10'
                }`}
            >
              {/* Barra de progreso de re-traducción (solo cuando corre) */}
              {isRunning && (
                <div className="h-1 bg-border-dark w-full">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${runPct ?? 0}%` }}
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                  {/* Info del idioma */}
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-4xl">{lang.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{lang.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-surface-dark px-2 py-0.5 rounded-full uppercase">
                          {lang.code}
                        </span>
                        {lang.isDefault && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                            Default
                          </span>
                        )}
                        {!lang.isActive && (
                          <span className="text-[10px] font-bold text-slate-500 bg-surface-dark border border-border-dark px-2 py-0.5 rounded-full uppercase">
                            Inactivo
                          </span>
                        )}
                      </div>

                      {/* Estado en tiempo real cuando está corriendo */}
                      {isRunning ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Activity className="w-3 h-3 text-primary animate-pulse" />
                          <span className="text-xs text-primary font-bold">
                            Traduciendo… {status.done}/{status.total} items ({runPct ?? 0}%)
                          </span>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">{elapsed(status.startedAt)}</span>
                        </div>
                      ) : (
                        // Cobertura estática
                        stat && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {stat.translated}/{stat.total} campos traducidos
                            </span>
                            <span className={`text-xs font-bold ${
                              pct === 100 ? 'text-green-400' :
                              pct >= 50   ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              ({pct}%)
                            </span>
                          </div>
                        )
                      )}

                      {/* Errores del último run */}
                      {!isRunning && status?.errors?.length > 0 && (
                        <p className="text-xs text-red-400 mt-1">
                          ⚠️ {status.errors.length} error{status.errors.length > 1 ? 'es' : ''} en el último run
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barra de cobertura */}
                  {stat && !isRunning && (
                    <div className="hidden md:flex items-center gap-3 min-w-48">
                      <div className="flex-1 h-1.5 bg-border-dark rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            pct === 100 ? 'bg-green-500' :
                            pct >= 50   ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 w-10 text-right">{pct}%</span>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    {/* Re-traducir */}
                    {!lang.isDefault && (
                      <button
                        onClick={() => handleRetranslate(lang.id)}
                        disabled={loadingId === lang.id || isRunning}
                        title={isRunning ? 'Traduciendo…' : 'Re-traducir todo el contenido con IA'}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-border-dark text-slate-400 hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isRunning
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          : <RefreshCw className="w-3.5 h-3.5" />
                        }
                        {isRunning ? 'Corriendo…' : 'Re-traducir'}
                      </button>
                    )}

                    {/* Toggle activo */}
                    {!lang.isDefault && (
                      <button
                        onClick={() => handleToggle(lang)}
                        disabled={loadingId === lang.id}
                        title={lang.isActive ? 'Desactivar' : 'Activar'}
                        className="p-2 rounded-lg border border-border-dark text-slate-400 hover:text-white hover:border-primary/40 transition-colors disabled:opacity-40"
                      >
                        {loadingId === lang.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : lang.isActive
                            ? <ToggleRight className="w-4 h-4 text-green-400" />
                            : <ToggleLeft  className="w-4 h-4" />
                        }
                      </button>
                    )}

                    {/* Eliminar */}
                    {!lang.isDefault && (
                      <button
                        onClick={() => handleDelete(lang)}
                        disabled={loadingId === lang.id || isRunning}
                        title="Eliminar idioma"
                        className="p-2 rounded-lg border border-border-dark text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Errores expandibles */}
                {!isRunning && status?.errors?.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-xs text-slate-500 cursor-pointer flex items-center gap-1 select-none">
                      <ChevronDown className="w-3 h-3" /> Ver errores del último run
                    </summary>
                    <div className="mt-2 space-y-1">
                      {status.errors.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded px-3 py-1.5 font-mono">
                          {e}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Info sobre el sistema ── */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-sm text-slate-400 space-y-2">
        <p className="font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> ¿Cómo funciona?
        </p>
        <p>Las traducciones se generan automáticamente con <span className="text-primary font-bold">Gemini 2.0 Flash</span> cada vez que creás o editás contenido.</p>
        <p>El botón <span className="font-bold text-white">Re-traducir</span> regenera todo el contenido existente para ese idioma. El progreso se actualiza en tiempo real cada 2 segundos.</p>
        <p>El botón <span className="font-bold text-white">Probar API</span> hace una traducción de prueba real para verificar que la conexión con Gemini funciona correctamente.</p>
      </div>
    </div>
  );
};