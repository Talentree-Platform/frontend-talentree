import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, PaginatedOrders } from '../interfaces/i-material-order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterialOrderService {

  private http = inject(HttpClient);

  private readonly baseUrl = '/api';

  getOrders(pageIndex: number = 1, pageSize: number = 20):
    Observable<ApiResponse<PaginatedOrders>> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ApiResponse<PaginatedOrders>>(
      `${this.baseUrl}/MaterialOrder?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      { headers }
    );
  }

  getOrderById(id: number) {

  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any>(
    `${this.baseUrl}/MaterialOrder/${id}`,
    { headers }
  );
}
}
