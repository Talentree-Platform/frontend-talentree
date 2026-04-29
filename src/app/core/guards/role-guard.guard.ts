import { AuthService } from './../../modules/auth/services/auth.service';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const roleGuardGuard: CanActivateFn = (route :ActivatedRouteSnapshot, state) => {
  const authService =inject(AuthService);
  const router = inject (Router);

  const expectedRoles = route.data['roles'] as string[];
  const user =authService.getCurrentUser();

  if(!user){
    router.navigate(['/auth/login']);
    return false ;
  }
  if (!expectedRoles.includes(user.role)){
    router.navigate(['/unotherized'])
    return false ;
  }
  return true;
};
