import { api } from '@/lib/api';

interface CreatePostData {
  content: string;
  status: string;
  scheduledTime?: string;
  channels: string[];
}

export const createPost = async (postData: CreatePostData, file?: File | null) => {
  const formData = new FormData();

  // 1. Append simple text fields
  formData.append('content', postData.content);
  formData.append('status', postData.status);
  
  if (postData.scheduledTime) {
    formData.append('scheduled_time', postData.scheduledTime);
  }

  // 2. Append Array data (FastAPI expects repeated keys for lists in FormData)
  // e.g. channels=['twitter', 'linkedin'] -> channels=twitter&channels=linkedin
  postData.channels.forEach((channel: string) => {
    formData.append('channels', channel);
  });

  // 3. Append the File (if exists)
  if (file) {
    // 'file' must match the name of the argument in your FastAPI function: file: UploadFile = File(...)
    formData.append('file', file); 
  }

  // 4. Send to Backend
  const response = await api.post<unknown>('/posts', formData);
  return response;
};