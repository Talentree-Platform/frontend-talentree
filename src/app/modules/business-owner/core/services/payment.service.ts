import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentIntentResponse } from '../interfaces/payment';
import { environment } from '../../../../core/environment/envirinment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /**
   * POST /api/Payment/production-requests/{requestId}/create-intent
   * Creates a Stripe PaymentIntent for the given production request.
   */
  createIntent(requestId: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.baseUrl}/api/Payment/production-requests/${requestId}/create-intent`,
      {}
    );
  }

  /**
   * POST /api/Payment/material-orders/{orderId}/create-intent
   * Creates a Stripe PaymentIntent for the given material order.
   */
  createMaterialOrderIntent(orderId: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.baseUrl}/api/Payment/material-orders/${orderId}/create-intent`,
      {}
    );
  }
}