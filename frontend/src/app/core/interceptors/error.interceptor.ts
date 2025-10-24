import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }

      // Log erro para debug
      console.error('HTTP Error:', error);

      return throwError(() => error);
    })
  );
};
