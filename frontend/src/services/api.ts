const TOKEN_KEY = 'northstar_auth_token';
const USER_KEY = 'northstar_user_data';

export interface User {
  id: number;
  email: string;
  tenantId: number;
  tenantName: string;
}

export interface AssetClassSummary {
  assetClass: string;
  marketValue: number;
}

export interface DashboardResponse {
  tenantId: number;
  tenantName: string;
  userEmail: string;
  hasData: boolean;
  startDate: string | null;
  endDate: string | null;
  startMarketValue: number;
  endMarketValue: number;
  periodReturn: number;
  assetClasses: AssetClassSummary[];
}

export interface CSVRowError {
  row: number;
  message: string;
}

export interface UploadResponse {
  message: string;
  rowsImported: number;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status: number; errors?: CSVRowError[] };
    err.status = response.status;
    if (data.errors) {
      err.errors = data.errors;
    }
    throw err;
  }

  return data as T;
}

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token, data.user);
  return data;
}

export async function fetchDashboardApi(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/api/dashboard');
}

export async function uploadCSVHoldingsApi(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return request<UploadResponse>('/api/holdings/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function resetHoldingsApi(): Promise<{ message: string }> {
  return request<{ message: string }>('/api/holdings', {
    method: 'DELETE',
  });
}

