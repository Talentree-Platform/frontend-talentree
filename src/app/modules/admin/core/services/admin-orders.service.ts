import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import {
    OrderListItem,
    OrderDetail,
    OrderStats,
    UpdateOrderStatusDto,
    OrderFilterParams,
} from '../Interfaces/iorder';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {

    constructor(private _HttpClient: HttpClient) { }

    private apiUrl = '/api/AdminOrders';

    // ── GET /api/AdminOrders ──────────────────────────────────────────────────
    // NOTE: This endpoint returns the PaginatedResponse object directly
    // (pageIndex, pageSize, count, data, totalPages, ...) WITHOUT the
    // outer ApiResponse<> wrapper (no success/message wrapping it).
    getOrders(params?: OrderFilterParams): Observable<PaginatedResponse<OrderListItem>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.search) httpParams = httpParams.set('Search', params.search);
            if (params.status != null) httpParams = httpParams.set('Status', params.status.toString());
            if (params.paymentStatus != null) httpParams = httpParams.set('PaymentStatus', params.paymentStatus.toString());
            if (params.dateFrom) httpParams = httpParams.set('DateFrom', params.dateFrom);
            if (params.dateTo) httpParams = httpParams.set('DateTo', params.dateTo);
            if (params.sortBy) httpParams = httpParams.set('SortBy', params.sortBy);
            if (params.sortDesc != null) httpParams = httpParams.set('SortDesc', params.sortDesc.toString());
            if (params.pageIndex) httpParams = httpParams.set('PageIndex', params.pageIndex.toString());
            if (params.pageSize) httpParams = httpParams.set('PageSize', params.pageSize.toString());
        }
        return this._HttpClient.get<PaginatedResponse<OrderListItem>>(
            this.apiUrl, { params: httpParams }
        );
    }

    // ── GET /api/AdminOrders/{id} ─────────────────────────────────────────────
    // NOTE: This endpoint returns the order object directly, WITHOUT the
    // outer ApiResponse<> wrapper (no success/message/data wrapping it).
    getOrderById(id: number): Observable<OrderDetail> {
        return this._HttpClient.get<OrderDetail>(`${this.apiUrl}/${id}`);
    }

    // ── GET /api/AdminOrders/stats ────────────────────────────────────────────
    getStats(): Observable<ApiResponse<OrderStats>> {
        return this._HttpClient.get<ApiResponse<OrderStats>>(`${this.apiUrl}/stats`);
    }

    // ── PUT /api/AdminOrders/{id}/status ─────────────────────────────────────
    updateStatus(id: number, dto: UpdateOrderStatusDto): Observable<ApiResponse<null>> {
        return this._HttpClient.put<ApiResponse<null>>(`${this.apiUrl}/${id}/status`, dto);
    }

    // ── POST /api/AdminOrders/{id}/notes ─────────────────────────────────────
    addNote(id: number, note: string): Observable<ApiResponse<null>> {
        return this._HttpClient.post<ApiResponse<null>>(
            `${this.apiUrl}/${id}/notes`,
            JSON.stringify(note),
            { headers: { 'Content-Type': 'application/json' } }
        );
    }

    // ── GET /api/AdminOrders/export ───────────────────────────────────────────
    exportOrders(params?: OrderFilterParams): Observable<Blob> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.search) httpParams = httpParams.set('Search', params.search);
            if (params.status != null) httpParams = httpParams.set('Status', params.status.toString());
            if (params.paymentStatus != null) httpParams = httpParams.set('PaymentStatus', params.paymentStatus.toString());
            if (params.dateFrom) httpParams = httpParams.set('DateFrom', params.dateFrom);
            if (params.dateTo) httpParams = httpParams.set('DateTo', params.dateTo);
            if (params.sortBy) httpParams = httpParams.set('SortBy', params.sortBy);
            if (params.sortDesc != null) httpParams = httpParams.set('SortDesc', params.sortDesc.toString());
        }
        return this._HttpClient.get(`${this.apiUrl}/export`, {
            params: httpParams,
            responseType: 'blob',
        });
    }
}