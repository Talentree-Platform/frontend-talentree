import { Component } from '@angular/core';
import { AdminProductHomeComponent } from '../admin-product-home/admin-product-home.component';
import { AdminAllProductsComponent } from '../admin-all-products/admin-all-products.component';

type ProductsTab = 'pending' | 'all';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [AdminProductHomeComponent, AdminAllProductsComponent],
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.css'
})
export class AdminProductsPageComponent {
  activeTab: ProductsTab = 'pending';

  setTab(tab: ProductsTab): void {
    this.activeTab = tab;
  }
}