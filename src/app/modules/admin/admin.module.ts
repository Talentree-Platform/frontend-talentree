import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { ProductionRequestComponent } from './Pages/production-request/production-request.component';
import { AdminLayoutComponent } from './../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-list/admin-list.component';
import { CreateAdminComponent } from './Pages/Admin/create-admin/create-admin.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { DashboardComponent } from './Pages/Dashboeard/admin-dashboard/admin-dashboard.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent } from './Pages/supplier/suppliers/suppliers.component';
import { AdminUserManagementComponent } from './Pages/admin-user-management/admin-user-management.component';
import { AdminComplaintsSupportComponent } from './Pages/admin-complaints-support/admin-complaints-support.component';
import { AdminRefundsComponent } from './Pages/admin-refunds/admin-refunds.component';
import { OrderListComponent } from './Pages/admin-orders/order-list/order-list.component';
import { AdminInteractionsComponent } from './Pages/admin-interactions/admin-interactions/admin-interactions.component';
import { TransactionsListComponent } from './Pages/Transactions/transactions-list/transactions-list.component';
import { AdminKnowledgeComponent } from './Pages/admin-knowledge/admin-knowledge.component';
import { AdminPlatformComponent } from './Pages/admin-platform/admin-platform.component';
import { AdminAutoBlocksComponent } from './Pages/admin-auto-blocks/admin-auto-blocks.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminLayoutComponent,
    AdminListComponent,
    CreateAdminComponent,
    BoDetailsComponent,
    PendingBoComponent,
    DashboardComponent,
    AdminProductHomeComponent,
    RawMaterialListComponent,
    SupplierListComponent,
    ProductionRequestComponent,
    AdminUserManagementComponent,
    AdminComplaintsSupportComponent,
    AdminRefundsComponent,
    OrderListComponent,
    AdminInteractionsComponent,
    TransactionsListComponent,
    AdminKnowledgeComponent,
    AdminPlatformComponent,
    AdminAutoBlocksComponent
  ]
})
export class AdminModule { }