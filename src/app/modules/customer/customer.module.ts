
import { CustomerHomeComponent } from './Pages/home/customer-home/customer-home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerProductsComponent } from './Pages/Product/customer-product/customer-product.component';
import { CustomerProductDetailsComponent } from './Pages/Product/customer-product-deatils/customer-product-deatils.component';
import { CoOrderDetailsComponent } from './Pages/Order/co-order-details/co-order-details.component';
import { CoOrdersListComponent } from './Pages/Order/co-orders-list/co-orders-list.component';
import { CustomerCartComponent } from './Pages/cart/customer-cart/customer-cart.component';
import { WishlistComponent } from '../business-owner/pages/wishlist/wishlist.component';
import { CategoryProductsComponent } from './Pages/Categories/category-product/category-product.component';
import { CustomerCategoriesComponent } from './Pages/Categories/customer-categories/customer-categories.component';
import { BrandProductsComponent } from './Pages/Brands/brand-products/brand-products.component';
import { NavbarComponent } from './components/co-navbar/co-navbar.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    CustomerHomeComponent,
    CustomerProductsComponent,
    CustomerProductDetailsComponent,
    CoOrderDetailsComponent,
    CoOrdersListComponent,
    CustomerCartComponent,
    WishlistComponent ,
    CustomerCategoriesComponent,
    CategoryProductsComponent,
    BrandProductsComponent,
    NavbarComponent// standalone component
  ]
})
export class CustomerModule { }
