import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../Interfaces/ibusiness-owner';
import {
  RawMaterial,
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RestockMaterialDto,
  RawMaterialFilterParams
} from '../Interfaces/iraw-material';
import { environment } from '../../../../core/environment/envirinment';

/**
 * Host for relative media paths (e.g. "/uploads/rawmaterials/xxx.jpg") returned by
 * the API. Images are static files served from the API host's root, not behind
 * "/api" — unlike JSON endpoints, they must hit the real backend origin directly
 * (same pattern as BusinessOwnerProductsService / OwnerSettingService), not the
 * dev-server's "/api" proxy prefix.
 */
const API_MEDIA_ORIGIN = environment.AzureUrl;

@Injectable({ providedIn: 'root' })
export class RawMaterialService {

  constructor(private _HttpClient: HttpClient) {}

 apiUrl = `${environment.baseUrl}/api/AdminRawMaterial`;
//  apiUrl='/api/AdminRawMaterial'

  private getFullImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const p = path.trim();
    if (!p) return null;
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('//')) return `https:${p}`;
    return p.startsWith('/') ? `${API_MEDIA_ORIGIN}${p}` : `${API_MEDIA_ORIGIN}/${p}`;
  }

  private resolveMaterial(material: RawMaterial): RawMaterial {
    return { ...material, pictureUrl: this.getFullImageUrl(material.pictureUrl) };
  }

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
    ).pipe(
      map((res) => ({
        ...res,
        data: { ...res.data, data: res.data.data.map((m) => this.resolveMaterial(m)) }
      }))
    );
  }

  // ── GET by id ─────────────────────────────────────────────────────────────

  getRawMaterialById(id: number): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.get<ApiResponse<RawMaterial>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => ({ ...res, data: this.resolveMaterial(res.data) }))
    );
  }

  // ── POST create ───────────────────────────────────────────────────────────

  createRawMaterial(dto: CreateRawMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.post<ApiResponse<RawMaterial>>(this.apiUrl, dto).pipe(
      map((res) => ({ ...res, data: this.resolveMaterial(res.data) }))
    );
  }

  // ── PUT update ────────────────────────────────────────────────────────────

  updateRawMaterial(id: number, dto: UpdateRawMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.put<ApiResponse<RawMaterial>>(`${this.apiUrl}/${id}`, dto).pipe(
      map((res) => ({ ...res, data: this.resolveMaterial(res.data) }))
    );
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  deleteRawMaterial(id: number): Observable<ApiResponse<null>> {
    return this._HttpClient.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  // ── PATCH restock ─────────────────────────────────────────────────────────

  restockMaterial(id: number, dto: RestockMaterialDto): Observable<ApiResponse<RawMaterial>> {
    return this._HttpClient.patch<ApiResponse<RawMaterial>>(
      `${this.apiUrl}/${id}/restock`, dto
    ).pipe(
      map((res) => ({ ...res, data: this.resolveMaterial(res.data) }))
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