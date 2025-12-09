import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, retry, finalize, timer } from 'rxjs';
import { SimpleForms, CreateFormRequest, CreateFormResponse, ApiError } from '@/types/simpleForm';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'api/forms';

  getAllForms(): Observable<SimpleForms> {
    return this.http.get<SimpleForms>(this.apiUrl).pipe(
      retry({
        count: 3,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
            return throwError(() => error);
          }
          // Exponential backoff: 1s, 2s, 4s
          return timer(Math.min(1000 * Math.pow(2, retryCount - 1), 4000));
        }
      }),
      catchError(this.handleError<SimpleForms>('getAllForms'))
    );
  }

  createForm(request: CreateFormRequest): Observable<CreateFormResponse> {
    return this.http.post<CreateFormResponse>(this.apiUrl, request).pipe(
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
            return throwError(() => error);
          }
          // Exponential backoff: 1s, 2s
          return timer(Math.min(1000 * Math.pow(2, retryCount - 1), 2000));
        }
      }),
      catchError(this.handleError<CreateFormResponse>('createForm'))
    );
  }

  private handleError<T>(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const apiError: ApiError = {
        message: this.getUserFriendlyMessage(error),
        errors: this.extractValidationErrors(error),
        statusCode: error.status
      };
      
      // Log error in development only (could use environment check)
      if (typeof window !== 'undefined' && !window.location.hostname.includes('production')) {
        console.error(`${operation} failed:`, error);
      }
      
      return throwError(() => apiError);
    };
  }

  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    // Network errors (no response from server)
    if (error.status === 0) {
      if (error.error instanceof ErrorEvent) {
        // Client-side network error
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      // CORS or other network issues
      return 'Network error. Please check your connection and try again.';
    }
    
    // HTTP 400 - Bad Request
    if (error.status === 400) {
      const validationErrors = this.extractValidationErrors(error);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        // Return first validation error if available
        const firstError = Object.values(validationErrors)[0]?.[0];
        if (firstError) {
          return firstError;
        }
      }
      return error.error?.message || 'Invalid form data. Please check your input and try again.';
    }
    
    // HTTP 401 - Unauthorized
    if (error.status === 401) {
      return 'You are not authorized to perform this action. Please log in and try again.';
    }
    
    // HTTP 403 - Forbidden
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    // HTTP 404 - Not Found
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    
    // HTTP 408 - Request Timeout
    if (error.status === 408) {
      return 'The request took too long. Please try again.';
    }
    
    // HTTP 429 - Too Many Requests
    if (error.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    // HTTP 500-599 - Server Errors
    if (error.status >= 500 && error.status < 600) {
      return 'A server error occurred. Our team has been notified. Please try again later.';
    }
    
    // Try to get message from error response
    if (error.error?.message) {
      return error.error.message;
    }
    
    // Generic error for unknown status codes
    return `An unexpected error occurred. Please try again. ${error.status ? `(Error ${error.status})` : ''}`;
  }

  private extractValidationErrors(error: HttpErrorResponse): Record<string, string[]> | undefined {
    if (error.error?.errors && typeof error.error.errors === 'object') {
      return error.error.errors;
    }
    return undefined;
  }
}

