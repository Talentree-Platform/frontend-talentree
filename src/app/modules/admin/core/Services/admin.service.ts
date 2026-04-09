import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationQuery } from '../Interfaces/PaginationQuery';
import { ApiResponse, BusinessOwner, PaginatedResponse } from '../Interfaces/ibusiness-owner';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private _HttpClient:HttpClient) { }
  apiUrl='/api/Admin';
  getPendingBusinessOwner(params?:PaginationQuery)
  :Observable<ApiResponse<PaginatedResponse<BusinessOwner>>>{
      let httpPram=new HttpParams();
      if (params){
        httpPram.set('pageIndex',params.pageIndex);
        httpPram.set('pageSize',params.pageSize);
      }
    return this._HttpClient.get<ApiResponse<PaginatedResponse<BusinessOwner>>>(`${this.apiUrl}/business-owners/pending` , {params:httpPram})
  }

  ApproveOwner(profileId:number|undefined,notes:string ):Observable<ApiResponse<null>>{
    return this._HttpClient.post<ApiResponse<null>>(`${this.apiUrl}/business-owners/approve`,{profileId, notes});
  }

  rejectOwner(profileId:number|undefined , rejectionReason:string){
    return this._HttpClient.post<ApiResponse<null>>(`${this.apiUrl}/business-owners/reject`,{profileId,rejectionReason})
  }
}
