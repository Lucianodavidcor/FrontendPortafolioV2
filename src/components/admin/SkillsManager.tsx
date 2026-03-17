"use client";

import React, { useState } from 'react';
import { Plus, X, Loader2, Cpu, ChevronDown } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface SkillsManagerProps {
  initialSkills: Skill[];
  token: string;
}

const CATEGORIES = ["Frontend", "Backend", "Database", "Design", "Tools", "Other"];

// Color accent por categoría
const CATEGORY_COLORS: Record<string, string> = {
  Frontend:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Backend:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Database:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Design:    'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Tools:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Other:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const CATEGORY_DOT: Record<string, string> = {
  Frontend:  'bg-blue-400',
  Backend:   'bg-emerald-400',
  Database:  'bg-violet-400',
  Design:    'bg-pink-400',
  Tools:     'bg-amber-400',
  Other:     'bg-slate-400',
};

export const SkillsManager = ({ initialSkills, token }: SkillsManagerProps) => {
  const [skills, setSkills]         = useState<Skill[]>(initialSkills || []);
  const [newName, setNewName]       = useState('');
  const [newCategory, setNewCategory] = useState('Frontend');
  const [newIcon, setNewIcon]       = useState('');
  const [isAdding, setIsAdding]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterCat, setFilterCat]   = useState<string>('All');
  const [showForm, setShowForm]     = useState(false);

  const allCategories = ['All', ...CATEGORIES];
  const filtered = filterCat === 'All'
    ? skills
    : skills.filter(s => s.category === filterCat);

  // Agrupar por categoría para mostrar conteos
  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat).length;
    return acc;
  }, {});

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName || !newCategory) {
      setErrorMessage('El nombre y la categoría son obligatorios.');
      return;
    }
    if (skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      setErrorMessage('Esta habilidad ya existe.');
      return;
    }
    setErrorMessage('');
    setIsAdding(true);
    try {
      const res = await fetchApi<{ data: Skill }>('/skills', {
        method: 'POST',
        token,
        body: JSON.stringify({ name: trimmedName, category: newCategory, icon: newIcon.trim() || 'default-icon' }),
      });
      if (res.data) {
        setSkills(prev => [...prev, res.data]);
        setNewName('');
        setNewIcon('');
        setShowForm(false);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al añadir la habilidad.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMessage('');
    setDeletingId(id);
    try {
      await fetchApi(`/skills/${id}`, { method: 'DELETE', token });
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al eliminar.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border-dark bg-background-dark overflow-hidden">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-border-dark bg-surface-dark/60">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Stack Técnico</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{skills.length} tecnologías registradas</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setErrorMessage(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border
              ${showForm
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-transparent border-border-dark text-slate-400 hover:border-primary/30 hover:text-primary'
              }`}
          >
            {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showForm ? 'Cancelar' : 'Añadir'}
          </button>
        </div>
      </div>

      {/* ── Formulario colapsable ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-b border-border-dark
          ${showForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <form onSubmit={handleAddSkill} className="p-5 space-y-4 bg-surface-dark/30">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <X className="w-3.5 h-3.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Nombre <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="React, Node.js, Figma…"
              disabled={isAdding}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Categoría <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  disabled={isAdding}
                  className="w-full appearance-none bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors disabled:opacity-50 pr-8"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Icono */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Icono <span className="text-slate-700">(opcional)</span>
              </label>
              <input
                type="text"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                placeholder="URL o clase CSS"
                disabled={isAdding}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-700 outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Preview del badge */}
          {newName.trim() && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[9px] uppercase tracking-widest text-slate-600">Preview:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${CATEGORY_COLORS[newCategory] || CATEGORY_COLORS.Other}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[newCategory] || CATEGORY_DOT.Other}`} />
                {newName.trim()}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAdding || !newName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isAdding ? 'Guardando…' : 'Añadir al stack'}
          </button>
        </form>
      </div>

      {/* ── Filtros por categoría ── */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-none border-b border-border-dark bg-surface-dark/20">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border
              ${filterCat === cat
                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                : 'bg-transparent border-border-dark text-slate-500 hover:border-slate-600 hover:text-slate-300'
              }`}
          >
            {cat !== 'All' && (
              <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[cat] || 'bg-slate-500'}`} />
            )}
            {cat}
            {cat !== 'All' && counts[cat] > 0 && (
              <span className={`ml-0.5 ${filterCat === cat ? 'text-white/60' : 'text-slate-600'}`}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Lista de skills ── */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-10 h-10 rounded-xl border border-dashed border-border-dark flex items-center justify-center">
              <Cpu className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {filterCat === 'All' ? 'Sin habilidades aún.' : `Sin habilidades en ${filterCat}.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map(skill => (
              <div
                key={skill.id}
                className={`group relative inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 hover:pr-1
                  ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.Other}`}
              >
                {/* Dot de categoría */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_DOT[skill.category] || CATEGORY_DOT.Other}`} />
                <span className="leading-none">{skill.name}</span>

                {/* Botón eliminar */}
                <button
                  onClick={() => handleDelete(skill.id)}
                  disabled={deletingId === skill.id}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                  title="Eliminar"
                >
                  {deletingId === skill.id
                    ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    : <X className="w-2.5 h-2.5" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer con resumen ── */}
      {skills.length > 0 && (
        <div className="px-5 py-3 border-t border-border-dark bg-surface-dark/40 flex flex-wrap gap-3">
          {CATEGORIES.filter(c => counts[c] > 0).map(cat => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat]}`} />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{cat}</span>
              <span className="text-[9px] font-black text-slate-500">{counts[cat]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};