"use client";

import React, { useState } from 'react';
import { Wrench, Plus, X, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

// 1. Actualizamos la interfaz para que coincida con tu base de datos
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

export const SkillsManager = ({ initialSkills, token }: SkillsManagerProps) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  
  // Nuevos estados para los 3 campos requeridos
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend'); // Valor por defecto
  const [newIcon, setNewIcon] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Categorías predefinidas comunes para mantener orden (puedes añadir más si tu API lo permite)
  const CATEGORIES = ["Frontend", "Backend", "Database", "Design", "Tools", "Other"];

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newName.trim();
    const trimmedIcon = newIcon.trim();
    
    if (!trimmedName || !newCategory) {
      setErrorMessage('El nombre y la categoría son obligatorios.');
      return;
    }

    // Evitar duplicados visuales por nombre
    if (skills.some(skill => skill.name.toLowerCase() === trimmedName.toLowerCase())) {
      setErrorMessage('Esta habilidad ya existe en tu lista.');
      return;
    }

    setErrorMessage('');
    setIsAdding(true);

    try {
      // 2. Enviamos el payload completo que exige tu API
      const payload = {
        name: trimmedName,
        category: newCategory,
        icon: trimmedIcon || "default-icon" // Fallback por si la API falla con icono vacío
      };

      const res = await fetchApi<{ data: Skill }>('/skills', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.data) {
        setSkills(prev => [...prev, res.data]);
        // Limpiamos los campos (dejamos la categoría igual por si quiere añadir varias de Frontend seguidas)
        setNewName('');
        setNewIcon('');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al añadir la habilidad.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    setErrorMessage('');
    setDeletingId(id);

    try {
      await fetchApi(`/skills/${id}`, {
        method: 'DELETE',
        token,
      });
      setSkills(prev => prev.filter(skill => skill.id !== id));
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al eliminar la habilidad.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800/50">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Habilidades Técnicas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona las tecnologías que dominas.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* 3. Formulario actualizado con los 3 campos */}
      <form onSubmit={handleAddSkill} className="flex flex-col gap-3 mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre *</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej. React, Node.js..."
            disabled={isAdding}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoría *</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={isAdding}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icono</label>
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="URL o clase CSS"
              disabled={isAdding}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isAdding || !newName.trim()}
          className="mt-2 w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors disabled:opacity-50"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Añadir Habilidad
        </button>
      </form>

      {/* 4. Lista de Skills agrupaditas visualmente */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div 
                key={skill.id} 
                className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm animate-in zoom-in duration-200 group"
              >
                <div className="flex flex-col">
                  <span>{skill.name}</span>
                  {/* Mostramos la categoría en pequeñito para que haya contexto */}
                  <span className="text-[9px] uppercase tracking-wider text-primary opacity-70">{skill.category}</span>
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  disabled={deletingId === skill.id}
                  className="ml-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full p-1 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 md:opacity-100"
                  title="Eliminar habilidad"
                >
                  {deletingId === skill.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center w-full py-4">
              Aún no has añadido ninguna habilidad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};