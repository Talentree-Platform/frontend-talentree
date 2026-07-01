import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminTopNavComponent implements OnInit {
  notifCount = 5;
  dropdownOpen = false;

  constructor(private router: Router) { }

  ngOnInit() { }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.dropdownOpen = false;
  }

  logout() {
    this.dropdownOpen = false;
    // استبدلي بـ auth service بتاعك
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
  navigateTo(path: string) {
    this.dropdownOpen = false;
    this.router.navigate([path]);
  }
}