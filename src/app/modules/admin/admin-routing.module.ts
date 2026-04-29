
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { AdminDashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent} from './Pages/supplier/suppliers/suppliers.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      component: AdminDashboardComponent },
      { path: 'producthome',    component: AdminProductHomeComponent },
      { path: 'adminlist',      component: AdminListComponent },
      { path: 'pendingbo',      component: PendingBoComponent },
      { path: 'bodetails/:id',  component: BoDetailsComponent },
      { path: 'rawmaterials',   component: RawMaterialListComponent },
      { path: 'suppliers', component: SupplierListComponent },  // ← جديد
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}