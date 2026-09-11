import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (expectedRole: UserRole): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentRole = authService.userRole();

    if (currentRole === expectedRole) {
      return true;
    }

    if (!currentRole) {
      router.navigate(['/login']);
      return false;
    }

    // Role mismatch, redirect to appropriate role dashboard
    if (currentRole === 'teacher') router.navigate(['/teacher/dashboard']);
    else if (currentRole === 'student') router.navigate(['/student/dashboard']);
    else if (currentRole === 'admin') router.navigate(['/admin/dashboard']);
    else router.navigate(['/']);

    return false;
  };
};
