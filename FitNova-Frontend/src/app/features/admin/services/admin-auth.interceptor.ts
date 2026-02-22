import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const adminAuthService = inject(AdminAuthService);
  
  console.log('AdminAuthInterceptor - Request URL:', req.url);
  console.log('AdminAuthInterceptor - Is admin route:', req.url.includes('/admin/'));
  
  // Only add admin token for admin routes
  if (req.url.includes('/admin/')) {
    const adminToken = adminAuthService.adminToken;
    console.log('AdminAuthInterceptor - Admin token:', adminToken ? 'exists' : 'null');
    
    if (adminToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      console.log('AdminAuthInterceptor - Added Authorization header');
    }
  }

  return next(req);
};
