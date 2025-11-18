import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // If token exists, attach Authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Redirect to login if API returns 401 (Unauthorized)
      if (error.status === 401) {
        localStorage.removeItem('token');
        // Only redirect if not already on login or signup page to prevent loops
        const currentUrl = router.url;
        if (!currentUrl.includes('/login') && !currentUrl.includes('/signup')) {
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
