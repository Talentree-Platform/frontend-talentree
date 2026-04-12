import { UnotheriaedComponent } from './layout/unotheriaed/unotheriaed.component';
import { roleGuardGuard } from './core/guards/role-guard.guard';
import { authGuardGuard } from './core/guards/auth-guard.guard';
import { Routes } from '@angular/router';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'public/landingpage', pathMatch: 'full' },
  {
    
    path: 'public',
    loadChildren: () =>
      import('./modules/public/public.module').then(p => p.PublicModule)
  },
  {
    path: 'businessowner',
    canActivate:[authGuardGuard , roleGuardGuard],
    data: { roles: ['BusinessOwner'] },
    loadChildren: () =>
      import('./modules/business-owner/business-owner.module').then(bo => bo.BusinessOwnerModule)
  },
  {
    path: 'customer',
    canActivate:[authGuardGuard , roleGuardGuard],
    data: { roles: ['Customer'] },
    loadChildren: () =>
      import('./modules/customer/customer.module').then(c => c.CustomerModule)
  },
  
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [authGuardGuard , roleGuardGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./modules/admin/admin.module').then(a => a.AdminModule)
  },
  {path:'unotherized' , component:UnotheriaedComponent},
  
  { path: '**', component: NotFoundComponent }
];
