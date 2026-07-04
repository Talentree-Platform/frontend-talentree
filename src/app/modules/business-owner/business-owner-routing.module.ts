
import { BusinessChatComponent } from './components/business-chat/business-chat.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { BusinessOwnerComponent } from './../../layout/business-owner/business-owner.component';
import { RawMaterialCheckoutComponent } from './pages/Raw Material/raw-material-checkout/raw-material-checkout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RawMaterialProductDetailsComponent } from './pages/Raw Material/raw-material-product-details/raw-material-product-details.component';
import { RawMaterialCartComponent } from './pages/Raw Material/raw-material-cart/raw-material-cart.component';
import { BusinessOwnerHomeComponent } from './pages/business-owner-home/business-owner-home.component';
import { RawMaterialHomeComponent } from './pages/Raw Material/raw-material-home/raw-material-home.component';
import { SettingMainComponent } from './pages/Setting/setting-main/setting-main.component';
import { SettingBusinessDetailsComponent } from './pages/Setting/setting-business-details/setting-business-details.component';
import { SettingPaymentBillingComponent } from './pages/Setting/setting-payment-billing/setting-payment-billing.component';
import { SettingPrefernceNotificationsComponent } from './pages/Setting/setting-prefernce-notifications/setting-prefernce-notifications.component';
import { SettingSecurityPrivacyComponent } from './pages/Setting/setting-security-privacy/setting-security-privacy.component';
import { OwnerProductsComponent } from './pages/Products/owner-products/owner-products.component';
import { OwnerAddProductComponent } from './pages/Products/owner-add-product/owner-add-product.component';
import { OwnerEditProductComponent } from './pages/Products/owner-edit-product/owner-edit-product.component';
import { OwnerProductDetailsComponent } from './pages/Products/owner-product-details/owner-product-details.component';
import { ProductionRequestListComponent } from './pages/BO-Production-Request/production-request-list/production-request-list.component';
import { CreateProductionRequestComponent } from './pages/BO-Production-Request/create-production-request/create-production-request.component';
import { ProductionRequestDetailsComponent } from './pages/BO-Production-Request/production-request-details/production-request-details.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { KbHomeComponent } from './pages/knowledge-base/kb-home/kb-home.component';
import { KbDetailsComponent } from './pages/knowledge-base/kb-details/kb-details.component';
import { KbBookmarksComponent } from './pages/knowledge-base/kb-bookmarks/kb-bookmarks.component';
import { FinancialComponent } from './pages/financial/financial.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { MaterialOrderComponent } from './pages/Order/material-order/material-order.component';
import { MaterialOrderDetailsComponent } from './pages/Order/order-details/order-details.component';
import { PayoutHistoryComponent } from './pages/Payout/payout-history/payout-history.component';
import { TicketsListComponent } from './pages/Support/tickets-list/tickets-list.component';
import { TicketDetailsComponent } from './pages/Support/ticket-details/ticket-details.component';
import { FaqComponent } from './pages/Support/faq/faq.component';
import { TicketCreateComponent } from './pages/Support/ticket-create/ticket-create.component';
import { BusinessOwnerAiDashboardComponent } from './pages/business-owner-ai-dashboard/business-owner-ai-dashboard.component';
import { AiPlatformToolsComponent } from './pages/ai-platform-tools/ai-platform-tools.component';


const routes: Routes = [
  {
    path: '', component: BusinessOwnerComponent
    , children: [
      { path: '', redirectTo: 'bohome', pathMatch: 'full' },// default route for module
      { path: 'bohome', component: BusinessOwnerHomeComponent },
      { path: 'rawmaterialhome', component: RawMaterialHomeComponent },
      { path: 'rawmaerialproductdetails/:id', component: RawMaterialProductDetailsComponent },
      { path: 'rawmaterialcart', component: RawMaterialCartComponent },
      { path: 'rawmaterialcheckout', component: RawMaterialCheckoutComponent },
      { path: 'materialOrder', component: MaterialOrderComponent },
      { path: 'material-order/:id', component: MaterialOrderDetailsComponent },
      { path: 'settingmain', component: SettingMainComponent },
      { path: 'settingbusinessdetails', component: SettingBusinessDetailsComponent },
      { path: 'settingpaymentbilling', component: SettingPaymentBillingComponent },
      { path: 'settingpreference', component: SettingPrefernceNotificationsComponent },
      { path: 'settingsecurity', component: SettingSecurityPrivacyComponent },
      { path: 'notifications', component: NotificationComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'ownerProduct', component: OwnerProductsComponent },
      { path: 'owner/products/:id', component: OwnerProductDetailsComponent },
      { path: 'ownerAddProduct', component: OwnerAddProductComponent },
      { path: 'ownerEditProduct/:id', component: OwnerEditProductComponent },
      { path: 'ownerProductionRequestList', component: ProductionRequestListComponent },
      { path: 'ownerProductionRequestCreate', component: CreateProductionRequestComponent },
      { path: 'ownerProductionRequestdetails/:id', component: ProductionRequestDetailsComponent },
      { path: 'businessChat', component: BusinessChatComponent }, //to be removed
      { path: 'knowledge-base', component: KbHomeComponent },
      { path: 'knowledge-base/bookmarks', component: KbBookmarksComponent },
      { path: 'knowledge-base/:id', component: KbDetailsComponent },
      { path: 'financial', component: FinancialComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'ownerProductionRequestdetails/:id', component: ProductionRequestDetailsComponent },
      { path: 'payouthistory', component: PayoutHistoryComponent },
      { path: 'tickets', component: TicketsListComponent },
      { path: 'tickets/create', component: TicketCreateComponent },
      { path: 'tickets/:id', component: TicketDetailsComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'businessChat', component: BusinessChatComponent }, //to be removed
      {
        path: 'account',
        loadChildren: () => import('../account/account.routes').then(m => m.ACCOUNT_ROUTES)
      },
      { path: 'ai-dashboard', component: BusinessOwnerAiDashboardComponent },
      { path: 'ai-platform-tools', component: AiPlatformToolsComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessOwnerRoutingModule { }
