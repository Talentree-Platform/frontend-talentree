import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, MaterialOrder } from '../interfaces/i-checkout';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http:HttpClient) { }
  private readonly apiUrl = 'https://backtalentree.runasp.net/api';

  checkout(deliveryAddress :string , deliveryCity:string , deliveryCountry:string , contactPhone:string):Observable<ApiResponse<MaterialOrder>>{
      return this.http.post<ApiResponse<MaterialOrder>>(`${this.apiUrl}/MaterialOrder/checkout` , {"deliveryAddress":deliveryAddress ,"deliveryCity":deliveryCity , "deliveryCountry" : deliveryCountry , "contactPhone":contactPhone})
    }
}
