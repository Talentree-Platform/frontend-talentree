import { OwnerTopNavComponent } from './components/owner-top-nav/owner-top-nav.component';
import { OwnerSideNavComponent } from './components/owner-side-nav/owner-side-nav.component';
import { BusinessOwnerComponent } from './../../layout/business-owner/business-owner.component';
import { RawMaterialProductDetailsComponent } from './pages/raw-material-product-details/raw-material-product-details.component';
import { RawMaterialHomeComponent } from './pages/raw-material-home/raw-material-home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessOwnerRoutingModule } from './business-owner-routing.module';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { RawMaterialCartComponent } from './pages/raw-material-cart/raw-material-cart.component';
import { RawMaterialCheckoutComponent } from './pages/raw-material-checkout/raw-material-checkout.component';
import { SettingBusinessDetailsComponent } from './pages/setting-business-details/setting-business-details.component';
import { SettingMainComponent } from './pages/setting-main/setting-main.component';
import { SettingPaymentBillingComponent } from './pages/setting-payment-billing/setting-payment-billing.component';
import { SettingPrefernceNotificationsComponent } from './pages/setting-prefernce-notifications/setting-prefernce-notifications.component';
import { SettingSecurityPrivacyComponent } from './pages/setting-security-privacy/setting-security-privacy.component';


@NgModule({
  declarations: [],

  imports: [
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
    NotificationsComponent,
    CommonModule,
    BusinessOwnerRoutingModule,
  
    

  ]
})
export class BusinessOwnerModule { }
