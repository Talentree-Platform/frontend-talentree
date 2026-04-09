import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-owner-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './owner-side-nav.component.html',
  styleUrl: './owner-side-nav.component.css'
})
export class OwnerSideNavComponent {
  @Input() isExpanded :boolean= false;
  @Input() expandedItems!: { [key: string]: boolean };

  activeItem: string = 'home';
  
   
  

  toggleSubmenu(item: string): void {
    if (this.isExpanded) {
      this.expandedItems[item] = !this.expandedItems[item];
    }
  }

  setActive(item: string): void {
    this.activeItem = item;
    // You can add navigation logic here using Angular Router
    // this.router.navigate([`/${item}`]);
  }

  logout(): void {
    // Add your logout logic here
    console.log('Logout clicked');
  }
}
