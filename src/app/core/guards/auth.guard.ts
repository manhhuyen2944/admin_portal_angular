import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { AppRole } from '../../shared/components/role-badge/role-badge';

/**
 * authGuard — ensures user is authenticated before activating route.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * roleGuard — ensures user has at least one of the required roles.
 *
 * Usage in routes:
 *   { path: 'admin', canActivate: [roleGuard(['admin', 'super_admin'])] }
 */
export const roleGuard = (allowedRoles: AppRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    return router.createUrlTree(['/403']);
  };
};

/**
 * permissionGuard — ensures user has all required permissions.
 *
 * Usage in routes:
 *   { path: 'users', canActivate: [permissionGuard(['manage_users'])] }
 */
export const permissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(requiredPermissions)) {
      return true;
    }

    return router.createUrlTree(['/403']);
  };
};
