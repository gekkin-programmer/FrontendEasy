// src/services/projectApi.ts

export interface Project {
  id: string;
  workspaceId: number;
  name: string;
  description: string;
  status: 'active' | 'archived';
  color: string;
  members: number; // Mocking member count
  stats: {
    posts: number;
    engagement: string;
  };
}

// Mock Database
let PROJECTS_DB: Project[] = [
  { 
    id: 'p1', workspaceId: 1, name: 'Q3 Marketing', description: 'Social takeover', 
    status: 'active', color: '#3C48F6', members: 4, stats: { posts: 12, engagement: '+24%' } 
  },
  { 
    id: 'p2', workspaceId: 1, name: 'Website Launch', description: 'Teaser campaign', 
    status: 'active', color: '#10B981', members: 2, stats: { posts: 5, engagement: '+10%' } 
  },
  { 
    id: 'p3', workspaceId: 1, name: 'Old Campaign', description: 'Archive', 
    status: 'archived', color: '#6B7280', members: 1, stats: { posts: 40, engagement: '0%' } 
  }
];

const DELAY = 600;
const MAX_PROJECTS_PER_WORKSPACE = 10; // Feature 10

export const getProjects = async (workspaceId: number): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PROJECTS_DB.filter(p => p.workspaceId === Number(workspaceId)));
    }, DELAY);
  });
};

export const createProject = async (workspaceId: number, data: Partial<Project>): Promise<Project> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const count = PROJECTS_DB.filter(p => p.workspaceId === Number(workspaceId)).length;
      if (count >= MAX_PROJECTS_PER_WORKSPACE) { // Feature 10: Check Limits
        reject('Project limit reached.');
        return;
      }

      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        workspaceId: Number(workspaceId),
        name: data.name || 'New Project',
        description: data.description || '',
        status: 'active',
        color: data.color || '#3C48F6',
        members: 1, // Default owner
        stats: { posts: 0, engagement: '0%' }
      };
      PROJECTS_DB.push(newProject);
      resolve(newProject);
    }, DELAY);
  });
};

export const updateProject = async (projectId: string, data: Partial<Project>): Promise<Project> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      PROJECTS_DB = PROJECTS_DB.map(p => p.id === projectId ? { ...p, ...data } : p);
      resolve(PROJECTS_DB.find(p => p.id === projectId)!);
    }, DELAY);
  });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      PROJECTS_DB = PROJECTS_DB.filter(p => p.id !== projectId);
      resolve();
    }, DELAY);
  });
};

// Feature 6: Archive
export const toggleArchiveProject = async (projectId: string): Promise<Project> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = PROJECTS_DB.find(p => p.id === projectId);
      if (project) {
        project.status = project.status === 'active' ? 'archived' : 'active';
      }
      resolve(project!);
    }, DELAY);
  });
};