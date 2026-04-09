import { AuthService } from './../../modules/auth/services/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService =inject(AuthService) ;
  const router =inject(Router);

  if (authService.isLoggedIn()){
    const user =authService.getCurrentUser();
    authService['redirectBasedOnRole'](user!.role);
    return false;
  }
  return true;
};
