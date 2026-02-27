/**
 * API Client Configuration
 *
 * Development: Uses VITE_API_BASE_URL from .env.development (proxied by Vite)
 * Production: Uses VITE_API_BASE_URL from .env.production (full URL to backend)
 *
 * This abstraction allows seamless switching between:
 * - Development: http://localhost:8080 (via Vite proxy)
 * - Production: https://api.yourdomain.com (direct to backend)
 *
 * Authentication: Uses JWT tokens stored in localStorage
 * JWT token is sent in Authorization header for protected endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_STORAGE_KEY = 'auth_token';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Get stored JWT token
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Store JWT token
const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

// Remove JWT token
const removeToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const apiClient = {
  baseUrl: API_BASE_URL,

  async fetch(
    endpoint: string,
    options?: FetchOptions
  ): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { timeout = 10000, ...fetchOptions } = options || {};

    // Ensure headers is an object for easier manipulation
    if (!fetchOptions.headers) {
      fetchOptions.headers = {};
    }

    const headers = fetchOptions.headers as Record<string, string>;

    // Add Content-Type for POST requests if not present
    if (
      fetchOptions.method?.toUpperCase() === 'POST' &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    // Add JWT token to Authorization header if available (and not login endpoint)
    const token = getStoredToken();
    if (token && !headers['Authorization'] && !endpoint.includes('/credential/login')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetchOptions.headers = headers;

    // Add timeout capability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },
};

export { storeToken, removeToken, getStoredToken };
export default apiClient;
