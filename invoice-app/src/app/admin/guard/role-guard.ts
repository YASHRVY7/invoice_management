import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const userRole = authService.getRole();
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
