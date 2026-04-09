import { ApiResponse, Material, PaginatedMaterialResponse } from './../interfaces/material';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  constructor(private http:HttpClient) { }
  public apiUrl = '/api';
  
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
  );
}
  getMaterialById(Id:number):Observable<ApiResponse<Material>>{
    return this.http.get<ApiResponse<Material>>(`${this.apiUrl}/RawMaterial/${Id}`);
  }

}
