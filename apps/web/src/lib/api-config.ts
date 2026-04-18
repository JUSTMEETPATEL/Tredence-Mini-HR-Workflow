// ── API Config — resolves base URL based on API_MODE ──
// In mock mode, fetches are intercepted by MSW on the same origin.
// In real mode, fetches go to the configured API_BASE_URL.

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Returns the full URL for an API endpoint.
 * - mock mode: `/api/automations` (intercepted by MSW)
 * - real mode: `http://localhost:4000/api/automations`
 */
export function apiUrl(path: string): string {
  if (API_MODE === 'mock') {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  return `${API_BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
}

export { API_MODE, API_BASE_URL };
