import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../core/Interfaces/ibusiness-owner';
import {
  RawMaterial,
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RestockMaterialDto,
  RawMaterialFilterParams
} from '../core/Interfaces/iraw-material';

@Injectable({ providedIn: 'root' })
export class RawMaterialService {

  constructor(private _HttpClient: HttpClient) {}

  apiUrl = 'https://talentreeplateform.runasp.net/api/AdminRawMaterial';

  // ── GET all (with filters + pagination) ──────────────────────────────────

  getRawMaterials(params?: RawMaterialFilterParams)
    : Observable<ApiResponse<PaginatedResponse<RawMaterial>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.category)    httpParams = httpParams.set('category', params.category);
      if (params.search)      httpParams = httpParams.set('search', params.search);
      if (params.isAvailable !== undefined)
                              httpParams = httpParams.set('isAvailable', params.isAvailable);
      if (params.pageIndex)   httpParams = httpParams.set('pageIndex', params.pageIndex);
      if (params.pageSize)    httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<RawMaterial>>>(
      this.apiUrl, { params: httpParams }
    );
  }

  // ── GET by id ─────────────────────────────────────────────────────────────

  getRawMaterialById(id: number): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.get<ApiResponse<RawMaterial>>(`${this.apiUrl}/${id}`);
  }

  // ── POST create ───────────────────────────────────────────────────────────

  createRawMaterial(dto: CreateRawMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.post<ApiResponse<RawMaterial>>(this.apiUrl, dto);
  }

  // ── PUT update ────────────────────────────────────────────────────────────

  updateRawMaterial(id: number, dto: UpdateRawMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.put<ApiResponse<RawMaterial>>(`${this.apiUrl}/${id}`, dto);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  deleteRawMaterial(id: number): Observable<ApiResponse<null>> {
    return this._HttpClient.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  // ── PATCH restock ─────────────────────────────────────────────────────────

  restockMaterial(id: number, dto: RestockMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.patch<ApiResponse<RawMaterial>>(
      `${this.apiUrl}/${id}/restock`, dto
    );
  }

  // ── POST upload image ─────────────────────────────────────────────────────

  uploadImage(id: number, file: File): Observable<ApiResponse<null>> {
    const formData = new FormData();
    formData.append('image', file);
    return this._HttpClient.post<ApiResponse<null>>(
      `${this.apiUrl}/${id}/upload-image`, formData
    );
  }
}