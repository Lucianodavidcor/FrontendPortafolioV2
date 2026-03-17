import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, DownloadCloud } from 'lucide-react';

import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ContactSection } from '@/components/sections/ContactSection';

import { fetchApi } from '@/lib/api';
import { PaginatedApiResponse, ApiResponse, Project, Skill, Experience, Profile } from '@/types/api';

export const revalidate = 60;

export default async function Home() {
  const [profileRes, projectsRes, skillsRes, expRes] = await Promise.all([
    fetchApi<ApiResponse<Profile>>('/profile').catch(() => null),
    fetchApi<PaginatedApiResponse<Project[]>>('/projects?page=1&limit=6').catch(() => null),
    fetchApi<ApiResponse<Skill[]>>('/skills').catch(() => null),
    fetchApi<ApiResponse<Experience[]>>('/experience').catch(() => null),
  ]);

  const profile     = profileRes?.data;
  const projects    = projectsRes?.data || [];
  const skills      = skillsRes?.data   || [];
  const experiences = expRes?.data      || [];

  const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/cv.pdf';

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Disponible para nuevos proyectos
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
                {profile ? (
                  <>HOLA SOY <br /><span className="text-primary italic">{profile.name}</span></>
                ) : (
                  <>CREANDO <br /><span className="text-primary italic">POESÍA</span><br />DIGITAL.</>
                )}
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                {profile?.shortBio || 'Diseñador multidisciplinar y desarrollador creativo empujando los límites de lo que es posible en la web moderna.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                <a
                  href="#proyectos"
                  className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 group shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Ver Proyectos
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={!cvUrl.startsWith('http')}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-lg"
                >
                  <DownloadCloud className="w-5 h-5" />
                  Descargar CV
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-72 h-96 md:w-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                  alt="Retrato"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-6 -left-6 md:-left-12 glass-card p-6 rounded-2xl shadow-xl max-w-[200px]">
                <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Rol Actual</p>
                <p className="text-sm font-medium">{profile?.title || 'Desarrollador & Diseñador'}</p>
              </div>
            </div>
          </div>
        </section>

        <ProjectsSection projects={projects} />
        <SkillsSection skills={skills} />
        <ExperienceSection experiences={experiences} />
        <ContactSection />
      </main>

      {/* Footer recibe socialLinks y nombre del perfil desde la DB */}
      <Footer
        socialLinks={profile?.socialLinks || []}
        authorName={profile?.name || 'Portfolio'}
      />
    </>
  );
}