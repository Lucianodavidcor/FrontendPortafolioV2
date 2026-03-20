"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, X, Pause, Play,
  ChevronDown, Activity, Clock, Sparkles, Bot,
  Zap, Signal, Shield, AlertTriangle, CheckCheck,
  Globe, Power, RotateCcw,
} from 'lucide-react';
import { Language, TranslationStats } from '@/types/api';
import { fetchApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────
interface LanguagesClientProps {
  initialLanguages: Language[];
  initialStats:     TranslationStats[];
  token:            string;
}
type AIProvider = 'gemini' | 'groq';
interface RetranslationStatus {
  running: boolean; paused: boolean;
  startedAt: string | null; pausedAt: string | null;
  done: number; total: number;
  errors: string[]; processedIds: string[];
  currentAI: AIProvider | null;
  lastEntityType?: string; lastEntityId?: string;
}
interface AITestResult {
  ok: boolean; response?: string; error?: string;
  latency?: number; model?: string; isQuota?: boolean;
}
interface AITestResults { gemini?: AITestResult; groq?: AITestResult; }

// ── Static data ───────────────────────────────────────────────────────────
const QUICK_LANGS = [
  { code: 'en', name: 'English',    flag: '🇬🇧' },
  { code: 'pt', name: 'Português',  flag: '🇧🇷' },
  { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
  { code: 'zh', name: '中文',        flag: '🇨🇳' },
  { code: 'ja', name: '日本語',      flag: '🇯🇵' },
];

// ── Utils ─────────────────────────────────────────────────────────────────
function elapsed(iso: string | null): string {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
function pctColor(n: number) {
  if (n === 100) return '#22c55e';
  if (n >= 60)   return '#f59e0b';
  if (n >= 30)   return '#f97316';
  return '#ef4444';
}

// ── Sub-components ────────────────────────────────────────────────────────

/** Animated scan-line progress bar */
function ScanBar({ pct, running }: { pct: number; running: boolean }) {
  const color = running ? 'var(--color-primary)' : pctColor(pct);
  return (
    <div className="relative h-0.75 bg-white/5 rounded-full overflow-hidden w-full">
      {/* Track fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {/* Scan shimmer when running */}
      {running && (
        <div
          className="absolute inset-y-0 w-16 animate-[scan_1.8s_ease-in-out_infinite]"
          style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
        />
      )}
    </div>
  );
}

/** AI provider badge */
function AIChip({ ai, pulse }: { ai: AIProvider | null; pulse?: boolean }) {
  if (!ai) return null;
  const cfg = ai === 'gemini'
    ? { label: 'Gemini', icon: '✦', bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', dot: 'bg-blue-400' }
    : { label: 'Groq',   icon: '⚡', bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', dot: 'bg-orange-400' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />}
      {cfg.icon} {cfg.label}
    </span>
  );
}

/** Circular coverage gauge */
function CoverageRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pctColor(pct);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3} stroke="rgba(255,255,255,0.06)" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3}
        stroke={color} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export const LanguagesClient = ({ initialLanguages, initialStats, token }: LanguagesClientProps) => {
  const [languages,   setLanguages]   = useState<Language[]>(initialLanguages);
  const [stats,       setStats]       = useState<TranslationStats[]>(initialStats);
  const [loadingId,   setLoadingId]   = useState<string | null>(null);
  const [globalError, setGlobalError] = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [newCode,     setNewCode]     = useState('');
  const [newName,     setNewName]     = useState('');
  const [newFlag,     setNewFlag]     = useState('');
  const [adding,      setAdding]      = useState(false);
  const [statusMap,   setStatusMap]   = useState<Record<string, RetranslationStatus>>({});
  const [aiResults,   setAiResults]   = useState<AITestResults | null>(null);
  const [testingAI,   setTestingAI]   = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const pollRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const getStat = (id: string) => stats.find(s => s.languageId === id);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetchApi<{ success: boolean; data: TranslationStats[] }>('/languages/stats', { token });
      setStats(res.data ?? []);
    } catch {}
  }, [token]);

  const startPolling = useCallback((langId: string) => {
    if (pollRef.current[langId]) return;
    pollRef.current[langId] = setInterval(async () => {
      try {
        const res = await fetchApi<{ success: boolean; data: RetranslationStatus }>(
          `/languages/${langId}/retranslation-status`, { token }
        );
        setStatusMap(p => ({ ...p, [langId]: res.data }));
        if (res.data.running) await refreshStats();
        if (!res.data.running) {
          clearInterval(pollRef.current[langId]);
          delete pollRef.current[langId];
          await refreshStats();
        }
      } catch {}
    }, 2000);
  }, [token, refreshStats]);

  useEffect(() => () => { Object.values(pollRef.current).forEach(clearInterval); }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRetranslate = async (id: string) => {
    setGlobalError(''); setLoadingId(id);
    try {
      const res = await fetchApi<any>(`/languages/${id}/retranslate`, { method: 'POST', token });
      if (!res.success) throw new Error(res.error?.message ?? 'Error al iniciar');
      setStatusMap(p => ({
        ...p, [id]: { running: true, paused: false, startedAt: new Date().toISOString(),
          pausedAt: null, done: 0, total: res.data?.total ?? 0, errors: [], processedIds: [], currentAI: 'gemini' },
      }));
      startPolling(id);
    } catch (err: any) { setGlobalError(err.message ?? 'Error'); }
    finally { setLoadingId(null); }
  };

  const handlePause = async (id: string) => {
    try {
      await fetchApi(`/languages/${id}/pause`, { method: 'POST', token });
      setStatusMap(p => ({ ...p, [id]: { ...(p[id] as any), paused: true } }));
    } catch (err: any) { setGlobalError(err.message); }
  };

  const handleResume = async (id: string) => {
    setGlobalError(''); setLoadingId(id);
    try {
      const res = await fetchApi<any>(`/languages/${id}/resume`, { method: 'POST', token });
      if (!res.success) throw new Error(res.error?.message ?? 'Error al reanudar');
      setStatusMap(p => ({ ...p, [id]: { ...(p[id] as any), running: true, paused: false } }));
      startPolling(id);
    } catch (err: any) { setGlobalError(err.message); }
    finally { setLoadingId(null); }
  };

  const handleToggle = async (lang: Language) => {
    setLoadingId(lang.id);
    try {
      const res = await fetchApi<{ success: boolean; data: Language }>(
        `/languages/${lang.id}`, { method: 'PUT', token, body: JSON.stringify({ isActive: !lang.isActive }) }
      );
      setLanguages(p => p.map(l => l.id === lang.id ? res.data : l));
    } catch (err: any) { setGlobalError(err.message); }
    finally { setLoadingId(null); }
  };

  const handleDelete = async (lang: Language) => {
    if (!confirm(`¿Eliminar "${lang.name}" y todas sus traducciones? Esta acción no se puede deshacer.`)) return;
    setLoadingId(lang.id);
    try {
      await fetchApi(`/languages/${lang.id}`, { method: 'DELETE', token });
      setLanguages(p => p.filter(l => l.id !== lang.id));
      setStats(p => p.filter(s => s.languageId !== lang.id));
    } catch (err: any) { setGlobalError(err.message); }
    finally { setLoadingId(null); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetchApi<{ success: boolean; data: Language }>('/languages', {
        method: 'POST', token,
        body: JSON.stringify({ code: newCode.trim().toLowerCase(), name: newName.trim(), flag: newFlag.trim() || '🌐', isDefault: false, isActive: true }),
      });
      setLanguages(p => [...p, res.data]);
      setNewCode(''); setNewName(''); setNewFlag(''); setShowForm(false);
    } catch (err: any) { setGlobalError(err.message); }
    finally { setAdding(false); }
  };

  const handleTestAI = async () => {
    setTestingAI(true); setAiResults(null); setShowAIPanel(true);
    try {
      const res = await fetchApi<{ success: boolean; data: AITestResults }>('/languages/test-ai', { token });
      setAiResults(res.data);
    } catch (err: any) { setAiResults({ gemini: { ok: false, error: err.message } }); }
    finally { setTestingAI(false); }
  };

  const activeCount = languages.filter(l => !l.isDefault && l.isActive).length;
  const totalFields = stats.reduce((a, s) => a + s.total, 0);
  const doneFields  = stats.reduce((a, s) => a + s.translated, 0);
  const globalPct   = totalFields > 0 ? Math.round((doneFields / totalFields) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Scan animation keyframes */}
      <style>{`
        @keyframes scan { 0%{left:-4rem} 100%{left:110%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .lang-card { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div className="space-y-5">

        {/* ── Error banner ── */}
        {globalError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError('')} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title + summary */}
          <div className="flex items-start gap-4">
            <div className="mt-0.5 w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Idiomas</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="text-primary font-semibold">{activeCount}</span> activos
                {totalFields > 0 && <> · <span className="font-semibold" style={{ color: pctColor(globalPct) }}>{globalPct}%</span> traducido</>}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAI}
              disabled={testingAI}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border-dark bg-surface-dark text-slate-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {testingAI ? 'Probando…' : 'Test APIs'}
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                showForm
                  ? 'bg-surface-dark border border-border-dark text-slate-400'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
              }`}
            >
              {showForm ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Plus className="w-3.5 h-3.5" /> Nuevo idioma</>}
            </button>
          </div>
        </div>

        {/* ── AI Test Panel ── */}
        {showAIPanel && (
          <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Signal className="w-3.5 h-3.5 text-primary" /> Estado de las APIs
              </span>
              <button onClick={() => setShowAIPanel(false)} className="text-slate-600 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-dark">
              {/* Gemini */}
              {[
                {
                  key: 'gemini' as const,
                  icon: <Sparkles className="w-4 h-4" />,
                  label: 'Google Gemini', sublabel: 'Primario',
                  accent: 'text-blue-400', accentBg: 'bg-blue-500/5', model: 'gemini-2.5-flash-lite',
                },
                {
                  key: 'groq' as const,
                  icon: <Bot className="w-4 h-4" />,
                  label: 'Groq · LLaMA', sublabel: 'Fallback',
                  accent: 'text-orange-400', accentBg: 'bg-orange-500/5', model: 'llama-3.3-70b',
                },
              ].map(cfg => {
                const r = aiResults?.[cfg.key];
                return (
                  <div key={cfg.key} className={`p-5 space-y-3 ${cfg.accentBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cfg.accent}>{cfg.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{cfg.label}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{cfg.sublabel} · {cfg.model}</p>
                        </div>
                      </div>
                      {testingAI
                        ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-slate-500 animate-spin" />
                        : r
                          ? r.ok
                            ? <CheckCheck className="w-4 h-4 text-green-400" />
                            : <AlertTriangle className="w-4 h-4 text-red-400" />
                          : <div className="w-2 h-2 rounded-full bg-slate-700" />
                      }
                    </div>

                    {r && (
                      <div className={`rounded-xl px-3 py-2.5 text-xs font-mono border ${r.ok ? 'bg-green-500/5 border-green-500/15 text-green-300' : 'bg-red-500/5 border-red-500/15 text-red-300'}`}>
                        {r.ok ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">output:</span>
                              <span className="text-white font-bold">"{r.response}"</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>latency:</span><span>{r.latency}ms</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-red-400">{r.error}</p>
                            {r.isQuota && (
                              <p className="text-amber-400 mt-1.5 text-[11px] not-italic font-sans font-semibold">
                                ⚠ Cuota agotada — Groq se activará automáticamente
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {testingAI && !r && (
                      <div className="h-10 rounded-xl bg-white/3 border border-border-dark flex items-center px-3 gap-2 text-xs text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" /> Conectando…
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add form ── */}
        {showForm && (
          <div className="rounded-2xl border border-primary/20 bg-surface-dark overflow-hidden">
            <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nuevo idioma</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Quick picks */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2.5">Selección rápida</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_LANGS.map(l => (
                    <button
                      key={l.code} type="button"
                      onClick={() => { setNewCode(l.code); setNewName(l.name); setNewFlag(l.flag); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        newCode === l.code
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105'
                          : 'border-border-dark text-slate-500 hover:border-primary/30 hover:text-white'
                      }`}
                    >
                      <span className="text-base leading-none">{l.flag}</span> {l.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Fields */}
              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Código *', value: newCode, set: setNewCode, ph: 'en', mono: true, max: 5 },
                  { label: 'Nombre *', value: newName, set: setNewName, ph: 'English', mono: false, max: 40 },
                  { label: 'Nombre local', value: newName, set: setNewName, ph: 'English', mono: false, max: 40 },
                  { label: 'Bandera', value: newFlag, set: setNewFlag, ph: '🇬🇧', mono: false, max: 4 },
                ].slice(0,3).map((f,i) => (
                  <div key={i} className={i === 1 ? 'md:col-span-2' : ''}>
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5">{f.label}</label>
                    <input
                      value={f.value} onChange={e => f.set(e.target.value)}
                      placeholder={f.ph} maxLength={f.max} required={f.label.includes('*')}
                      className={`w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors placeholder:text-slate-700 ${f.mono ? 'font-mono' : ''}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5">Bandera</label>
                  <input
                    value={newFlag} onChange={e => setNewFlag(e.target.value)}
                    placeholder="🇬🇧" maxLength={4}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors placeholder:text-slate-700"
                  />
                </div>
                <div className="col-span-2 md:col-span-4 flex justify-end pt-1">
                  <button
                    type="submit" disabled={adding || !newCode || !newName}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {adding
                      ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creando…</>
                      : <><Plus className="w-3.5 h-3.5" /> Crear idioma</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Language cards ── */}
        <div className="space-y-3">
          {languages.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border-dark rounded-2xl">
              <Globe className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Sin idiomas configurados</p>
              <p className="text-xs text-slate-700 mt-1">Hacé click en "Nuevo idioma" para empezar</p>
            </div>
          )}

          {languages.map((lang, idx) => {
            const stat      = getStat(lang.id);
            const jobStatus = statusMap[lang.id];
            const isRunning = jobStatus?.running  === true;
            const isPaused  = jobStatus?.paused   === true && !isRunning;
            const isLoading = loadingId === lang.id;
            const coverPct  = stat ? Math.round((stat.translated / Math.max(stat.total, 1)) * 100) : 0;
            const runPct    = (isRunning || isPaused) && (jobStatus?.total ?? 0) > 0
              ? Math.round(((jobStatus.done ?? 0) / jobStatus.total) * 100)
              : null;
            const displayPct = runPct ?? coverPct;
            const isDone     = !lang.isDefault && !isRunning && !isPaused && coverPct === 100;
            const hasErrors  = (jobStatus?.errors?.length ?? 0) > 0;

            // State label
            const stateLabel = isRunning ? 'TRANSLATING'
              : isPaused   ? 'PAUSED'
              : isDone     ? 'COMPLETE'
              : lang.isDefault ? 'DEFAULT'
              : 'IDLE';

            const stateColor = isRunning ? 'text-primary'
              : isPaused   ? 'text-amber-400'
              : isDone     ? 'text-green-400'
              : lang.isDefault ? 'text-primary'
              : 'text-slate-600';

            return (
              <div
                key={lang.id}
                className="lang-card group relative rounded-2xl border border-border-dark bg-surface-dark overflow-hidden transition-all duration-300 hover:border-primary/20"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Running glow strip */}
                {isRunning && (
                  <div className="absolute inset-x-0 top-0 h-0.5">
                    <div className="h-full bg-primary animate-pulse" style={{ boxShadow: '0 0 12px 2px var(--color-primary)' }} />
                  </div>
                )}

                {/* Paused strip */}
                {isPaused && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500/60" />
                )}

                <div className="p-5">
                  <div className="flex items-start gap-4">

                    {/* Flag + ring */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <span className="text-4xl leading-none" style={{ filter: lang.isActive ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                        {lang.flag}
                      </span>
                      {!lang.isDefault && stat && (
                        <div className="absolute -bottom-1 -right-2">
                          <CoverageRing pct={displayPct} size={28} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-base leading-none">{lang.name}</span>
                            <span className="font-mono text-[10px] text-slate-600 bg-background-dark border border-border-dark px-2 py-0.5 rounded-full">
                              {lang.code.toUpperCase()}
                            </span>
                            {/* State chip */}
                            <span className={`text-[9px] font-black tracking-[0.2em] ${stateColor} flex items-center gap-1`}>
                              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
                              {isPaused  && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                              {isDone    && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                              {stateLabel}
                            </span>
                            {isRunning && <AIChip ai={jobStatus?.currentAI ?? null} pulse />}
                            {isPaused  && <AIChip ai={jobStatus?.currentAI ?? null} />}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {!lang.isDefault && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Pause */}
                            {isRunning && (
                              <button
                                onClick={() => handlePause(lang.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-amber-500/30 text-amber-400 bg-amber-500/8 hover:bg-amber-500/15 transition-all"
                              >
                                <Pause className="w-3 h-3" /> Pausar
                              </button>
                            )}
                            {/* Resume */}
                            {isPaused && (
                              <button
                                onClick={() => handleResume(lang.id)}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-green-500/30 text-green-400 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40"
                              >
                                {isLoading
                                  ? <div className="w-3 h-3 rounded-full border border-t-transparent border-green-400 animate-spin" />
                                  : <Play className="w-3 h-3" />
                                } Reanudar
                              </button>
                            )}
                            {/* Translate / Re-translate */}
                            {!isRunning && !isPaused && (
                              <button
                                onClick={() => handleRetranslate(lang.id)}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-border-dark text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-40"
                              >
                                {isLoading
                                  ? <div className="w-3 h-3 rounded-full border border-t-transparent border-primary animate-spin" />
                                  : <RotateCcw className="w-3 h-3" />
                                }
                                {coverPct > 0 ? 'Re-traducir' : 'Traducir'}
                              </button>
                            )}
                            {/* Toggle */}
                            <button
                              onClick={() => handleToggle(lang)}
                              disabled={isLoading || isRunning}
                              title={lang.isActive ? 'Desactivar' : 'Activar'}
                              className={`p-1.5 rounded-xl border transition-all disabled:opacity-40 ${
                                lang.isActive
                                  ? 'border-green-500/25 text-green-400 bg-green-500/5 hover:bg-green-500/15'
                                  : 'border-border-dark text-slate-600 hover:border-slate-500'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(lang)}
                              disabled={isLoading || isRunning}
                              className="p-1.5 rounded-xl border border-border-dark text-slate-600 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/5 transition-all disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {!lang.isDefault && (
                        <div className="space-y-1.5">
                          <ScanBar pct={displayPct} running={isRunning} />
                          <div className="flex items-center justify-between">
                            {/* Left: context */}
                            <div className="text-[10px] text-slate-600 font-mono">
                              {isRunning && (
                                <span className="text-primary">
                                  {jobStatus.done}/{jobStatus.total} ítems · {elapsed(jobStatus.startedAt)}
                                  {jobStatus.lastEntityType && (
                                    <span className="ml-2 text-slate-600">↳ {jobStatus.lastEntityType}</span>
                                  )}
                                </span>
                              )}
                              {isPaused && (
                                <span className="text-amber-400">
                                  Pausado · {jobStatus.done}/{jobStatus.total} completados
                                  {' · '}
                                  <span className="text-slate-600">Continuará desde ítem #{jobStatus.done + 1}</span>
                                </span>
                              )}
                              {!isRunning && !isPaused && stat && (
                                <span>{stat.translated}/{stat.total} campos traducidos</span>
                              )}
                            </div>
                            {/* Right: percentage */}
                            <span className="text-[11px] font-black font-mono" style={{ color: pctColor(displayPct) }}>
                              {displayPct}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Error list */}
                      {!isRunning && hasErrors && (
                        <details className="group/err">
                          <summary className="flex items-center gap-1.5 text-[10px] text-red-400/80 cursor-pointer select-none font-bold tracking-widest">
                            <ChevronDown className="w-3 h-3 group-open/err:rotate-180 transition-transform" />
                            <AlertTriangle className="w-3 h-3" />
                            {jobStatus?.errors?.length} error{(jobStatus?.errors?.length ?? 0) > 1 ? 'es' : ''}
                          </summary>
                          <div className="mt-2 space-y-1 pl-4 pr-1">
                            {jobStatus?.errors?.slice(0, 4).map((e, i) => (
                              <p key={i} className="text-[10px] font-mono text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-1.5 truncate">
                                {e}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Info footer ── */}
        <div className="rounded-2xl border border-border-dark overflow-hidden">
          <div className="px-5 py-3 border-b border-border-dark flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Motor de traducción</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-dark">
            {[
              {
                icon: <Sparkles className="w-4 h-4 text-blue-400" />,
                title: 'Gemini 2.5 Flash Lite',
                badge: 'Primario',
                badgeClass: 'text-blue-400 bg-blue-500/8 border-blue-500/20',
                desc: '15 req/min · 1.000 req/día · gratis sin tarjeta de crédito.',
              },
              {
                icon: <Bot className="w-4 h-4 text-orange-400" />,
                title: 'Groq · LLaMA 3.3 70B',
                badge: 'Fallback',
                badgeClass: 'text-orange-400 bg-orange-500/8 border-orange-500/20',
                desc: 'Se activa automáticamente si Gemini agota su cuota diaria.',
              },
              {
                icon: <Activity className="w-4 h-4 text-green-400" />,
                title: 'Pause & Resume',
                badge: 'Sin pérdida',
                badgeClass: 'text-green-400 bg-green-500/8 border-green-500/20',
                desc: 'Pausá en cualquier momento. El próximo run continúa desde donde quedó.',
              },
            ].map((item, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-bold text-white">{item.title}</span>
                  <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-full border ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};