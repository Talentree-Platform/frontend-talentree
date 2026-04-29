// src/app/layout/admin/admin.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // ← أضيفي ده
import { AdminHeaderComponent } from '../../modules/admin/Components/admin-header/admin-header.component';
import { AdminSideNavComponent } from "../../modules/admin/Components/admin-side-nav/admin-side-nav.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterModule, // ← أضيفي ده عشان router-outlet
    AdminHeaderComponent,
    AdminSideNavComponent
],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent { }
