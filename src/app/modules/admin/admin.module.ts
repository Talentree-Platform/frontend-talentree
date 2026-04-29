import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { CreateAdminComponent } from './Pages/Admin/create-admin/create-admin.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { AdminDashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent } from './Pages/supplier/suppliers/suppliers.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminComponent,
    AdminListComponent,
    CreateAdminComponent,
    BoDetailsComponent,
    PendingBoComponent,
    AdminDashboardComponent,
    AdminProductHomeComponent,
    RawMaterialListComponent, 
    SupplierListComponent,  // ← جديد
  ]
})
export class AdminModule {}