import { Router } from '@angular/router';
import { AuthService } from './../../modules/auth/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-unotheriaed',
  standalone: true,
  imports: [],
  templateUrl: './unotheriaed.component.html',
  styleUrl: './unotheriaed.component.css'
})
export class UnotheriaedComponent {
  constructor(private authService:AuthService ,private router:Router){}
  goDashboard() {
    const role = this.authService.getCurrentUser()?.role?.toLowerCase();
    if (role === 'businessowner') this.router.navigate(['/businessowner/bohome']);
    else if (role === 'customer') this.router.navigate(['/customer/profile']);
    else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
