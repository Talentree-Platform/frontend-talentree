import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  KbItem,
  KbRecommendation,
  KbPaginatedData,
  KbApiResponse,
  KbFilters,
} from './kb.models';

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService {
  private readonly base = '/api/KnowledgeBase';

  constructor(private http: HttpClient) {}

  getItems(
    filters: KbFilters = {}
  ): Observable<KbPaginatedData<KbItem>> {
    let params = new HttpParams();
    if (filters.search)      params = params.set('Search',      filters.search);
    if (filters.category)    params = params.set('Category',    filters.category);
    if (filters.contentType) params = params.set('ContentType', filters.contentType);
    if (filters.tag)         params = params.set('Tag',         filters.tag);
    if (filters.pageIndex != null) params = params.set('PageIndex', filters.pageIndex);
    params = params.set('PageSize', filters.pageSize ?? 12);

    return this.http
      .get<KbApiResponse<KbPaginatedData<KbItem>>>(this.base, { params })
      .pipe(map((r) => r.data));
  }

  getItem(id: number): Observable<KbItem> {
    return this.http
      .get<KbApiResponse<KbItem>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  getBookmarks(): Observable<KbItem[]> {
    return this.http
      .get<KbApiResponse<KbItem[]>>(`${this.base}/bookmarks`)
      .pipe(map((r) => r.data));
  }

  getRecommendations(): Observable<KbRecommendation[]> {
    return this.http
      .get<KbApiResponse<KbRecommendation[]>>(`${this.base}/recommendations`)
      .pipe(map((r) => r.data));
  }

  addBookmark(id: number): Observable<void> {
    return this.http
      .post<KbApiResponse<string>>(`${this.base}/${id}/bookmark`, {})
      .pipe(map(() => void 0));
  }

  removeBookmark(id: number): Observable<void> {
    return this.http
      .delete<KbApiResponse<string>>(`${this.base}/${id}/bookmark`)
      .pipe(map(() => void 0));
  }

  toggleBookmark(item: KbItem): Observable<void> {
    return item.isBookmarked
      ? this.removeBookmark(item.id)
      : this.addBookmark(item.id);
  }
}