const BASE = 'http://localhost:4000/api/v1';
const TOKEN_KEY = 'taskflow_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

// ---- API shape types ----

export interface ApiUser {
  id: string; name: string; initials: string; color: string;
  role: string; email: string; createdAt: string;
}

export interface ApiProject {
  id: string; name: string; color: string; createdAt: string;
  members: string[]; taskCount: number;
}

export interface ApiTask {
  id: string; projectId: string; title: string; description?: string;
  status: string; priority: string; assigneeId?: string;
  dueDate?: string; createdAt: string; labels: string[]; commentCount: number;
}

export interface ApiComment {
  id: string; taskId: string; text: string; createdAt: string;
  author: { id: string; name: string; initials: string; color: string };
}

// ---- API methods ----

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role: string, color: string) =>
    request<{ token: string; user: ApiUser }>('POST', '/auth/register', { name, email, password, role, color }),
  me: () => request<{ user: ApiUser }>('GET', '/auth/me'),

  // Users — GET is public (no token needed)
  getUsers: () => request<{ users: ApiUser[] }>('GET', '/users'),
  updateUser: (id: string, data: { name?: string; role?: string; color?: string }) =>
    request<{ user: ApiUser }>('PATCH', `/users/${id}`, data),

  // Projects
  getProjects: () => request<{ projects: ApiProject[] }>('GET', '/projects'),
  createProject: (name: string, color: string, memberIds: string[]) =>
    request<{ project: ApiProject }>('POST', '/projects', { name, color, memberIds }),
  updateProject: (id: string, name: string, color: string, memberIds: string[]) =>
    request<{ project: ApiProject }>('PATCH', `/projects/${id}`, { name, color, memberIds }),
  deleteProject: (id: string) => request<void>('DELETE', `/projects/${id}`),
  reorderProjects: (startIndex: number, endIndex: number) =>
    request<{ projects: ApiProject[] }>('PATCH', '/projects/reorder', { startIndex, endIndex }),

  // Tasks
  getTasks: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ tasks: ApiTask[] }>('GET', `/tasks${qs}`);
  },
  createTask: (data: Omit<ApiTask, 'id' | 'createdAt' | 'commentCount'>) =>
    request<{ task: ApiTask }>('POST', '/tasks', data),
  updateTask: (id: string, data: Partial<ApiTask>) =>
    request<{ task: ApiTask }>('PATCH', `/tasks/${id}`, data),
  moveTask: (id: string, status: string) =>
    request<{ task: ApiTask }>('PATCH', `/tasks/${id}/move`, { status }),
  deleteTask: (id: string) => request<void>('DELETE', `/tasks/${id}`),
  bulkDelete: (ids: string[]) => request<void>('DELETE', '/tasks/bulk', { ids }),
  bulkMoveStatus: (ids: string[], status: string) =>
    request<{ updated: number }>('PATCH', '/tasks/bulk/status', { ids, status }),
  bulkUnassign: (ids: string[]) =>
    request<{ updated: number }>('PATCH', '/tasks/bulk/unassign', { ids }),

  // Comments
  getAllComments: () => request<{ comments: ApiComment[] }>('GET', '/comments'),
  createComment: (taskId: string, text: string) =>
    request<{ comment: ApiComment }>('POST', `/tasks/${taskId}/comments`, { text }),
};
