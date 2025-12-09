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
   * Forms endpoints (API v1)
   */
  FORMS: {
    BASE: `${environment.apiBaseUrl}/v1/forms`,
    GET_ALL: `${environment.apiBaseUrl}/v1/forms`,
    CREATE: `${environment.apiBaseUrl}/v1/forms`
  }
} as const;

