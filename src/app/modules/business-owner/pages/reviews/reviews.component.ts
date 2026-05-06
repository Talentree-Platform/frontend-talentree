import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReviewsService } from '../../core/services/reviews.service';
import {
  Review,
  ReviewFilters,
  ReviewPaginatedData,
  ReviewAnalytics,
} from '../../core/services/reviews.models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  pagination: Omit<ReviewPaginatedData, 'data'> | null = null;
  analytics: ReviewAnalytics | null = null;

  loadingReviews = false;
  loadingAnalytics = false;
  errorReviews: string | null = null;

  // filters
  search = '';
  rating: number | '' = '';
  sortBy = 'createdAt';
  sortDescending = true;
  page = 0;
  readonly pageSize = 10;

  // respond
  respondingId: number | null = null;
  responseText = '';
  respondBusy = false;

  private destroy$ = new Subject<void>();

  constructor(private reviewsService: ReviewsService) {}

  ngOnInit(): void {
    this.fetchAnalytics();
    this.fetchReviews();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  fetchAnalytics(): void {
    this.loadingAnalytics = true;
    this.reviewsService
      .getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (data) => { this.analytics = data; this.loadingAnalytics = false; },
        error: ()     => { this.loadingAnalytics = false; },
      });
  }

  fetchReviews(): void {
    this.loadingReviews = true;
    this.errorReviews = null;
    const filters: ReviewFilters = {
      search:          this.search      || undefined,
      rating:          this.rating !== '' ? +this.rating : undefined,
      sortBy:          this.sortBy,
      sortDescending:  this.sortDescending,
      pageIndex:       this.page,
      pageSize:        this.pageSize,
    };
    this.reviewsService
      .getReviews(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const { data, ...meta } = res;
          this.reviews = data;
          this.pagination = meta;
          this.loadingReviews = false;
        },
        error: () => { this.errorReviews = 'Failed to load reviews.'; this.loadingReviews = false; },
      });
  }

  onFilterChange(): void { this.page = 0; this.fetchReviews(); }

  prev(): void { if (this.pagination?.hasPrevious) { this.page--; this.fetchReviews(); scrollTo(0, 0); } }
  next(): void { if (this.pagination?.hasNext)     { this.page++; this.fetchReviews(); scrollTo(0, 0); } }

  openRespond(review: Review): void {
    this.respondingId = review.id;
    this.responseText = review.ownerResponse || '';
  }

  cancelRespond(): void { this.respondingId = null; this.responseText = ''; }

  submitResponse(review: Review): void {
    if (!this.responseText.trim()) return;
    this.respondBusy = true;
    const call = review.hasResponse
      ? this.reviewsService.editResponse(review.id, this.responseText)
      : this.reviewsService.respondToReview(review.id, this.responseText);

    call.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        const idx = this.reviews.findIndex(r => r.id === updated.id);
        if (idx !== -1) this.reviews[idx] = updated;
        this.respondingId = null;
        this.responseText = '';
        this.respondBusy = false;
      },
      error: () => { this.respondBusy = false; },
    });
  }

  getStar(n: number): number {
  const d = this.analytics!.distribution;
  const map: Record<number, number> = {
    5: d.fiveStar, 4: d.fourStar, 3: d.threeStar, 2: d.twoStar, 1: d.oneStar
  };
  return map[n] ?? 0;
}

  stars(n: number): number[] { return Array(n).fill(0); }
  emptyStars(n: number): number[] { return Array(5 - n).fill(0); }

}