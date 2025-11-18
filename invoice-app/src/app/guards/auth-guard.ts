import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login for protected routes
  // Note: login and signup routes don't use this guard, so no redirect loop
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
