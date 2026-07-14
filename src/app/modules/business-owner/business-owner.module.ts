
import { OwnerAddProductComponent } from './pages/Products/owner-add-product/owner-add-product.component';
import { OwnerTopNavComponent } from './components/owner-top-nav/owner-top-nav.component';
import { OwnerSideNavComponent } from './components/owner-side-nav/owner-side-nav.component';
import { BusinessOwnerComponent } from './../../layout/business-owner/business-owner.component';
import { RawMaterialProductDetailsComponent } from './pages/Raw Material/raw-material-product-details/raw-material-product-details.component';
import { RawMaterialHomeComponent } from './pages/Raw Material/raw-material-home/raw-material-home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessOwnerRoutingModule } from './business-owner-routing.module';
import { NotificationComponent } from './pages/notification/notification.component';
import { RawMaterialCartComponent } from './pages/Raw Material/raw-material-cart/raw-material-cart.component';
import { RawMaterialCheckoutComponent } from './pages/Raw Material/raw-material-checkout/raw-material-checkout.component';
import { SettingBusinessDetailsComponent } from './pages/Setting/setting-business-details/setting-business-details.component';
import { SettingMainComponent } from './pages/Setting/setting-main/setting-main.component';
import { SettingPaymentBillingComponent } from './pages/Setting/setting-payment-billing/setting-payment-billing.component';
import { SettingPrefernceNotificationsComponent } from './pages/Setting/setting-prefernce-notifications/setting-prefernce-notifications.component';
import { SettingSecurityPrivacyComponent } from './pages/Setting/setting-security-privacy/setting-security-privacy.component';
import { OwnerProductsComponent } from './pages/Products/owner-products/owner-products.component';
import { OwnerEditProductComponent } from './pages/Products/owner-edit-product/owner-edit-product.component';
import { OwnerProductDetailsComponent } from './pages/Products/owner-product-details/owner-product-details.component';
import { ProductionRequestDetailsComponent } from './pages/BO-Production-Request/production-request-details/production-request-details.component';
import { ProductionRequestListComponent } from './pages/BO-Production-Request/production-request-list/production-request-list.component';
import { CreateProductionRequestComponent } from './pages/BO-Production-Request/create-production-request/create-production-request.component';
import { KbHomeComponent } from './pages/knowledge-base/kb-home/kb-home.component';
import { KbDetailsComponent } from './pages/knowledge-base/kb-details/kb-details.component';
import { KbBookmarksComponent } from './pages/knowledge-base/kb-bookmarks/kb-bookmarks.component';
import { FinancialComponent } from './pages/financial/financial.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { MaterialOrderComponent } from './pages/Order/material-order/material-order.component';
import { MaterialOrderDetailsComponent } from './pages/Order/order-details/order-details.component';
import { PayoutHistoryComponent } from './pages/Payout/payout-history/payout-history.component';
import { TicketsListComponent } from './pages/Support/tickets-list/tickets-list.component';
import { TicketCreateComponent } from './pages/Support/ticket-create/ticket-create.component';
import { TicketDetailsComponent } from './pages/Support/ticket-details/ticket-details.component';
import { FaqComponent } from './pages/Support/faq/faq.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { StatusBadgeComponent } from '../admin/Components/status-badge/status-badge.component';
import { BusinessOwnerAiDashboardComponent } from './pages/business-owner-ai-dashboard/business-owner-ai-dashboard.component';
import { ComplaintCreateComponent } from './pages/Complaints/complaint-create/complaint-create.component';
import { ComplaintDetailsComponent } from './pages/Complaints/complaint-details/complaint-details.component';




@NgModule({
  declarations: [],

  imports: [
    
    PayoutHistoryComponent,
    MaterialOrderDetailsComponent,
    MaterialOrderComponent,
    ProductionRequestDetailsComponent,
    ProductionRequestListComponent,
    CreateProductionRequestComponent,
    OwnerProductsComponent,
    OwnerProductDetailsComponent,
    OwnerAddProductComponent,
    OwnerEditProductComponent,
    BusinessOwnerComponent,
    RawMaterialHomeComponent,
    RawMaterialProductDetailsComponent,
    RawMaterialCartComponent,
    RawMaterialCheckoutComponent,
    SettingBusinessDetailsComponent,
    SettingMainComponent,
    SettingPaymentBillingComponent,
    SettingPrefernceNotificationsComponent,
    SettingSecurityPrivacyComponent,
    NotificationComponent,
    CommonModule,
    BusinessOwnerRoutingModule,
    KbHomeComponent,
    KbDetailsComponent,
    KbBookmarksComponent,
    FinancialComponent,
    ReviewsComponent,
    TicketsListComponent,
    TicketCreateComponent,
    TicketDetailsComponent,
    FaqComponent,
    ToastContainerComponent,
    SkeletonComponent,
    StatusBadgeComponent,
    BusinessOwnerAiDashboardComponent,
    ComplaintCreateComponent,
    ComplaintDetailsComponent


  
    

  ]
})
export class BusinessOwnerModule { }
