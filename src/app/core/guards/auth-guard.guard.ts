import { AuthService } from './../../modules/auth/services/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuardGuard: CanActivateFn = (route, state) => {
  const authService =inject(AuthService);
  const router = inject(Router);
  if(authService.isLoggedIn()){
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};
