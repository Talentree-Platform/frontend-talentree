
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { DashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent} from './Pages/supplier/suppliers/suppliers.component';
import { ProductionRequestComponent } from './Pages/production-request/production-request.component';
//import { AdminUserManagementComponent } from './Pages/admin-user-management/admin-user-management.component';
import { AdminComplaintsSupportComponent } from './Pages/admin-complaints-support/admin-complaints-support.component';
//import { NotificationComponent } from '../business-owner/pages/notification/notification.component';
const routes: Routes = [
  {
    path: '', component: AdminLayoutComponent, children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      component: DashboardComponent },
      { path: 'producthome',    component: AdminProductHomeComponent },
      { path: 'adminlist',      component: AdminListComponent },
      { path: 'pendingbo',      component: PendingBoComponent },
      { path: 'bodetails/:id',  component: BoDetailsComponent },
      { path: 'rawmaterials',   component: RawMaterialListComponent },
      { path: 'suppliers', component: SupplierListComponent }, 
      { path: 'production-requests', component: ProductionRequestComponent },
      // {path: 'AdminUserManagment', component: AdminUserManagementComponent},
      {path: 'adminsupportcomplaint', component: AdminComplaintsSupportComponent}
      //{path: 'notification', component:NotificationComponent} // ← جديد
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}