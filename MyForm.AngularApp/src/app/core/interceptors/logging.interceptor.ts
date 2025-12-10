import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  if (!isDevMode()) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: (response: HttpEvent<unknown>) => {
        const duration = Date.now() - startTime;
        if (response instanceof HttpResponse) {
          console.log(`[HTTP] ${req.method} ${req.url} - ${response.status} (${duration}ms)`);
        } else {
          console.log(`[HTTP] ${req.method} ${req.url} - ${response.type} (${duration}ms)`);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`[HTTP] ${req.method} ${req.url} - Error ${error.status || 'Unknown'} (${duration}ms)`, error);
      }
    })
  );
};
