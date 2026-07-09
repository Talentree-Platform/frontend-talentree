import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/admin/admin.component';
import { AdminListComponent } from './Pages/Admin/admin-managment/admin-list/admin-list.component';
import { AdminProductHomeComponent } from './Pages/Products/admin-product-home/admin-product-home.component';
import { AdminProductsPageComponent } from './Pages/Products/admin-products-page/admin-products-page.component';
import { BoDetailsComponent } from './Pages/business-owner/bo-details/bo-details.component';
import { DashboardComponent } from './Pages/Dashboard/admin-dashboard/admin-dashboard.component';
import { PendingBoComponent } from './Pages/business-owner/pending-bo/pending-bo.component';
import { RawMaterialListComponent } from './Pages/raw-material/raw-materials/raw-materials.component';
import { SupplierListComponent } from './Pages/supplier/suppliers/suppliers.component';
import { ProductionRequestComponent } from './Pages/production-request/production-request.component';
import { AdminUserManagementComponent } from './Pages/admin-user-management/admin-user-management.component';
import { AdminComplaintsSupportComponent } from './Pages/admin-complaints-support/admin-complaints-support.component';
import { PayoutDashboardComponent } from './Pages/Payout/payout-dashboard/payout-dashboard.component';
import { AdminAutoBlocksComponent } from './Pages/admin-auto-blocks/admin-auto-blocks.component';
import { OrderListComponent } from './Pages/admin-orders/order-list/order-list.component';
import { AdminRefundsComponent } from './Pages/admin-refunds/admin-refunds.component';
import { TransactionsListComponent } from './Pages/Transactions/transactions-list/transactions-list.component';
import { TransactionDetailsComponent } from './Pages/Transactions/transaction-details/transaction-details.component';
import { TransactionsAnalyticsComponent } from './Pages/Transactions/transactions-analytics/transactions-analytics.component';
import { AdminInteractionsComponent } from './Pages/admin-interactions/admin-interactions/admin-interactions.component';
import { AdminKnowledgeComponent } from './Pages/admin-knowledge/admin-knowledge.component';
import { AdminPlatformComponent } from './Pages/admin-platform/admin-platform.component';
import { roleGuardGuard } from '../../core/guards/role-guard.guard'; // ⚠️ عدّلي المسار
import { UserRole } from '../../core/constants/roles.constants'; // ⚠️ عدّلي المسار

const BOTH = [UserRole.SuperAdmin, UserRole.Admin];
const ADMIN_ONLY = [UserRole.Admin];
const SUPERADMIN_ONLY = [UserRole.SuperAdmin];

const routes: Routes = [
  {
    path: '', component: AdminLayoutComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard — accessible to both, though some internal widgets may 403 for SuperAdmin
      // (backend limitation, see note below)
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },

      // Admin-only sections
      { path: 'producthome', component: AdminProductsPageComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'rawmaterials', component: RawMaterialListComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'suppliers', component: SupplierListComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'production-requests', component: ProductionRequestComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'user-management', component: AdminUserManagementComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'adminsupportcomplaint', component: AdminComplaintsSupportComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'payout', component: PayoutDashboardComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'auto-blocks', component: AdminAutoBlocksComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'interactions', component: AdminInteractionsComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'knowledge', component: AdminKnowledgeComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'platform/homepage', component: AdminPlatformComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'platform/categories', component: AdminPlatformComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'platform/commission', component: AdminPlatformComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'platform/policies', component: AdminPlatformComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },
      { path: 'platform/shipping-tax', component: AdminPlatformComponent, canActivate: [roleGuardGuard], data: { roles: ADMIN_ONLY } },

      // Shared: SuperAdmin, Admin
      { path: 'pendingbo', component: PendingBoComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'bodetails/:id', component: BoDetailsComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'orders', component: OrderListComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'refunds', component: AdminRefundsComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'transactions', component: TransactionsListComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'transactions/analytics', component: TransactionsAnalyticsComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },
      { path: 'transactions/:id', component: TransactionDetailsComponent, canActivate: [roleGuardGuard], data: { roles: BOTH } },

      // SuperAdmin only
      { path: 'adminlist', component: AdminListComponent, canActivate: [roleGuardGuard], data: { roles: SUPERADMIN_ONLY } },

      {
        path: 'account',
        loadChildren: () => import('../account/account.routes').then(m => m.ACCOUNT_ROUTES)
      },

      // Notifications — SuperAdmin, Admin
      {
        path: 'notifications',
        canActivate: [roleGuardGuard],
        data: { roles: BOTH },
        loadComponent: () =>
          import('./Components/notification/notification.component')
            .then(m => m.NotificationComponent)
      },

      // AI sections — SuperAdmin, Admin (AdminAiProxyController)
      {
        path: 'ai-sellers',
        canActivate: [roleGuardGuard],
        data: { roles: BOTH },
        loadComponent: () =>
          import('./Pages/Dashboard/admin-ai-sellers-list/admin-ai-sellers-list.component')
            .then(m => m.AdminAiSellersListComponent)
      },
      {
        path: 'ai-sellers/:sellerId',
        canActivate: [roleGuardGuard],
        data: { roles: BOTH },
        loadComponent: () =>
          import('./Pages/Dashboard/admin-ai-seller-detail/admin-ai-seller-detail.component')
            .then(m => m.AdminAiSellerDetailComponent)
      },
      {
        path: 'ai-insights',
        canActivate: [roleGuardGuard],
        data: { roles: BOTH },
        loadComponent: () =>
          import('./Pages/Dashboard/admin-ai-insights/admin-ai-insights.component')
            .then(m => m.AdminAiInsightsComponent)
      },
      {
        path: 'ai-model-management',
        canActivate: [roleGuardGuard],
        data: { roles: BOTH },
        loadComponent: () =>
          import('./Pages/Dashboard/admin-ai-model-management/admin-ai-model-management.component')
            .then(m => m.AdminAiModelManagementComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }