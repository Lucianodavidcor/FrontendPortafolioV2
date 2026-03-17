import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';

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

  const cvUrl = process.env.NEXT_PUBLIC_CV_URL || '/CV-Luciano-Cortez.pdf';

  return (
    <>
      <Header />

      <main className="flex-1">
        <HeroSection
          name={profile?.name}
          title={profile?.title}
          shortBio={profile?.shortBio}
          cvUrl={cvUrl}
        />

        <ProjectsSection projects={projects} />
        <SkillsSection skills={skills} />
        <ExperienceSection experiences={experiences} />
        <ContactSection />
      </main>

      <Footer
        socialLinks={profile?.socialLinks || []}
        authorName={profile?.name || 'Portfolio'}
      />
    </>
  );
}