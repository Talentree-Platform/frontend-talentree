import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  PaginatedResponse,
  Ticket,
  TicketDetails,
  TicketMessage,
  Faq,
  FaqCategory,
  TicketListParams,
} from '../interfaces/i-support';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly base = '/api/Support';

  constructor(private http: HttpClient) {}

  // ── Tickets ────────────────────────────────

  createTicket(formData: FormData): Observable<Ticket> {
    return this.http
      .post<ApiResponse<Ticket>>(`${this.base}/tickets`, formData)
      .pipe(map(r => r.data));
  }

  getTickets(params: TicketListParams = {}): Observable<PaginatedResponse<Ticket>> {
    let httpParams = new HttpParams();
    if (params.pageNumber != null) httpParams = httpParams.set('pageNumber', params.pageNumber);
    if (params.pageSize   != null) httpParams = httpParams.set('pageSize',   params.pageSize);
    if (params.status     != null) httpParams = httpParams.set('status',     params.status);
    if (params.category   != null) httpParams = httpParams.set('category',   params.category);
    if (params.search)             httpParams = httpParams.set('search',     params.search);

    return this.http
      .get<ApiResponse<PaginatedResponse<Ticket>>>(`${this.base}/tickets`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getTicketById(id: string): Observable<TicketDetails> {
    return this.http
      .get<ApiResponse<TicketDetails>>(`${this.base}/tickets/${id}`)
      .pipe(map(r => r.data));
  }

  closeTicket(id: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(`${this.base}/tickets/${id}/close`, {})
      .pipe(map(() => void 0));
  }

  // ── Messages ───────────────────────────────

  sendMessage(formData: FormData): Observable<TicketMessage> {
    return this.http
      .post<ApiResponse<TicketMessage>>(`${this.base}/tickets/messages`, formData)
      .pipe(map(r => r.data));
  }

  // ── FAQ ────────────────────────────────────

  getFaqs(category?: string): Observable<Faq[]> {
    let httpParams = new HttpParams();
    if (category) httpParams = httpParams.set('category', category);
    return this.http
      .get<ApiResponse<Faq[]>>(`${this.base}/faqs`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  searchFaqs(query: string): Observable<Faq[]> {
    const httpParams = new HttpParams().set('query', query);
    return this.http
      .get<ApiResponse<Faq[]>>(`${this.base}/faqs/search`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getFaqById(id: string): Observable<Faq> {
    return this.http
      .get<ApiResponse<Faq>>(`${this.base}/faqs/${id}`)
      .pipe(map(r => r.data));
  }

  getCategories(): Observable<FaqCategory[]> {
    return this.http
      .get<ApiResponse<FaqCategory[]>>(`${this.base}/faqs/categories`)
      .pipe(map(r => r.data));
  }
}