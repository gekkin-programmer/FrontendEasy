import axios from 'axios';

// 1. Create the Axios Instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for Cookies (Auth)
});

// 2. Add Interceptor to attach Token (Bearer Auth)
api.interceptors.request.use((config) => {
  // Try to get token from localStorage or Cookies
  // Adjust this based on how you store your token
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Add Response Interceptor (Optional: Handle 401 globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if token expired
      if (typeof window !== 'undefined') {
        // window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(String(error)));
  },
);

// 4. Helper for File Uploads (Multipart)
api.upload = async <T>(url: string, formData: FormData): Promise<T> => {
  const response = await api.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Add typescript support for the custom .upload method
declare module 'axios' {
  export interface AxiosInstance {
    upload<T = any>(url: string, data: FormData): Promise<T>;
  }
}
