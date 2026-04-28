// src/features/hr/types.ts

// ─── Вакансии ────────────────────────────────────────────────────────────────

export interface HRVacancy {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRVacancyCreate {
  title: string;
  description: string;
  required_skills: string[];
  is_active?: boolean;
}

// ─── Шаблоны ─────────────────────────────────────────────────────────────────

export interface HRVacancyTemplate {
  id: number;
  name: string;
  title: string;
  description: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRVacancyTemplateCreate {
  name: string;
  title: string;
  description: string;
  required_skills: string[];
  is_active?: boolean;
}

export interface HRVacancyTemplateUpdate {
  name?: string;
  title?: string;
  description?: string;
  required_skills?: string[];
  is_active?: boolean;
}

export interface HRVacancyFromTemplatePayload {
  title?: string;
  description?: string;
  required_skills?: string[];
}

// ─── Отклики ─────────────────────────────────────────────────────────────────

export type ApplicationStatus = 'new' | 'under_review' | 'accepted' | 'rejected';

export interface HRApplication {
  id: number;
  vacancy_id: number;
  vacancy_title?: string | null;
  candidate_id: number;
  candidate_email?: string | null;
  candidate_full_name?: string | null;
  resume_path?: string | null;
  status: ApplicationStatus;
  match_score: number;
  created_at: string;
  updated_at: string;
  rating?: number | null;
  pipeline_stage?: string | null;
  match_summary?: string | null;
}

export interface HRApplicationUpdatePayload {
  rating?: number | null;
  pipeline_stage?: string | null;
  match_summary?: string | null;
}

export interface VacancyApplicationsAnalysis {
  total_applications: number;
  average_match_score: number | null;
  min_match_score: number | null;
  max_match_score: number | null;
}

// ─── Кандидаты ───────────────────────────────────────────────────────────────

export interface HRCandidate {
  id: number;
  email: string;
  full_name?: string | null;
  city?: string | null;
  desired_position?: string | null;
  desired_salary?: number | null;
  phone?: string | null;
}

// ─── Заметки по кандидатам ───────────────────────────────────────────────────

export interface HRCandidateNote {
  id: number;
  candidate_id: number; 
  body: string;
  created_at: string;
  updated_at: string;
  hr: {
    id: number;
    full_name: string;
  };
}

export interface HRCandidateNoteCreate {
  body: string;
}

// ─── Аналитика / дашборд ─────────────────────────────────────────────────────

export interface HRDashboardStats {
  total_vacancies: number;
  active_vacancies: number;
  total_applications: number;
  new_applications: number;
  accepted_applications: number;
  rejected_applications: number;
}

// ─── Уведомления ─────────────────────────────────────────────────────────────

export interface HRNotification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Теги по кандидатам ──────────────────────────────────────────────────────

export interface HRCandidateTag {
  id: number;
  candidate_id: number;
  name: string;
  created_at: string;
}

export interface HRCandidateTagCreate {
  name: string;
}

export interface HRUserShort {
  id: number;
  full_name: string | null;
  email: string;
}

// ─── Дашборд ──────────────────────────────────────────────────────
export interface HRDashboardNewApplication {
  application_id: number;
  vacancy_id: number;
  vacancy_title: string;
  candidate_id: number;
  status: string;
  created_at: string;
}

export interface HRDashboardUnreadNotification {
  id: number;
  message: string;
  created_at: string;
}

export interface HRDashboardStaleVacancy {
  vacancy_id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  last_application_at: string | null;
}

export interface HRDashboardConfig {
  days_new: number;
  days_stale: number;
}

export interface HRDashboardView {
  now: string;
  new_applications: HRDashboardNewApplication[];
  unread_notifications: HRDashboardUnreadNotification[];
  stale_vacancies: HRDashboardStaleVacancy[];
  config: HRDashboardConfig;
}

// ─── Сохраненные поиски ──────────────────────────────────────────────────────
export interface HRSavedSearch {
  id: number;
  name: string;
  skills: string[];          
  city: string | null;
  has_resume: boolean | null;
  is_active: boolean | null;
  is_blocked: boolean | null;
  vacancy_id: number | null;
  min_match_score: number | null;
  search_text: string | null;
  created_at: string;
}

export interface HRSavedSearchCreate {
  name: string;
  skills: string[];
  city?: string | null;
  has_resume?: boolean | null;
  is_active?: boolean | null;
  is_blocked?: boolean | null;
  vacancy_id?: number | null;
  min_match_score?: number | null;
  search_text?: string | null;
}
