// ─────────────────────────────────────────────────────────────────────────────
// Talentree – Customer Home Page  (UPDATED + BRANDS)
// ─────────────────────────────────────────────────────────────────────────────
// Categories come from svc.loadCategories() / svc.categoriesData().
// NEW: Brands come from svc.loadBrands() / svc.brandsData().
// Featured + Trending products still come from svc.loadHomepage() / homepageData.
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
import { Product } from '../../../Core/interfaces/customer';
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
  protected readonly svc      = inject(CustomerMarketplaceService);
  private readonly cartSvc    = inject(CustomerCartService);
  private readonly toastSvc   = inject(ToastService);

  readonly skeletonArray = Array.from({ length: 6 });

  // Trending carousel index
  readonly trendingOffset = signal(0);
  readonly CARDS_VISIBLE  = 4;

  // Recommended-for-you carousel index
  readonly recommendedOffset = signal(0);

  // ── Derived data ──────────────────────────────────────────────────────────

  /** Categories come from the dedicated categories signal. */
  get categories() {
    return this.svc.categoriesData();
  }

  /** NEW: Brands come from the dedicated brands signal. */
  get brands() {
    return this.svc.brandsData();
  }

  get featuredProducts(): Product[] {
    return this.svc.homepageData()?.featuredProducts ?? [];
  }

  get trendingProducts(): Product[] {
    return this.svc.homepageData()?.trendingProducts ?? [];
  }

  get visibleTrending(): Product[] {
    const offset = this.trendingOffset();
    return this.trendingProducts.slice(offset, offset + this.CARDS_VISIBLE);
  }

  get canScrollLeft(): boolean { return this.trendingOffset() > 0; }
  get canScrollRight(): boolean {
    return this.trendingOffset() + this.CARDS_VISIBLE < this.trendingProducts.length;
  }

  get recommendedProducts(): Product[] {
    return this.svc.recommendationsData();
  }

  get visibleRecommended(): Product[] {
    const offset = this.recommendedOffset();
    return this.recommendedProducts.slice(offset, offset + this.CARDS_VISIBLE);
  }

  get canScrollRecLeft(): boolean { return this.recommendedOffset() > 0; }
  get canScrollRecRight(): boolean {
    return this.recommendedOffset() + this.CARDS_VISIBLE < this.recommendedProducts.length;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Load homepage data for featured + trending products
    this.svc.loadHomepage();
    // Load categories from the dedicated categories endpoint
    this.svc.loadCategories();
    // NEW: Load a first page of brands for the "Featured Brands" strip
    this.svc.loadBrands();
    // NEW: Load personalized recommendations for the logged-in customer
    this.svc.loadRecommendations();
  }

  // ── Carousel ──────────────────────────────────────────────────────────────

  scrollTrending(dir: 'left' | 'right'): void {
    this.trendingOffset.update(o =>
      dir === 'right'
        ? Math.min(o + 1, this.trendingProducts.length - this.CARDS_VISIBLE)
        : Math.max(o - 1, 0)
    );
  }

  scrollRecommended(dir: 'left' | 'right'): void {
    this.recommendedOffset.update(o =>
      dir === 'right'
        ? Math.min(o + 1, this.recommendedProducts.length - this.CARDS_VISIBLE)
        : Math.max(o - 1, 0)
    );
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  onAddedToCart(e: {
    productId: string;
    qty: number;
    productName?: string;
    imageUrl?: string | null;
  }): void {
    this.cartSvc.addItem(Number(e.productId), e.qty).subscribe({
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