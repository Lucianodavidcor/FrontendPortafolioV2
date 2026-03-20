import { cookies } from 'next/headers';
import { Header }           from '@/components/layout/Header';
import { Footer }           from '@/components/layout/Footer';
import { HeroSection }      from '@/components/sections/HeroSection';
import { ProjectsSection }  from '@/components/sections/ProjectsSection';
import { SkillsSection }    from '@/components/sections/SkillsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ContactSection }   from '@/components/sections/ContactSection';
import { fetchApi }         from '@/lib/api';
import { applyTranslations, applyTranslationsToArray } from '@/lib/i18n';
import {
  PaginatedApiResponse,
  ApiResponse,
  Project,
  Skill,
  Experience,
  Profile,
  Language,
} from '@/types/api';

export const revalidate = 60;

export default async function Home() {
  // ── Idioma actual desde cookie ────────────────────────────────────────────
  const cookieStore = await cookies();
  const currentLang = cookieStore.get('NEXT_LOCALE')?.value ?? 'es';

  // ── Fetch de datos + traducciones en paralelo ─────────────────────────────
  const [profileRes, projectsRes, skillsRes, expRes, translationsRes] = await Promise.all([
    fetchApi<ApiResponse<Profile>>('/profile').catch(() => null),
    fetchApi<PaginatedApiResponse<Project[]>>('/projects?page=1&limit=6').catch(() => null),
    fetchApi<ApiResponse<Skill[]>>('/skills').catch(() => null),
    fetchApi<ApiResponse<Experience[]>>('/experience').catch(() => null),
    // Solo fetchar traducciones si el idioma no es el default
    currentLang !== 'es'
      ? fetchApi<ApiResponse<Record<string, Record<string, Record<string, string>>>>>(
          `/translations/all?lang=${currentLang}`
        ).catch(() => null)
      : Promise.resolve(null),
  ]);

  const profile     = profileRes?.data;
  const projects    = projectsRes?.data || [];
  const skills      = skillsRes?.data   || [];
  const experiences = expRes?.data      || [];
  const translations = translationsRes?.data ?? null;

  // ── Aplicar traducciones sobre los datos originales ───────────────────────
  // Si no hay traducciones (idioma default o error), los datos originales se usan tal cual

  const translatedProfile = profile
    ? applyTranslations(profile, translations?.profile?.[profile.id])
    : undefined;

  const translatedProjects    = applyTranslationsToArray(projects,    translations?.project);
  const translatedSkills      = applyTranslationsToArray(skills,      translations?.skill);
  const translatedExperiences = applyTranslationsToArray(experiences, translations?.experience);

  const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/CV-Luciano-Cortez.pdf';

  return (
    <>
      <Header />

      <main className="flex-1">
        <HeroSection
          name={translatedProfile?.name}
          title={translatedProfile?.title}
          shortBio={translatedProfile?.shortBio}
          cvUrl={cvUrl}
        />

        <ProjectsSection  projects={translatedProjects} />
        <SkillsSection    skills={translatedSkills} />
        <ExperienceSection experiences={translatedExperiences} />
        <ContactSection />
      </main>

      <Footer
        socialLinks={profile?.socialLinks || []}
        authorName={translatedProfile?.name || 'Portfolio'}
      />
    </>
  );
}