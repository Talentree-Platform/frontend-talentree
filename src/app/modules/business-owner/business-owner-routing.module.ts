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
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { OwnerProductsComponent } from './pages/Products/owner-products/owner-products.component';
import { OwnerAddProductComponent } from './pages/Products/owner-add-product/owner-add-product.component';
import { OwnerEditProductComponent } from './pages/Products/owner-edit-product/owner-edit-product.component';
import { OwnerProductDetailsComponent } from './pages/Products/owner-product-details/owner-product-details.component';

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
      { path: 'settingmain', component: SettingMainComponent },
      { path: 'settingbusinessdetails', component: SettingBusinessDetailsComponent },
      { path: 'settingpaymentbilling', component: SettingPaymentBillingComponent },
      { path: 'settingpreference', component: SettingPrefernceNotificationsComponent },
      { path: 'settingsecurity', component: SettingSecurityPrivacyComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'ownerProduct', component: OwnerProductsComponent },
      { path: 'owner/products/:id', component: OwnerProductDetailsComponent },
      { path: 'ownerAddProduct', component: OwnerAddProductComponent },
      { path: 'ownerEditProduct/:id', component: OwnerEditProductComponent },
      {path:'businessChat', component:BusinessChatComponent} //to be removed
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessOwnerRoutingModule { }
