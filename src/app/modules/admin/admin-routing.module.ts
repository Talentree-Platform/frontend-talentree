import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { CreateAdminComponent } from './Pages/Admin/create-admin/create-admin.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { AdminDashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';


const routes: Routes = [
  {path:'' , component:AdminComponent, children:[
    {path:'dashboard' , component: AdminDashboardComponent},
    {path:'producthome' , component: AdminProductHomeComponent},
    {path:'adminlist' , component: AdminListComponent},
    {path:'createadmin' , component: CreateAdminComponent},
    {path:'bodetails' , component: BoDetailsComponent},
    {path:'pendingbo' , component: PendingBoComponent}

  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
