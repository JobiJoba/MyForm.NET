import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, retry, timer } from 'rxjs';
import { SimpleForms, CreateFormRequest, CreateFormResponse } from '@/types/simpleForm';
import { API_ENDPOINTS } from '@/app/config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private http = inject(HttpClient);

  getAllForms(): Observable<SimpleForms> {
    return this.http.get<SimpleForms>(API_ENDPOINTS.FORMS.GET_ALL).pipe(
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
      })
    );
  }

  createForm(request: CreateFormRequest): Observable<CreateFormResponse> {
    return this.http.post<CreateFormResponse>(API_ENDPOINTS.FORMS.CREATE, request).pipe(
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
      })
    );
  }

  deleteForm(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.FORMS.DELETE(id)).pipe(
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
      })
    );
  }
}

