import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ComplaintDetails, CreateComplaintDto } from '../interfaces/i-complaint';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly apiUrl = `${environment.baseUrl}/api/Complaint`;

  constructor(private http: HttpClient) {}

  submitComplaint(dto: CreateComplaintDto): Observable<ApiResponse<ComplaintDetails>> {
    return this.http.post<ApiResponse<ComplaintDetails>>(this.apiUrl, dto);
  }

  getComplaintById(id: number): Observable<ApiResponse<ComplaintDetails>> {
    return this.http.get<ApiResponse<ComplaintDetails>>(`${this.apiUrl}/${id}`);
  }
}
