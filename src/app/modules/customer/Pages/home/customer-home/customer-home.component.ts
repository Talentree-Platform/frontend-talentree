// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Customer Home Page
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, OnInit, inject,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomerMarketplaceService } from '../../../Core/services/customer-marketplace.service';
import { CustomerProductCardComponent } from '../../../components/customer-product-card/customer-product-card.component';
import { ProductSearchComponent } from '../../../components/product-search/product-search.component';
import { Product } from '../../../Core/models/customer,models';
import { CustomerCartService } from '../../../Core/services/cart-service.service';
import { ToastService } from '../../../Core/services/toast.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CustomerProductCardComponent,
    ProductSearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'],
})
export class CustomerHomeComponent implements OnInit {
  protected readonly svc = inject(CustomerMarketplaceService);
  private readonly cartSvc = inject(CustomerCartService);
  private readonly toastSvc = inject(ToastService);

  readonly skeletonArray = Array.from({ length: 6 });

  // Trending carousel index
  trendingOffset = signal(0);
  readonly CARDS_VISIBLE = 4;

  get trendingProducts(): Product[] {
    return this.svc.homepageData()?.trendingProducts ?? [];
  }

  get featuredProducts(): Product[] {
    return this.svc.homepageData()?.featuredProducts ?? [];
  }

  get categories() {
    return this.svc.homepageData()?.categories ?? [];
  }

  get canScrollLeft(): boolean {
    return this.trendingOffset() > 0;
  }

  get canScrollRight(): boolean {
    return this.trendingOffset() + this.CARDS_VISIBLE < this.trendingProducts.length;
  }

  ngOnInit(): void {
    this.svc.loadHomepage();
  }

  scrollTrending(dir: 'left' | 'right'): void {
    this.trendingOffset.update(o =>
      dir === 'right'
        ? Math.min(o + 1, this.trendingProducts.length - this.CARDS_VISIBLE)
        : Math.max(o - 1, 0)
    );
  }

  get visibleTrending(): Product[] {
    return this.trendingProducts.slice(
      this.trendingOffset(),
      this.trendingOffset() + this.CARDS_VISIBLE
    );
  }

  onAddedToCart(e: { productId: string; qty: number; productName?: string; imageUrl?: string | null }): void {
    const productId = Number(e.productId);

    this.cartSvc.addItem(productId, e.qty).subscribe({
      next: () => {
        this.toastSvc.success(
          'Added to cart',
          e.productName ?? 'Item added successfully',
          e.imageUrl ?? null
        );
      },
      error: () => {
        this.toastSvc.error(
          'Could not add item',
          this.cartSvc.addError() ?? 'Please try again.'
        );
      },
    });
  }
}