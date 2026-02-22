import { api } from '@/src/lib/api';

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  // Membership fields returned by backend
  role?: string;
  members?: number;
  projects?: number;
  // UI preference fields (optional, stored separately)
  color?: string;
  default_platforms?: string[];
  timezone?: string;
  default_language?: string;
  plan?: 'free' | 'starter' | 'pro' | 'agency' | 'enterprise';
  notify_on_publish?: boolean;
  notify_on_failure?: boolean;
  weekly_report?: boolean;
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  return api.get<Workspace[]>('/workspaces');
};

export const createWorkspace = async (ws: Partial<Workspace>): Promise<Workspace> => {
  return api.post<Workspace>('/workspaces', {
    name: ws.name,
    description: ws.description,
    logo: ws.logo,
    website: ws.website,
  });
};

export const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
  return api.patch<Workspace>(`/workspaces/${id}`, data);
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  return api.delete<void>(`/workspaces/${id}`);
};
