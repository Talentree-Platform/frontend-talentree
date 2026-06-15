import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ObservableLike, catchError } from 'rxjs';
import { ApiResponse } from '../interfaces/material';
import { BasketData, BasketItem } from '../interfaces/imaterial-cart';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({
  providedIn: 'root'
})
export class MaterialCartService {

  private readonly http =inject(HttpClient);
  public apiUrl=`${environment.baseUrl}/api`;
    private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  loadCartCount(): void {
  this.http.get<ApiResponse<BasketData<BasketItem>>>(`${this.apiUrl}/MaterialBasket`)
    .subscribe({
      next: (res) => {
        const count = res.data.items.length;
        this.countSubject.next(count);
      },
      error: () => {
        this.countSubject.next(0);
      }
    });
}
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

// for cart 
setCount(value: number) {
    this.countSubject.next(value);
  }

  updateCount(value: number) {
    this.countSubject.next(value);
  }
}
