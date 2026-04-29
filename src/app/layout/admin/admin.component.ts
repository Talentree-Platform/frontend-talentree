import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminTopNavComponent } from '../../modules/admin/Components/admin-header/admin-header.component';
import { AdminSideNavComponent } from '../../modules/admin/Components/admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminTopNavComponent, AdminSideNavComponent],
  template: `
    <app-admin-top-nav />

    <div class="layout-body">
      <app-admin-side-nav
        #sideNav
        (expandedChange)="isExpanded.set($event)" />

      <main
        class="main-content"
        [class.expanded]="isExpanded()">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
  :host { display: block; }

  .layout-body {
    display: flex;
    min-height: 100vh;
    background: #FDFAF4;
    padding-top: 20px;   /* 70px navbar + 48px secondary */
  }

  .main-content {
    flex: 1;
    margin-left: 80px;
    padding: 32px 36px;
    min-width: 0;
    box-sizing: border-box;
    transition: margin-left 0.3s ease;
  }

  .main-content.expanded { margin-left: 280px; }

  @media (max-width: 991px) {
    .layout-body { padding-top: 4px; }  /* mobile: navbar only */
  }

  @media (max-width: 768px) {
    .main-content          { margin-left: 56px; padding: 20px 16px; }
    .main-content.expanded { margin-left: 240px; }
  }

  @media (max-width: 480px) {
    .main-content,
    .main-content.expanded { margin-left: 56px; padding: 16px 12px; }
  }
`]
})
export class AdminLayoutComponent {
  @ViewChild('sideNav') sideNav!: AdminSideNavComponent;

  isExpanded = signal(false);
}