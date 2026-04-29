import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../core/Interfaces/ibusiness-owner';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilterParams
} from '../core/Interfaces/isupplier';

@Injectable({ providedIn: 'root' })
export class SupplierService {

  constructor(private _HttpClient: HttpClient) {}

 apiUrl = 'https://backtalentree.runasp.net/api/AdminSupplier';

  // ── GET all ───────────────────────────────────────────────────────────────

  getSuppliers(params?: SupplierFilterParams)
    : Observable<ApiResponse<PaginatedResponse<Supplier>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.search)                httpParams = httpParams.set('search', params.search);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);
      if (params.pageIndex)             httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)              httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<Supplier>>>(
      this.apiUrl, { params: httpParams }
    );
  }

  // ── GET by id ─────────────────────────────────────────────────────────────

  getSupplierById(id: number): Observable<ApiResponse<Supplier>> {
    return this._HttpClient.get<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`);
  }

  // ── POST create ───────────────────────────────────────────────────────────

  createSupplier(dto: CreateSupplierDto): Observable<ApiResponse<Supplier>> {
    return this._HttpClient.post<ApiResponse<Supplier>>(this.apiUrl, dto);
  }

  // ── PUT update ────────────────────────────────────────────────────────────

  updateSupplier(id: number, dto: UpdateSupplierDto): Observable<ApiResponse<Supplier>> {
    return this._HttpClient.put<ApiResponse<Supplier>>(`${this.apiUrl}/${id}`, dto);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  deleteSupplier(id: number): Observable<ApiResponse<null>> {
    return this._HttpClient.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}