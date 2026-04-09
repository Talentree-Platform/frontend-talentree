import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, ObservableLike } from 'rxjs';
import { ApiResponse } from '../interfaces/material';
import { BasketData, BasketItem } from '../interfaces/imaterial-cart';

@Injectable({
  providedIn: 'root'
})
export class MaterialCartService {

  private readonly http =inject(HttpClient);
  public apiUrl='/api';
  getMaterialCart():Observable<ApiResponse<BasketData<BasketItem>>>{
    return this.http.get<ApiResponse<BasketData<BasketItem>>>(`${this.apiUrl}/MaterialBasket`);
  }

  addMaterialToCart(p_id :number , quantity:number):Observable<ApiResponse<BasketData<BasketItem>>>{
    return this.http.post<ApiResponse<BasketData<BasketItem>>>(`${this.apiUrl}/MaterialBasket/items` , {"rawMaterialId":p_id ,"quantity":quantity})
  }

  removeMaterialFromCart(id:number):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/MaterialBasket/items/${id}`)
  }
  removeAll():Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/MaterialBasket`);
  }
  updateQuantity(itemId: number, quantity: number): Observable<any> {
  return this.http.put<any>(
    `${this.apiUrl}/MaterialBasket/items/${itemId}`, // itemId in URL
    { quantity: quantity } // only quantity in body
  );
}
}
