import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environments';
import {
    Transaction,
    PaginatedResponse,
    TransactionQueryParams,
    ReportQueryParams,
} from '../../core/services/transactions.model';

@Injectable({ providedIn: 'root' })
export class AdminTransactionsService {
    private readonly base = `/api/AdminTransactions`;

    constructor(private http: HttpClient) { }

    getTransactions(
        query: TransactionQueryParams = {}
    ): Observable<PaginatedResponse<Transaction>> {
        let params = new HttpParams();

        if (query.BoId !== undefined && query.BoId !== null) {
            params = params.set('BoId', query.BoId.toString());
        }
        if (query.Type !== undefined && query.Type !== null) {
            params = params.set('Type', query.Type.toString());
        }
        if (query.DateFrom) params = params.set('DateFrom', query.DateFrom);
        if (query.DateTo) params = params.set('DateTo', query.DateTo);
        if (query.AnomalyFlaggedOnly) {
            params = params.set('AnomalyFlaggedOnly', 'true');
        }
        if (query.Search) params = params.set('Search', query.Search);
        if (query.PageIndex !== undefined) {
            params = params.set('PageIndex', query.PageIndex.toString());
        }
        if (query.PageSize !== undefined) {
            params = params.set('PageSize', query.PageSize.toString());
        }

        return this.http.get<PaginatedResponse<Transaction>>(this.base, { params });
    }

    downloadReport(query: ReportQueryParams = {}): Observable<Blob> {
        let params = new HttpParams();
        if (query.from) params = params.set('from', query.from);
        if (query.to) params = params.set('to', query.to);

        return this.http.get(`${this.base}/report`, {
            params,
            responseType: 'blob',
        });
    }
}