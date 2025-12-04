import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 1. Create the instance
const apiClient = axios.create({
  // Ensure this matches your FastAPI URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (Attaches Token)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Handles 401 & 422)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized (Token expired)
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          // Optional: Clear token before redirect
          localStorage.removeItem('token'); 
          window.location.href = '/login';
        }
      }

      // Handle 422 Validation Errors (FastAPI specific)
      if (error.response.status === 422) {
        console.error('FastAPI Validation Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;