import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payout, PayoutHistoryResponse, PayoutRequest, WalletSummary } from '../interfaces/i-payout';

@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  private readonly baseUrl = 'https://backtalentree.runasp.net/api/Payout';

  constructor(private http: HttpClient) {}

  /**
   * Fetch paginated payout history for the current business owner.
   */
  getMyHistory(pageIndex: number = 1, pageSize: number = 20): Observable<PayoutHistoryResponse> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PayoutHistoryResponse>(`${this.baseUrl}/my-history`, { params });
  }

  /**
   * Submit a new payout / withdrawal request.
   */
  createPayout(payload: PayoutRequest): Observable<Payout> {
    return this.http.post<Payout>(this.baseUrl, payload);
  }

  
}
