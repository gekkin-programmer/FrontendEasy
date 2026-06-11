import { api } from '@/lib/api';

export interface Board {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    columns: number;
  };
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  cards?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  columnId: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    avatar?: string;
  };
  labels?: CardLabel[];
  _count?: {
    comments: number;
  };
  comments?: CardComment[];
  activities?: CardActivity[];
  postId?: string;
  column?: {
    id: string;
    name: string;
  };
}

export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

export interface CardComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    avatar?: string;
  };
}

export interface CardActivity {
  id: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    avatar?: string;
  };
}

export const boardApi = {
  // BOARDS
  getBoards: (workspaceId: string) => 
    api.get<Board[]>(`/boards/workspace/${workspaceId}`),

  getBoardDetails: (boardId: string) => 
    api.get<Board>(`/boards/${boardId}`),

  createBoard: (workspaceId: string, data: { name: string; description?: string; color?: string }) => 
    api.post<Board>(`/boards/workspace/${workspaceId}`, data),

  updateBoard: (boardId: string, data: Partial<Board>) => 
    api.patch<Board>(`/boards/${boardId}`, data),

  deleteBoard: (boardId: string) => 
    api.delete(`/boards/${boardId}`),

  // COLUMNS
  createColumn: (boardId: string, data: { name: string; order?: number }) => 
    api.post<BoardColumn>(`/boards/${boardId}/columns`, data),

  updateColumn: (columnId: string, data: { name?: string; order?: number }) => 
    api.patch<BoardColumn>(`/boards/columns/${columnId}`, data),

  deleteColumn: (columnId: string) => 
    api.delete(`/boards/columns/${columnId}`),

  // CARDS
  createCard: (columnId: string, data: Record<string, unknown>) =>
    api.post<Card>(`/boards/columns/${columnId}/cards`, data),

  getCardDetails: (cardId: string) =>
    api.get<Card>(`/boards/cards/${cardId}`),

  updateCard: (cardId: string, data: Record<string, unknown>) =>
    api.patch<Card>(`/boards/cards/${cardId}`, data),

  moveCard: (cardId: string, data: { columnId: string; order: number }) => 
    api.patch<Card>(`/boards/cards/${cardId}/move`, data),

  addComment: (cardId: string, content: string) => 
    api.post<CardComment>(`/boards/cards/${cardId}/comments`, { content }),

  convertToPost: (cardId: string) =>
    api.post<unknown>(`/boards/cards/${cardId}/convert-to-post`, {}),
};
