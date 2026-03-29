import { api } from '@/src/lib/api';

export interface AiResponse {
  messageId: string;
  response: string; // For chat
  content?: string; // For copywriting
}

export interface FeedbackDto {
  messageId: string;
  rating: number; // 1 or -1
  comment?: string;
}

export const aiApi = {
  // 1. Voice Command (Audio Upload)
  transcribeAndParse: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'command.webm');
    
    // Adjust endpoint based on your backend route for voice intent
    const response = await api.post<Record<string, unknown>>('/ai/command', formData);
    return response;
  },

  // 2. Support Chat
  chatWithSupport: async (message: string): Promise<AiResponse> => {
    const response = await api.post<AiResponse>('/ai/chat', { message });
    return response;
  },

  // 3. Marketing Copy
  generateCopy: async (product: string, tone: string) => {
    const response = await api.post<Record<string, unknown>>('/ai/test-copywriting', {
      product, 
      tone 
    });
    return response; // Expecting { messageId, content }
  },

  // 4. Feedback Loop (Phase 5 Requirement)
  sendFeedback: async (data: FeedbackDto) => {
    return await api.post('/ai/feedback', data);
  }
};