import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerMarketplaceService } from '../../Core/services/customer-marketplace.service';
import { ProductReview, ReviewDistribution, PaginatedResponse } from '../../Core/interfaces/customer';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss'],
})
export class ProductReviewsComponent implements OnInit {
  /** The product id — passed from the parent (product-details page) */
  readonly productId = input.required<number>();

  protected readonly svc = inject(CustomerMarketplaceService);

  // ── State ──────────────────────────────────────────────────────────────────

  protected readonly distribution   = signal<ReviewDistribution | null>(null);
  protected readonly distLoading    = signal(false);

  protected readonly reviews        = signal<PaginatedResponse<ProductReview> | null>(null);
  protected readonly reviewsLoading = signal(false);
  protected readonly reviewsError   = signal<string | null>(null);

  protected readonly currentPage  = signal(1);
  protected readonly ratingFilter = signal<number | null>(null);
  protected readonly sortBy       = signal<string>('newest');

  // ── Submit-review form ────────────────────────────────────────────────────

  protected readonly showForm     = signal(false);
  protected readonly submitting   = signal(false);
  protected readonly submitError  = signal<string | null>(null);
  protected readonly submitSuccess = signal(false);

  protected formRating      = 0;
  protected formHoverRating = 0;
  protected formTitle       = '';
  protected formText        = '';
  protected formAnonymous   = false;
  protected formPhotos: File[] = [];

  // ── "Helpful" optimistic tracking ─────────────────────────────────────────
  protected readonly votedIds = signal<Set<number>>(new Set());

  // ── Derived ───────────────────────────────────────────────────────────────

  protected readonly reviewList = computed(() => this.reviews()?.data ?? []);
  protected readonly totalPages = computed(() => this.reviews()?.totalPages ?? 1);
  protected readonly hasNext    = computed(() => this.reviews()?.hasNext ?? false);
  protected readonly hasPrev    = computed(() => this.reviews()?.hasPrevious ?? false);

  protected readonly starBreakdown = computed(() => {
    const d = this.distribution();
    if (!d) return [];
    const total = d.totalReviews || 1;
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: d.starCounts[String(star)] ?? 0,
      pct: Math.round(((d.starCounts[String(star)] ?? 0) / total) * 100),
    }));
  });

  protected readonly avgRating = computed(() => this.distribution()?.averageRating ?? 0);
  protected readonly totalCount = computed(() => this.distribution()?.totalReviews ?? 0);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDistribution();
    this.loadReviews();
  }

  // ── API calls ─────────────────────────────────────────────────────────────

  private loadDistribution(): void {
    this.distLoading.set(true);
    this.svc.getReviewDistribution(this.productId()).subscribe({
      next: res => {
        if (res.success) this.distribution.set(res.data);
        this.distLoading.set(false);
      },
      error: () => this.distLoading.set(false),
    });
  }

  protected loadReviews(page = 1): void {
    this.reviewsLoading.set(true);
    this.reviewsError.set(null);
    this.currentPage.set(page);

    const params: { Rating?: number; SortBy?: string; PageIndex: number; PageSize: number } = {
      PageIndex: page,
      PageSize: 8,
      SortBy: this.sortBy(),
    };
    const r = this.ratingFilter();
    if (r !== null) params.Rating = r;

    this.svc.getProductReviews(this.productId(), params).subscribe({
      next: res => {
        if (res.success) this.reviews.set(res.data);
        else this.reviewsError.set(res.message ?? 'Failed to load reviews.');
        this.reviewsLoading.set(false);
      },
      error: err => {
        this.reviewsError.set(err?.error?.message ?? 'Failed to load reviews.');
        this.reviewsLoading.set(false);
      },
    });
  }

  // ── Filter / sort controls ─────────────────────────────────────────────────

  protected setRatingFilter(star: number | null): void {
    this.ratingFilter.set(star);
    this.loadReviews(1);
  }

  protected setSortBy(sort: string): void {
    this.sortBy.set(sort);
    this.loadReviews(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadReviews(page);
  }

  // ── Helpful vote ──────────────────────────────────────────────────────────

  protected voteHelpful(review: ProductReview): void {
    if (this.votedIds().has(review.id)) return;

    // Optimistic update
    this.votedIds.update(set => {
      const next = new Set(set);
      next.add(review.id);
      return next;
    });

    // Optimistic counter bump
    this.reviews.update(r => {
      if (!r) return r;
      return {
        ...r,
        data: r.data.map(rv =>
          rv.id === review.id ? { ...rv, helpfulVotes: rv.helpfulVotes + 1 } : rv
        ),
      };
    });

    this.svc.voteReviewHelpful(review.id).subscribe({
      error: () => {
        // Rollback on error
        this.votedIds.update(set => {
          const next = new Set(set);
          next.delete(review.id);
          return next;
        });
        this.reviews.update(r => {
          if (!r) return r;
          return {
            ...r,
            data: r.data.map(rv =>
              rv.id === review.id ? { ...rv, helpfulVotes: Math.max(0, rv.helpfulVotes - 1) } : rv
            ),
          };
        });
      },
    });
  }

  // ── Submit review form ────────────────────────────────────────────────────

  protected setFormRating(star: number): void { this.formRating = star; }
  protected hoverRating(star: number): void   { this.formHoverRating = star; }
  protected clearHover(): void                { this.formHoverRating = 0; }

  protected onPhotosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.formPhotos = Array.from(input.files).slice(0, 5);
    }
  }

  protected submitReview(): void {
    if (this.formRating === 0 || !this.formText.trim()) return;

    this.submitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    this.svc.createProductReview(this.productId(), {
      ProductId:   this.productId(),
      Rating:      this.formRating,
      ReviewTitle: this.formTitle.trim() || undefined,
      ReviewText:  this.formText.trim(),
      IsAnonymous: this.formAnonymous,
      photos:      this.formPhotos.length > 0 ? this.formPhotos : undefined,
    }).subscribe({
      next: res => {
        if (res.success) {
          this.submitSuccess.set(true);
          this.resetForm();
          // Refresh list and distribution after successful submission
          this.loadDistribution();
          this.loadReviews(1);
          setTimeout(() => {
            this.showForm.set(false);
            this.submitSuccess.set(false);
          }, 2000);
        } else {
          this.submitError.set(res.message ?? 'Failed to submit review.');
        }
        this.submitting.set(false);
      },
      error: err => {
        this.submitError.set(err?.error?.message ?? 'Failed to submit review.');
        this.submitting.set(false);
      },
    });
  }

  private resetForm(): void {
    this.formRating     = 0;
    this.formHoverRating = 0;
    this.formTitle      = '';
    this.formText       = '';
    this.formAnonymous  = false;
    this.formPhotos     = [];
  }

  // ── Utils ─────────────────────────────────────────────────────────────────

  protected starsArray(n: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  protected getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  protected formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  protected pages(): number[] {
    const total = this.totalPages();
    const cur   = this.currentPage();
    const range: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) {
      range.push(i);
    }
    return range;
  }
}
