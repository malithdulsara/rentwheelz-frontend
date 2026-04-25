import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  const expectedRoles = route.data['roles']; 
  const userRole = authService.getRole();

  if (expectedRoles && Array.isArray(expectedRoles)) {
    if (!expectedRoles.includes(userRole)) {
      router.navigate(['/unauthorized']); 
      return false;
    }
  } 
  else {
    const expectedRole = route.data['role'];
    if (expectedRole && userRole !== expectedRole) {
      router.navigate(['/unauthorized']); 
      return false;
    }
  }

  return true;
};