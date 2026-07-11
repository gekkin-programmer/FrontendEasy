// src/services/workspaceApi.ts

// 1. Update the Interface to include 'plan' and notification settings
export interface Workspace {
  id: number;
  name: string;
  role: string;
  members: number;
  projects: number;
  color: string;
  default_platforms: string[];
  timezone: string;
  default_language: string;
  plan?: 'free' | 'starter' | 'pro' | 'agency' | 'enterprise'; 
  notify_on_publish?: boolean;
  notify_on_failure?: boolean;
  weekly_report?: boolean;
}

const STORAGE_KEY = 'workspaces_db';

export const getWorkspaces = async (): Promise<Workspace[]> => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createWorkspace = async (ws: Partial<Workspace>) => {
  const current = await getWorkspaces();
  
  const newWs: Workspace = { 
    ...ws, 
    id: Date.now(),
    role: 'Owner',
    members: 1, 
    projects: 0,
    name: ws.name || 'Untitled', 
    color: ws.color || '#174CD2',
    // Default values
    plan: ws.plan || 'free',
    notify_on_publish: true
  } as Workspace;
  
  const updated = [...current, newWs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newWs;
};

export const updateWorkspace = async (id: number, data: Partial<Workspace>) => {
  const current = await getWorkspaces();
  const updated = current.map(w => w.id === id ? { ...w, ...data } : w);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.find(w => w.id === id);
};

export const deleteWorkspace = async (id: number) => {
  const current = await getWorkspaces();
  const updated = current.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
};