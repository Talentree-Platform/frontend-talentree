import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Review,
  ReviewFilters,
  ReviewPaginatedData,
  ReviewAnalytics,
  ReviewApiResponse,
  RespondToReviewRequest,
} from './reviews.models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly base = '/api/BusinessOwnerReviews';

  constructor(private http: HttpClient) {}

  getReviews(filters: ReviewFilters = {}): Observable<ReviewPaginatedData> {
    let params = new HttpParams();
    if (filters.rating     != null) params = params.set('Rating',          filters.rating);
    if (filters.productId  != null) params = params.set('ProductId',       filters.productId);
    if (filters.search)             params = params.set('Search',          filters.search);
    if (filters.sortBy)             params = params.set('SortBy',          filters.sortBy);
    if (filters.sortDescending != null) params = params.set('SortDescending', filters.sortDescending);
    params = params.set('PageIndex', filters.pageIndex ?? 0);
    params = params.set('PageSize',  filters.pageSize  ?? 10);

    return this.http
      .get<ReviewApiResponse<ReviewPaginatedData>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getAnalytics(): Observable<ReviewAnalytics> {
    return this.http
      .get<ReviewApiResponse<ReviewAnalytics>>(`${this.base}/analytics`)
      .pipe(map(r => r.data));
  }

  respondToReview(id: number, response: string): Observable<Review> {
    const body: RespondToReviewRequest = { response };
    return this.http
      .post<ReviewApiResponse<Review>>(`${this.base}/${id}/respond`, body)
      .pipe(map(r => r.data));
  }

  editResponse(id: number, response: string): Observable<Review> {
    const body: RespondToReviewRequest = { response };
    return this.http
      .put<ReviewApiResponse<Review>>(`${this.base}/${id}/respond`, body)
      .pipe(map(r => r.data));
  }
}