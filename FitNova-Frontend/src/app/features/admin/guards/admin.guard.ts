import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isAuthenticated = this.adminAuthService.isAuthenticated();
    
    console.log('AdminGuard - isAuthenticated:', isAuthenticated);
    console.log('AdminGuard - token:', this.adminAuthService.adminToken);
    
    if (isAuthenticated) {
      return true;
    } else {
      console.log('AdminGuard - Redirecting to /admin/auth/login');
      this.router.navigate(['/admin/auth/login']);
      return false;
    }
  }
}
