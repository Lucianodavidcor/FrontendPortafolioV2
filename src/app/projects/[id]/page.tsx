import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchApi } from '@/lib/api';
import { ApiResponse, Project, Profile } from '@/types/api';
import { ProjectGalleryClient } from '@/components/project/ProjectGalleryClient';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetail({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch en paralelo: proyecto + perfil (para socialLinks del footer)
  const [projectRes, profileRes] = await Promise.all([
    fetchApi<ApiResponse<Project>>(`/projects/${id}`).catch(() => null),
    fetchApi<ApiResponse<Profile>>('/profile').catch(() => null),
  ]);

  const project = projectRes?.data;
  const profile = profileRes?.data;

  if (!project) notFound();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero del Proyecto */}
        <section className="relative w-full h-179 min-h-125 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${project.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/40 to-transparent" />

          {/* Botón volver — va a la home */}
          <div className="absolute top-24 left-6 md:left-16 z-10">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Portafolio
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                {project.title}
              </h1>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-light">
                {project.shortDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Descripción + Links */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-primary">Resumen</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project.longDescription
                    ? <ReactMarkdown>{project.longDescription}</ReactMarkdown>
                    : 'No hay una descripción detallada para este proyecto.'
                  }
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                  Enlaces del Proyecto
                </h4>
                <div className="space-y-4">
                  {project.demoLink && (
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Ver Sitio en Vivo
                    </a>
                  )}
                  {project.repoLink && (
                    <a
                      href={project.repoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:scale-[1.02] transition-transform"
                    >
                      <Github className="w-5 h-5" />
                      Ver Repositorio
                    </a>
                  )}
                  {!project.demoLink && !project.repoLink && (
                    <p className="text-sm text-slate-500 italic">
                      Los enlaces no están disponibles públicamente para este proyecto.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ProjectGalleryClient images={project.gallery || []} />
      </main>

      {/* Footer con socialLinks reales del perfil */}
      <Footer
        socialLinks={profile?.socialLinks || []}
        authorName={profile?.name || 'Portfolio'}
      />
    </>
  );
}