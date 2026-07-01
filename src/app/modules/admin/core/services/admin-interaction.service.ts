import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import {
    InteractionItem,
    InteractionFilterParams,
    InteractionExportParams,
} from '../Interfaces/iinteractions';

@Injectable({ providedIn: 'root' })
export class AdminInteractionService {

    private readonly apiUrl = '/api/admin/interactions';

    constructor(private _HttpClient: HttpClient) { }

    // ── GET /api/admin/interactions/{userId} ──────────────────────────────────
    // Confirmed via Swagger: response IS wrapped in ApiResponse<PaginatedResponse<T>>
    // (success/data/message/errors/timestamp), unlike AdminOrders which is unwrapped.
    // Only `pageIndex` is a documented/supported query param for this endpoint.
    getUserInteractions(
        userId: string,
        params?: InteractionFilterParams
    ): Observable<ApiResponse<PaginatedResponse<InteractionItem>>> {
        let httpParams = new HttpParams();
        if (params?.pageIndex) {
            httpParams = httpParams.set('pageIndex', params.pageIndex.toString());
        }
        return this._HttpClient.get<ApiResponse<PaginatedResponse<InteractionItem>>>(
            `${this.apiUrl}/${encodeURIComponent(userId)}`,
            { params: httpParams }
        );
    }

    // ── GET /api/admin/interactions/export ────────────────────────────────────
    // Swagger doesn't document a response schema for this endpoint (raw 200 OK),
    // so we request it as a blob and read the file via observe:'response' to
    // inspect the real Content-Type header at download time (see component).
    exportInteractions(params?: InteractionExportParams): Observable<HttpResponse<Blob>> {
        let httpParams = new HttpParams();
        if (params?.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
        if (params?.toDate) httpParams = httpParams.set('toDate', params.toDate);

        return this._HttpClient.get(`${this.apiUrl}/export`, {
            params: httpParams,
            responseType: 'blob',
            observe: 'response',
        });
    }
}