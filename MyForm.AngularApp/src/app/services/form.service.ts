import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SimpleForms, CreateFormRequest, CreateFormResponse, ApiError } from '@/types/simpleForm';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'api/forms';

  getAllForms(): Observable<SimpleForms> {
    return this.http.get<SimpleForms>(this.apiUrl).pipe(
      catchError(this.handleError<SimpleForms>('getAllForms'))
    );
  }

  createForm(request: CreateFormRequest): Observable<CreateFormResponse> {
    return this.http.post<CreateFormResponse>(this.apiUrl, request).pipe(
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
      
      console.error(`${operation} failed:`, error);
      return throwError(() => apiError);
    };
  }

  private getUserFriendlyMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }
    
    if (error.status === 400) {
      return 'Invalid form data. Please check your input and try again.';
    }
    
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error.status === 500) {
      return 'A server error occurred. Please try again later.';
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    return `An unexpected error occurred (${error.status}). Please try again.`;
  }

  private extractValidationErrors(error: HttpErrorResponse): Record<string, string[]> | undefined {
    if (error.error?.errors && typeof error.error.errors === 'object') {
      return error.error.errors;
    }
    return undefined;
  }
}

