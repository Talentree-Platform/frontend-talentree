import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, switchMap, catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { OwnerProductDetail, OwnerProductStatus } from '../../../core/interfaces/owner-product';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

@Component({
  selector: 'app-owner-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CarouselModule],
  templateUrl: './owner-product-details.component.html',
  styleUrl: './owner-product-details.component.css'
})
export class OwnerProductDetailsComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();
  private readonly lowStockMax = 5;

  product: OwnerProductDetail | null = null;
  loading = true;
  loadError: string | null = null;
  invalidRoute = false;

  selectedImageUrl = '';

  /** Owl Carousel — product image slider when gallery has 2+ images */
  readonly galleryCarouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 400,
    navText: ['‹', '›'],
    items: 1,
    margin: 0,
    nav: true,
    autoplay: false,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      600: { items: 1 }
    }
  };

  @ViewChild('galleryCarousel', { static: false }) galleryCarousel?: CarouselComponent;

  deleteOpen = false;
  statsOpen = false;
  deleteBusy = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = Number(params.get('id'));
            if (Number.isNaN(id) || id <= 0) {
              this.invalidRoute = true;
              this.loading = false;
              return of<OwnerProductDetail | null>(null);
            }
            this.invalidRoute = false;
            this.loading = true;
            this.loadError = null;
            this.product = null;
            return this.productsApi.getProductById(id).pipe(
              catchError((err: unknown) => {
                let msg = 'We could not load this product. Please try again.';
                if (err instanceof HttpErrorResponse) {
                  const body = err.error;
                  if (typeof body === 'object' && body && 'message' in body) {
                    msg = String((body as { message: string }).message);
                  } else if (typeof body === 'string' && body.trim()) {
                    msg = body;
                  } else if (err.status === 404) {
                    msg = 'Product not found.';
                  } else if (err.message) {
                    msg = err.message;
                  }
                } else if (err instanceof Error) {
                  msg = err.message || msg;
                }
                this.loadError = msg;
                return of<OwnerProductDetail | null>(null);
              })
            );
          })
        )
        .subscribe((data) => {
          this.loading = false;
          if (this.invalidRoute) return;
          if (this.loadError && !data) return;
          if (!data) {
            if (!this.loadError) {
              this.loadError = 'Product not found.';
            }
            return;
          }
          this.product = data;
          this.selectedImageUrl = data.mainImageUrl;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get galleryImages(): string[] {
    if (!this.product?.images?.length) return this.product?.mainImageUrl ? [this.product.mainImageUrl] : [];
    return this.product.images;
  }

  selectImage(url: string): void {
    this.selectedImageUrl = url;
    const idx = this.galleryImages.indexOf(url);
    if (idx >= 0 && this.galleryCarousel) {
      this.galleryCarousel.to(String(idx));
    }
  }

  onGalleryTranslated(event: { startPosition?: number }): void {
    const i = typeof event?.startPosition === 'number' ? event.startPosition : 0;
    const list = this.galleryImages;
    if (list[i]) {
      this.selectedImageUrl = list[i];
    }
  }

  isLowStock(): boolean {
    const q = this.product?.stockQuantity ?? 0;
    return q > 0 && q <= this.lowStockMax;
  }

  statusLabel(s: OwnerProductStatus): string {
    const m: Record<OwnerProductStatus, string> = {
      active: 'Active',
      draft: 'Draft',
      under_review: 'Pending',
      rejected: 'Rejected',
      out_of_stock: 'Out of Stock'
    };
    return m[s] ?? this.product?.statusText ?? 'Unknown';
  }

  formatMoney(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  }

  goBackToList(): void {
    void this.router.navigate(['/businessowner/ownerProduct']);
  }

  goEdit(): void {
    if (!this.product) return;
    void this.router.navigate(['/businessowner/ownerEditProduct', this.product.id]);
  }

  openDelete(): void {
    this.deleteOpen = true;
  }

  closeDelete(): void {
    if (this.deleteBusy) return;
    this.deleteOpen = false;
  }

  confirmDelete(): void {
    if (!this.product) return;
    if (this.deleteBusy) return;

    this.deleteBusy = true;

    this.subs.add(
      this.productsApi.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.deleteBusy = false;
          this.deleteOpen = false;
          this.toastr.success('Product was removed.', 'Deleted');
          void this.router.navigate(['/businessowner/ownerProduct']);
        },
        error: (err: unknown) => {
          this.deleteBusy = false;
          this.handleDeleteError(err);
        }
      })
    );
  }

  private handleDeleteError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        this.toastr.error('You are not allowed to delete this product.', 'Not allowed');
      } else if (err.status === 404) {
        this.toastr.error('Product not found.', 'Delete failed');
      } else {
        this.toastr.error(this.messageFromHttpError(err) ?? 'Could not delete this product.', 'Delete failed');
      }
    } else {
      this.toastr.error('Could not delete this product.', 'Delete failed');
    }
  }

  private messageFromHttpError(err: HttpErrorResponse): string | null {
    const body = err.error;
    if (typeof body === 'object' && body && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (typeof body === 'string' && body.trim()) return body;
    return err.message || null;
  }

  duplicateProduct(): void {
    if (!this.product) return;
    this.toastr.info(
      'Opening add product with duplicated fields will be available in a future update.',
      'Duplicate'
    );
  }

  openStats(): void {
    this.statsOpen = true;
  }

  closeStats(): void {
    this.statsOpen = false;
  }
}
