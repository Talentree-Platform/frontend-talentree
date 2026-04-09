import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { AdminComponent } from './../../layout/admin/admin.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { CreateAdminComponent } from './Pages/Admin/create-admin/create-admin.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { AdminDashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';



@NgModule({
  declarations: [],
  imports: [
    AdminListComponent,
    CreateAdminComponent,
    BoDetailsComponent,
    PendingBoComponent,
    AdminDashboardComponent,
    AdminComponent,
    AdminProductHomeComponent,
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
