import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';

export interface AdminArticleDto {
  id: number;
  title: string;
  summary: string;
  contentType: string;
  category: string;
  tags: string;
  orderIndex: number;
  isPublished: boolean;
  content: string;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeQuery {
  Search?: string;
  Category?: string;
  ContentType?: string;
  Status?: string;
  SortBy?: string;
  SortDesc?: boolean;
  PageIndex?: number;
  PageSize?: number;
}

export interface KnowledgeAnalytics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
}

export interface ArticleAnalytics {
  articleId: number;
  title: string;
  viewCount: number;
  category: string;
  contentType: string;
  isPublished: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminKnowledgeService {
  private readonly base = '/api/AdminKnowledge';
  constructor(private http: HttpClient) { }

  getArticles(query?: KnowledgeQuery): Observable<ApiResponse<PaginatedResponse<AdminArticleDto>>> {
    let params = new HttpParams();
    if (query) {
      if (query.Search) params = params.set('Search', query.Search);
      if (query.Category) params = params.set('Category', query.Category);
      if (query.ContentType) params = params.set('ContentType', query.ContentType);
      if (query.Status) params = params.set('Status', query.Status);
      if (query.SortBy) params = params.set('SortBy', query.SortBy);
      if (query.SortDesc !== undefined) params = params.set('SortDesc', String(query.SortDesc));
      if (query.PageIndex) params = params.set('PageIndex', String(query.PageIndex));
      if (query.PageSize) params = params.set('PageSize', String(query.PageSize));
    }
    return this.http.get<ApiResponse<PaginatedResponse<AdminArticleDto>>>(this.base, { params });
  }

  createArticle(formData: FormData): Observable<ApiResponse<AdminArticleDto>> {
    return this.http.post<ApiResponse<AdminArticleDto>>(this.base, formData);
  }

  getArticleById(id: number): Observable<ApiResponse<AdminArticleDto>> {
    return this.http.get<ApiResponse<AdminArticleDto>>(`${this.base}/${id}`);
  }

  updateArticle(id: number, formData: FormData): Observable<ApiResponse<AdminArticleDto>> {
    return this.http.put<ApiResponse<AdminArticleDto>>(`${this.base}/${id}`, formData);
  }

  deleteArticle(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/${id}`);
  }

  publishArticle(id: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/${id}/publish`, {});
  }

  unpublishArticle(id: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/${id}/unpublish`, {});
  }

  restoreArticle(id: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/${id}/restore`, {});
  }

  getAnalytics(): Observable<ApiResponse<KnowledgeAnalytics>> {
    return this.http.get<ApiResponse<KnowledgeAnalytics>>(`${this.base}/analytics`);
  }

  getAnalyticsArticles(): Observable<ApiResponse<PaginatedResponse<ArticleAnalytics>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ArticleAnalytics>>>(`${this.base}/analytics/articles`);
  }
}
