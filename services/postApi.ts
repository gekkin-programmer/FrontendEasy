import { api } from '@/src/lib/api';

export const createPost = async (params: {
  content: string;
  status?: string;
  scheduledFor?: string;
  socialAccountIds: string[];
  mediaIds?: string[];
  workspaceId?: string;
}) => {
  const { workspaceId, ...body } = params;
  const endpoint = workspaceId ? `/posts?workspaceId=${workspaceId}` : '/posts';
  return api.post<Record<string, unknown>>(endpoint, body);
};
