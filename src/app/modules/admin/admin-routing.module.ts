import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { DashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent } from './Pages/supplier/suppliers/suppliers.component';
import { ProductionRequestComponent } from './Pages/production-request/production-request.component';
import { AdminUserManagementComponent } from './Pages/admin-user-management/admin-user-management.component';
import { AdminComplaintsSupportComponent } from './Pages/admin-complaints-support/admin-complaints-support.component';
import { AdminRefundsComponent } from './Pages/admin-refunds/admin-refunds.component';
import { OrderListComponent } from './Pages/admin-orders/order-list/order-list.component';
import { AdminInteractionsComponent } from './Pages/admin-interactions/admin-interactions/admin-interactions.component';
import { TransactionsListComponent } from './Pages/Transactions/transactions-list/transactions-list.component';
import { AdminKnowledgeComponent } from './Pages/admin-knowledge/admin-knowledge.component';
import { AdminPlatformComponent } from './Pages/admin-platform/admin-platform.component';
import { AdminAutoBlocksComponent } from './Pages/admin-auto-blocks/admin-auto-blocks.component';

const routes: Routes = [
  {
    path: '', component: AdminLayoutComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'producthome', component: AdminProductHomeComponent },
      { path: 'adminlist', component: AdminListComponent },
      { path: 'pendingbo', component: PendingBoComponent },
      { path: 'bodetails/:id', component: BoDetailsComponent },
      { path: 'rawmaterials', component: RawMaterialListComponent },
      { path: 'suppliers', component: SupplierListComponent },
      { path: 'production-requests', component: ProductionRequestComponent },
      { path: 'user-management', component: AdminUserManagementComponent },
      { path: 'AdminSupportComplaint', component: AdminComplaintsSupportComponent },
      { path: 'refunds', component: AdminRefundsComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'interactions', component: AdminInteractionsComponent },
      { path: 'transactions', component: TransactionsListComponent },
      { path: 'knowledge', component: AdminKnowledgeComponent },
      { path: 'auto-blocks', component: AdminAutoBlocksComponent },
      { path: 'platform/homepage', component: AdminPlatformComponent },
      { path: 'platform/categories', component: AdminPlatformComponent },
      { path: 'platform/commission', component: AdminPlatformComponent },
      { path: 'platform/policies', component: AdminPlatformComponent },
      { path: 'platform/shipping-tax', component: AdminPlatformComponent },
      {
        path: 'account',
        loadChildren: () =>
          import('../account/account.routes').then(m => m.ACCOUNT_ROUTES)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }