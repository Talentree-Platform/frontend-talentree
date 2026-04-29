import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-side-nav.component.html',
  styleUrl: './admin-side-nav.component.css'
})
export class AdminSideNavComponent {
   constructor(private authService: AuthService) {} // ✅ inject هنا
  
    isExpanded: boolean = false;
    @Output() expandedChange = new EventEmitter<boolean>();
  
    expandedItems: { [key: string]: boolean } = {};
    activeItem: string = 'home';
  
    toggleSidebar(): void {
      this.isExpanded = !this.isExpanded;
      this.expandedChange.emit(this.isExpanded);
  
      if (!this.isExpanded) {
        this.expandedItems = {};
      }
    }
  
    toggleSubmenu(item: string): void {
      if (this.isExpanded) {
        this.expandedItems[item] = !this.expandedItems[item];
      }
    }
  
    setActive(item: string): void {
      this.activeItem = item;
    }
  
    logout() {
      this.authService.logout().subscribe(); // ✅ استخدمي الاسم الصغير
    }

}
