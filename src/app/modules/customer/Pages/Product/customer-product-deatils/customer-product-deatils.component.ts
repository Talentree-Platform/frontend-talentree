import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CustomerMarketplaceService } from '../../../Core/services/customer-marketplace.service';
import { CustomerProductCardComponent } from '../../../components/customer-product-card/customer-product-card.component';
import { ProductReviewsComponent } from '../../../components/product-reviews/product-reviews.component';

type DetailsTab = 'description' | 'specifications' | 'shipping';

@Component({
  selector: 'app-customer-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerProductCardComponent, ProductReviewsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-product-deatils.component.html',
  styleUrl: './customer-product-deatils.component.scss',
})
export class CustomerProductDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly marketplace = inject(CustomerMarketplaceService);

  // ── Local UI state (page-specific, doesn't belong in the service) ──
  protected readonly activeTab = signal<DetailsTab>('description');
  protected readonly selectedImageIndex = signal<number>(0);
  protected readonly quantity = signal<number>(1);

  // ── Derived from service state ──
  protected readonly product = computed(() => this.marketplace.productDetails());
  protected readonly loading = computed(() => this.marketplace.productDetailsLoading());
  protected readonly error = computed(() => this.marketplace.productDetailsError());

  // similarProducts comes embedded in the product details response, but its
  // shape (SimilarProduct) doesn't line up with CustomerProductCardComponent's
  // `Product` input. Adapt here rather than changing the shared card
  // component or the API model.
  //
  // ASSUMPTIONS (please verify against your real Product model):
  //   - id, categoryId, brandId  <- converted to string (Product types all
  //     identifiers as string; the API returns them as numbers)
  //   - imageUrl                 <- first entry of imageUrls (or empty string)
  //   - isAvailable               <- stockQuantity > 0
  // If Product has additional required fields beyond these, add them
  // to this mapping the same way.
  protected readonly relatedProducts = computed(() => {
    const similar = this.product()?.similarProducts ?? [];
    return similar.map((item) => ({
      ...item,
      id: String(item.id),
      categoryId: String(item.categoryId),
      brandId: String(item.brandId),
      imageUrl: item.imageUrls[0] ?? '',
      isAvailable: item.stockQuantity > 0,
    }));
  });

  protected readonly selectedImage = computed<string | null>(() => {
    const details = this.product();
    if (!details || details.imageUrls.length === 0) return null;
    return details.imageUrls[this.selectedImageIndex()] ?? details.imageUrls[0];
  });

  protected readonly isInStock = computed(() => {
    const details = this.product();
    return !!details && details.stockQuantity > 0;
  });

  protected readonly isAtMaxQuantity = computed(() => {
    const details = this.product();
    return !!details && this.quantity() >= details.stockQuantity;
  });

  protected readonly isAtMinQuantity = computed(() => this.quantity() <= 1);

  private productId: string | null = null;

  /** Numeric product ID exposed to the reviews child component */
  protected readonly productIdNum = computed(() => {
    const p = this.product();
    return p ? p.id : null;
  });

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    this.marketplace.resetProductDetailsState();
  }

  private loadProduct(id: string): void {
    this.marketplace.loadProductDetails(id);
  }

  protected retryLoad(): void {
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected setTab(tab: DetailsTab): void {
    this.activeTab.set(tab);
  }

  protected incrementQuantity(): void {
    if (!this.isAtMaxQuantity()) {
      this.quantity.update((qty) => qty + 1);
    }
  }

  protected decrementQuantity(): void {
    if (!this.isAtMinQuantity()) {
      this.quantity.update((qty) => qty - 1);
    }
  }

  protected addToCart(): void {
    const details = this.product();
    if (!details) return;
    this.marketplace.addToCart(String(details.id), this.quantity());
  }

  protected buyNow(): void {
    const details = this.product();
    if (!details) return;
    this.marketplace.addToCart(String(details.id), this.quantity());
    // Navigate to your existing checkout route here, e.g.:
    // this.router.navigate(['/checkout']);
  }
}