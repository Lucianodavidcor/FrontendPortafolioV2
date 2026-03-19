// Respuestas Globales
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> {
  success: true;
  data: T;
  meta: PaginationMeta;
}

// Entidades
export interface Profile {
  id: string;
  name: string;
  title: string;
  shortBio: string;
  socialLinks: { platform: string; url: string }[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; // ISO Date String
  endDate: string | null;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  longDescription?: string;
  gallery?: string[];
  repoLink?: string;
  demoLink?: string;
  tags: string[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface Stats {
  projects: number;
  experiences: number;
  skills: number;
  messages: { total: number; unread: number };
  pageVisits: number;
}

// ── Internacionalización ──────────────────────────────────────────────────
export interface Language {
  id:        string;
  code:      string;    // "en", "fr", "pt"
  name:      string;    // "English", "Français"
  flag:      string;    // "🇺🇸", "🇫🇷"
  isDefault: boolean;
  isActive:  boolean;
  createdAt: string;
}

export interface TranslationStats {
  languageId:  string;
  code:        string;
  name:        string;
  flag:        string;
  translated:  number;
  total:       number;
  percentage:  number;
}