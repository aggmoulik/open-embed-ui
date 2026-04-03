import type { User, Contribution, Widget, WidgetConfig } from '@/types';

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

// --- Widgets ---

export function fetchWidgets() {
  return apiFetch<PaginatedResponse<Widget>>('/api/widgets');
}

export function fetchWidget(id: string) {
  return apiFetch<DataResponse<Widget>>(`/api/widgets/${id}`);
}

export function createWidget(data: { name: string; description?: string; config: WidgetConfig }) {
  return apiFetch<DataResponse<Widget>>('/api/widgets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateWidget(
  id: string,
  data: Partial<{ name: string; description: string; config: WidgetConfig; isPublic: boolean }>,
) {
  return apiFetch<DataResponse<Widget>>(`/api/widgets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteWidget(id: string) {
  return apiFetch<{ message: string }>(`/api/widgets/${id}`, { method: 'DELETE' });
}

// --- Account ---

export function deleteAccount() {
  return apiFetch<{ message: string }>('/api/account', { method: 'DELETE' });
}
