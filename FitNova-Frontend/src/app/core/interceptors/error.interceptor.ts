import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      } else if (error.status === 400) {
        // Validation errors - let component handle display
        console.error('Validation error:', error.error);
      } else if (error.status === 500) {
        // Server error
        console.error('Server error:', error.message);
      }
      
      return throwError(() => error);
    })
  );
};
