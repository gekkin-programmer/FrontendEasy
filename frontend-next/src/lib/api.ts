// src/lib/api.ts

import { getCookie, deleteCookie } from 'cookies-next';

// 1. Ensure the URL doesn't have a trailing slash to avoid double slashes (e.g., //posts)
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://easypostv2.onrender.com/api').replace(/\/$/, '');

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = {
  // ... rest of methods
};

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // 1. Clean endpoint string (ensure it starts with /)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // 2. Token Injection (Using cookies for Middleware compatibility)
  const token = getCookie('accessToken');
  const headers: Record<string, string> = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });

    // 3. Handle 401 Unauthorized (Session Expired)
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        console.warn("SESSION_EXPIRED :: Redirecting to login");
        deleteCookie('accessToken'); // Clear the bad token
        // Optimization: only redirect if we aren't already on the login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?reason=expired';
        }
      }
      throw new Error('UNAUTHORIZED');
    }

    // 4. Handle Empty Content (204 No Content)
    if (response.status === 204) return {} as T;

    // 5. Parse JSON
    const data = await response.json().catch(() => ({}));

    // 6. Handle Logic Errors
    if (!response.ok) {
        // Log the error for production monitoring
        console.error(`API_ERROR [${response.status}] ${url}`, data);
        throw new Error(data.message || `API_ERR_${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    // 7. Handle Network Errors (Common on 3G in Yaoundé)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
       console.error("NETWORK_DISCONNECTED :: Check 3G/Fiber status");
       throw new Error('NETWORK_OFFLINE');
    }
    throw error;
  }
}