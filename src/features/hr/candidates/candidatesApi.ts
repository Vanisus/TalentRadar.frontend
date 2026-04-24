// src/features/hr/candidates/candidatesApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '@/shared/api';
import {
  type HRCandidate,
  type HRCandidateNote,
  type HRCandidateNoteCreate,
  type HRCandidateTag,
  type HRCandidateTagCreate,
  type HRSavedSearch,
  type HRSavedSearchCreate,
} from '../types';



// ─── Кандидаты (базовый список) ──────────────────────────────────────────────

export function useHRCandidates() {
  return useQuery<HRCandidate[]>({
    queryKey: ['hr', 'candidates'],
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<HRCandidate[]>('/hr/candidates'),
  });
}

// ─── Заметки по кандидату ────────────────────────────────────────────────────

export function useCandidateNotes(candidateId: number | null) {
  return useQuery<HRCandidateNote[]>({
    queryKey: ['hr', 'candidateNotes', candidateId],
    enabled: candidateId != null && !!getAuthToken(),
    queryFn: () =>
      apiFetch<HRCandidateNote[]>(`/hr/candidates/${candidateId}/notes`),
  });
}

export function useCreateCandidateNote() {
  const qc = useQueryClient();
  return useMutation<
    HRCandidateNote,
    Error,
    { candidateId: number; data: HRCandidateNoteCreate }
  >({
    mutationFn: ({ candidateId, data }) =>
      apiFetch<HRCandidateNote>(`/hr/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ['hr', 'candidateNotes', variables.candidateId],
      });
    },
  });
}

export function useDeleteCandidateNote() {
  const qc = useQueryClient();
  return useMutation<void, Error, { candidateId: number; noteId: number }>({
    mutationFn: ({ candidateId, noteId }) =>
      apiFetch<void>(
        `/hr/candidates/${candidateId}/notes/${noteId}`,
        { method: 'DELETE' },
      ),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ['hr', 'candidateNotes', variables.candidateId],
      });
    },
  });
}

// ─── Теги кандидата ──────────────────────────────────────────────────────────

export function useCandidateTags(candidateId: number | null) {
  return useQuery<HRCandidateTag[]>({
    queryKey: ['hr', 'candidateTags', candidateId],
    enabled: candidateId != null && !!getAuthToken(),
    queryFn: () =>
      apiFetch<HRCandidateTag[]>(`/hr/candidates/${candidateId}/tags`),
  });
}

export function useCreateCandidateTag() {
  const qc = useQueryClient();
  return useMutation<
    HRCandidateTag,
    Error,
    { candidateId: number; data: HRCandidateTagCreate }
  >({
    mutationFn: ({ candidateId, data }) =>
      apiFetch<HRCandidateTag>(`/hr/candidates/${candidateId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ['hr', 'candidateTags', variables.candidateId],
      });
    },
  });
}

export function useDeleteCandidateTag() {
  const qc = useQueryClient();
  return useMutation<void, Error, { candidateId: number; tagId: number }>({
    mutationFn: ({ candidateId, tagId }) =>
      apiFetch<void>(
        `/hr/candidates/${candidateId}/tags/${tagId}`,
        { method: 'DELETE' },
      ),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ['hr', 'candidateTags', variables.candidateId],
      });
    },
  });
}

// ─── Сохранённые поиски кандидатов ──────────────────────────────────────────

export function useSavedSearches() {
  return useQuery<HRSavedSearch[]>({
    queryKey: ['hr', 'savedSearches'],
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<HRSavedSearch[]>('/hr/candidates/searches'),
  });
}

export function useCreateSavedSearch() {
  const qc = useQueryClient();
  return useMutation<HRSavedSearch, Error, HRSavedSearchCreate>({
    mutationFn: (payload) =>
      apiFetch<HRSavedSearch>('/hr/candidates/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'savedSearches'] });
    },
  });
}

export function useDeleteSavedSearch() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/hr/candidates/searches/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'savedSearches'] });
    },
  });
}

export function useRunSavedSearch() {
  return useMutation<HRCandidate[], Error, number>({
    mutationFn: (id) =>
      apiFetch<HRCandidate[]>(
        `/hr/candidates/searches/${id}/run`,
      ),
  });
}
