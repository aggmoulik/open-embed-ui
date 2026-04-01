import type { User, Contribution } from '@/types';

// --- Error types ---

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: { error: string },
  ) {
    super(body.error);
    this.name = 'ApiError';
  }
}

// --- Core fetch wrapper ---

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : path;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[api] ${init?.method ?? 'GET'} ${path}`);
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, res.statusText, body);
  }

  return res.json();
}

// --- Response types ---

interface PaginatedResponse<T> {
  data: T[];
  pagination: { limit: number; offset: number; total: number };
  filters: Record<string, string | null>;
}

interface DataResponse<T> {
  data: T;
}

interface SyncResponse {
  message: string;
  contributionsSynced: number;
  reposScanned: number;
}

// --- Contributions ---

export interface ContributionFilters {
  repo?: string;
  timeRange?: 'week' | 'month' | 'year' | 'all';
  limit?: number;
  offset?: number;
}

export function fetchContributions(filters?: ContributionFilters) {
  const params = new URLSearchParams();
  if (filters?.repo) params.set('repo', filters.repo);
  if (filters?.timeRange) params.set('timeRange', filters.timeRange);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));

  const qs = params.toString();
  return apiFetch<PaginatedResponse<Contribution>>(`/api/contributions${qs ? `?${qs}` : ''}`);
}

export function fetchContribution(id: string) {
  return apiFetch<Contribution>(`/api/contributions/${id}`);
}

export function syncContributions() {
  return apiFetch<SyncResponse>('/api/contributions/sync', { method: 'POST' });
}

// --- Profile ---

export function fetchProfile() {
  return apiFetch<DataResponse<User>>('/api/profile');
}

export function updateProfile(data: Partial<Pick<User, 'name' | 'image'>>) {
  return apiFetch<DataResponse<User>>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
