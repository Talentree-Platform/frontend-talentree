import { ApiResponse, Material, PaginatedMaterialResponse } from './../interfaces/material';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';

/**
 * Host for relative media paths (e.g. "/images/materials/xxx.jpg") returned by the
 * API. Images are static files served from the API host's root, not behind "/api" —
 * unlike JSON endpoints, they must hit the real backend origin directly (same pattern
 * as BusinessOwnerProductsService / OwnerSettingService), not the dev-server's "/api"
 * proxy prefix.
 */
const API_MEDIA_ORIGIN = environment.AzureUrl;

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  constructor(private http:HttpClient) { }
  public apiUrl = `${environment.baseUrl}/api`;

  private getFullImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const p = path.trim();
    if (!p) return null;
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('//')) return `https:${p}`;
    return p.startsWith('/') ? `${API_MEDIA_ORIGIN}${p}` : `${API_MEDIA_ORIGIN}/${p}`;
  }

  private resolveMaterial(material: Material): Material {
    return { ...material, pictureUrl: this.getFullImageUrl(material.pictureUrl) };
  }

  getMaterials(params?: {
  category?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}): Observable<ApiResponse<PaginatedMaterialResponse<Material>>> {

  let httpParams = new HttpParams();

  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];

      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value);
      }
    });
  }

  return this.http.get<ApiResponse<PaginatedMaterialResponse<Material>>>(
    `${this.apiUrl}/RawMaterial`,
    { params: httpParams }
  ).pipe(
    map((res) => ({
      ...res,
      data: { ...res.data, data: res.data.data.map((m) => this.resolveMaterial(m)) }
    }))
  );
}

  getMaterialById(Id:number):Observable<ApiResponse<Material>>{
    return this.http.get<ApiResponse<Material>>(`${this.apiUrl}/RawMaterial/${Id}`).pipe(
      map((res) => ({ ...res, data: this.resolveMaterial(res.data) }))
    );
  }

}
