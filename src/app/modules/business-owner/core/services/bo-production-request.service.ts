import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse, ProductionRequest } from '../interfaces/i-production-request';
import { environment } from '../../../../core/environment/envirinment';




@Injectable({
  providedIn: 'root'
})
export class BoProductionRequestService {

  private readonly baseUrl = `${environment.baseUrl}/api/BoProductionRequest`;

  constructor(private http: HttpClient) {}

  getAll(
    pageIndex: number,
    pageSize: number
  ): Observable<ApiResponse<PaginatedResponse<ProductionRequest>>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<ApiResponse<PaginatedResponse<ProductionRequest>>>(this.baseUrl, {
        params,
      })
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                `Failed to fetch production requests: ${error.message ?? error.statusText}`
              )
          )
        )
      );
  }

  getById(id: number): Observable<ApiResponse<ProductionRequest>> {
    return this.http
      .get<ApiResponse<ProductionRequest>>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                `Failed to fetch production request with ID ${id}: ${error.message ?? error.statusText}`
              )
          )
        )
      );
  }

  create(
    body: ProductionRequest
  ): Observable<ApiResponse<ProductionRequest>> {
    return this.http
      .post<ApiResponse<ProductionRequest>>(this.baseUrl, body)
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(
                `Failed to create production request: ${error.message ?? error.statusText}`
              )
          )
        )
      );
  }

  // ✅ NEW: Cancel/Delete a production request
  cancelRequest(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(`Failed to cancel production request with ID ${id}: ${error.message ?? error.statusText}`))
        )
      );
  }

  // ✅ NEW: Confirm a quoted production request
  confirmRequest(id: number): Observable<ApiResponse<ProductionRequest>> {
    return this.http
      .post<ApiResponse<ProductionRequest>>(`${this.baseUrl}/${id}/confirm`, {})
      .pipe(
        catchError((error) =>
          throwError(() => new Error(`Failed to confirm production request with ID ${id}: ${error.message ?? error.statusText}`))
        )
      );
  }

}
