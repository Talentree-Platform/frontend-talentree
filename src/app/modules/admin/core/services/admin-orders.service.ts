import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import {
    OrderListItem,
    MaterialOrderListItem,
    OrderDetail,
    OrderStats,
    UpdateOrderStatusDto,
    OrderFilterParams,
} from '../Interfaces/iorder';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {

    constructor(private _HttpClient: HttpClient) { }

    private apiUrl = `${environment.baseUrl}/api/AdminOrders`;

    // ── GET /api/AdminOrders ──────────────────────────────────────────────────
    // NOTE: This endpoint returns the PaginatedResponse object directly
    // (pageIndex, pageSize, count, data, totalPages, ...) WITHOUT the
    // outer ApiResponse<> wrapper (no success/message wrapping it).
    // Status int32: 0=Pending,1=Confirmed,2=Processing,3=Shipped,4=Delivered,5=Cancelled,6=Refunded
    // PaymentStatus int32: 0=Pending,1=Paid,2=Failed,3=Unpaid (or 3=Refunded)
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
            if (params.pageIndex != null) httpParams = httpParams.set('PageIndex', params.pageIndex.toString());
            if (params.pageSize != null) httpParams = httpParams.set('PageSize', params.pageSize.toString());
        }
        return this._HttpClient.get<PaginatedResponse<OrderListItem>>(
            this.apiUrl, { params: httpParams }
        );
    }

    // ── GET /api/AdminOrders/materials ────────────────────────────────────────
    getMaterialOrders(params?: OrderFilterParams): Observable<PaginatedResponse<MaterialOrderListItem>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.search) httpParams = httpParams.set('Search', params.search);
            if (params.status != null) httpParams = httpParams.set('Status', params.status.toString());
            if (params.paymentStatus != null) httpParams = httpParams.set('PaymentStatus', params.paymentStatus.toString());
            if (params.dateFrom) httpParams = httpParams.set('DateFrom', params.dateFrom);
            if (params.dateTo) httpParams = httpParams.set('DateTo', params.dateTo);
            if (params.sortBy) httpParams = httpParams.set('SortBy', params.sortBy);
            if (params.sortDesc != null) httpParams = httpParams.set('SortDesc', params.sortDesc.toString());
            if (params.pageIndex != null) httpParams = httpParams.set('PageIndex', params.pageIndex.toString());
            if (params.pageSize != null) httpParams = httpParams.set('PageSize', params.pageSize.toString());
        }
        return this._HttpClient.get<PaginatedResponse<MaterialOrderListItem>>(
            `${this.apiUrl}/materials`, { params: httpParams }
        );
    }

    // ── GET /api/AdminOrders/{id} ─────────────────────────────────────────────
    // NOTE: This endpoint returns the order object directly, WITHOUT the
    // outer ApiResponse<> wrapper (no success/message/data wrapping it).
    getOrderById(id: number): Observable<OrderDetail> {
        return this._HttpClient.get<OrderDetail>(`${this.apiUrl}/${id}`);
    }

    // ── GET /api/AdminOrders/stats ────────────────────────────────────────────
    getStats(): Observable<OrderStats> {
        return this._HttpClient.get<OrderStats>(`${this.apiUrl}/stats`);
    }

    // ── PUT /api/AdminOrders/{id}/status ─────────────────────────────────────
    // FIX: send the dto object directly as the body — do NOT wrap it in
    // { dto }. The backend expects newStatus/reason/... at the root of the
    // JSON body, matching the Swagger schema exactly.
    updateStatus(id: number, dto: UpdateOrderStatusDto): Observable<ApiResponse<null>> {
        // Defensive: make sure newStatus is a real number even if a caller
        // accidentally passes a string value from a <select>.
        const payload: UpdateOrderStatusDto = {
            ...dto,
            newStatus: Number(dto.newStatus),
        };
        return this._HttpClient.put<ApiResponse<null>>(`${this.apiUrl}/${id}/status`, payload);
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