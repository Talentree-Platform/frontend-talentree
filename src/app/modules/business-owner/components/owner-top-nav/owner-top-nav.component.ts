import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialCartService } from '../../core/services/material-cart.service';

@Component({
  selector: 'app-owner-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './owner-top-nav.component.html',
  styleUrl: './owner-top-nav.component.css'
})
export class OwnerTopNavComponent implements OnInit {
  cartCount = 0;
  dropdownOpen = false;

  constructor(
    private _MaterialCartService: MaterialCartService,
    private router: Router
  ) { }

  ngOnInit() {
    this._MaterialCartService.loadCartCount();
    this._MaterialCartService.count$.subscribe(count => {
      this.cartCount = count;
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  navigateTo(path: string) {
    this.dropdownOpen = false;
    this.router.navigate([path]);
  }

  logout() {
    this.dropdownOpen = false;
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}