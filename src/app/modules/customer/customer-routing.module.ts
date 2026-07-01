import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomeComponent } from './Pages/home/customer-home/customer-home.component';
import { CustomerProductsComponent } from './Pages/Product/customer-product/customer-product.component';
import { CustomerProductDetailsComponent } from './Pages/Product/customer-product-deatils/customer-product-deatils.component';
import { CoOrdersListComponent } from './Pages/Order/co-orders-list/co-orders-list.component';
import { CoOrderDetailsComponent } from './Pages/Order/co-order-details/co-order-details.component';
import { CustomerCartComponent } from './Pages/cart/customer-cart/customer-cart.component';
import { CustomerWishlistComponent } from './Pages/wishlist/customer-wishlist/customer-wishlist.component';

const routes: Routes = [
  { path: '', component: CustomerHomeComponent },
  { path: 'customerhome', component: CustomerHomeComponent },
  { path: 'customerProduct', component: CustomerProductsComponent },
  { path: 'productDetails/:id', component: CustomerProductDetailsComponent },
  { path: 'order', component: CoOrdersListComponent},
  { path: 'orderDetails/:id', component: CoOrderDetailsComponent },
  { path: 'cart', component: CustomerCartComponent },
  { path: 'wishlist', component: CustomerWishlistComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
