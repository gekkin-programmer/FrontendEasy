// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = {
  // 1. GET Request
  get: async <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'GET' });
  },

  // 2. POST Request (JSON)
  post: async <T>(endpoint: string, body: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  // 3. POST Request (File Upload / FormData)
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    return request<T>(endpoint, {
      method: 'POST',
      // Note: Content-Type is auto-set by browser for FormData
      body: formData,
    });
  },

  // 4. PATCH Request
  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  // 5. DELETE Request
  delete: async <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

// --- INTERNAL HELPER ---
async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // 1. Get Token from Storage
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  // 2. Attach Headers
  const headers: Record<string, string> = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Make the call
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Handle Auth Errors (Token Expired)
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      console.error("Session expired. Logging out...");
      // localStorage.clear(); // Optional: clear data
      // window.location.href = '/login'; // Force redirect
    }
    throw new Error('Unauthorized');
  }

  // 5. Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // 6. Return Data
  return response.json();
}