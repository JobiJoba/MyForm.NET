import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '@/types/simpleForm';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = {
        message: getUserFriendlyMessage(error),
        errors: extractValidationErrors(error),
        statusCode: error.status
      };

      // Handle specific status codes
      if (error.status === 401) {
        // Auth guard will handle redirect
        // Could inject auth service here to logout
      } else if (error.status === 403) {
        snackBar.open('Access denied. You do not have permission.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      } else if (error.status >= 500) {
        snackBar.open('Server error. Please try again later.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => apiError);
    })
  );
};

function getUserFriendlyMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.status === 400) {
    const validationErrors = extractValidationErrors(error);
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0]?.[0];
      if (firstError) return firstError;
    }
    return error.error?.message || 'Invalid request. Please check your input.';
  }
  
  if (error.status === 401) {
    return 'You are not authorized. Please log in.';
  }
  
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.status === 408) {
    return 'Request timeout. Please try again.';
  }
  
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment.';
  }
  
  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return error.error?.message || `An unexpected error occurred. (${error.status || 'Unknown'})`;
}

function extractValidationErrors(error: HttpErrorResponse): Record<string, string[]> | undefined {
  if (error.error?.errors && typeof error.error.errors === 'object') {
    return error.error.errors;
  }
  return undefined;
}
