// services/workspaceApi.ts

export interface Workspace {
  // --- Core ---
  id: number;
  name: string;
  color: string;
  role: string;
  plan: string;
  members: number;
  projects: number;
  
  // --- Settings Schema (Matching your DB) ---
  timezone: string;
  default_language: string;
  notify_on_publish: boolean;
  notify_on_failure: boolean;
  weekly_report: boolean;
  default_platforms: string[]; // JSON array in DB
}

// Mock Data with the new fields
let MOCK_DB: Workspace[] = [
  { 
    id: 1, 
    name: 'Stark Industries', 
    role: 'Owner', 
    plan: 'Pro', 
    color: '#3C48F6', 
    members: 12, 
    projects: 8,
    // New Settings
    timezone: 'America/New_York',
    default_language: 'en',
    notify_on_publish: true,
    notify_on_failure: true,
    weekly_report: false,
    default_platforms: ['linkedin', 'twitter']
  },
  // ... add more mock data if needed
];

const DELAY = 600;

// ... Keep getWorkspaces, createWorkspace, etc. exactly the same as before ...
// Just ensure the createWorkspace function initializes these new fields with defaults:

export const getWorkspaces = async (): Promise<Workspace[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB]), DELAY));
};

export const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newWs: Workspace = {
        id: Math.random(),
        name: data.name || 'Untitled',
        role: 'Owner',
        plan: 'Free',
        members: 1,
        projects: 0,
        color: data.color || '#3C48F6',
        // Defaults for new schema
        timezone: data.timezone || 'UTC',
        default_language: 'en',
        notify_on_publish: true,
        notify_on_failure: true,
        weekly_report: true,
        default_platforms: []
      };
      MOCK_DB.push(newWs);
      resolve(newWs);
    }, DELAY);
  });
};

export const updateWorkspace = async (id: number, data: Partial<Workspace>): Promise<Workspace> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_DB = MOCK_DB.map(ws => ws.id === id ? { ...ws, ...data } : ws);
      resolve(MOCK_DB.find(ws => ws.id === id)!);
    }, DELAY);
  });
};

export const deleteWorkspace = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_DB = MOCK_DB.filter(ws => ws.id !== id);
      resolve();
    }, DELAY);
  });
};