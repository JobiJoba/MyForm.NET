import { environment } from '@/environments/environment';

/**
 * Centralized API endpoints configuration
 */
export const API_ENDPOINTS = {
  /**
   * Base API URL from environment configuration
   */
  BASE_URL: environment.apiBaseUrl,

  /**
   * Forms endpoints
   */
  FORMS: {
    BASE: `${environment.apiBaseUrl}/forms`,
    GET_ALL: `${environment.apiBaseUrl}/forms`,
    CREATE: `${environment.apiBaseUrl}/forms`
  }
} as const;

