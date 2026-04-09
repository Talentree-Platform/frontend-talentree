import { OwnerSideNavComponent } from './../../modules/business-owner/components/owner-side-nav/owner-side-nav.component';
import { OwnerTopNavComponent } from './../../modules/business-owner/components/owner-top-nav/owner-top-nav.component';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { BusinessChatComponent } from "../../modules/business-owner/components/business-chat/business-chat.component";

@Component({
  selector: 'app-business-owner',
  standalone: true,
  imports: [RouterOutlet, OwnerTopNavComponent, OwnerSideNavComponent, BusinessChatComponent],
  templateUrl: './business-owner.component.html',
  styleUrl: './business-owner.component.css'
})
export class BusinessOwnerComponent {
  title = 'talentree';
  isSidebarExpanded = false;

  expandedItems: { [key: string]: boolean } = {
    'home': false,
    'products': false,
    'orders': false,
    'raw-material': false,
    'financial': false,
    'review': false,
    'support': false,
    'ai-tool': false,
    'settings': false
  };

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    // Close all submenus when collapsing
    if (!this.isSidebarExpanded) {
      Object.keys(this.expandedItems).forEach(key => {
        this.expandedItems[key] = false;
      });
    }
    
  }

}
