import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Check if this is a login or register request
        const isLoginRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');
        
        // Don't clear session or redirect for login/register failures
        // Let the component handle the error display
        if (!isLoginRequest) {
          // Check if this is an admin route
          const isAdminRoute = req.url.includes('/admin/');
          
          if (isAdminRoute) {
            // Admin unauthorized on protected route - clear admin session and redirect
            localStorage.removeItem('admin_token');
            localStorage.removeItem('adminUser');
            router.navigate(['/admin/auth/login']);
          } else {
            // User unauthorized on protected route - clear user session and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.navigate(['/auth/login']);
          }
        }
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

