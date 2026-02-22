import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

/**
 * Guard to protect user routes
 * Ensures only authenticated users can access user-specific pages
 */
export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if USER is logged in
  if (authService.isAuthenticated()) {
    console.log('UserGuard - User is authenticated, allowing access to:', state.url);
    return true;
  }

  // User not logged in, redirect to login
  console.log('UserGuard - User not authenticated, redirecting to login');
  router.navigate(['/auth/login']);
  return false;
};
