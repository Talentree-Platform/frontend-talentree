// ─────────────────────────────────────────────────────────────────────────────
// Talentree · PaymentService
// Shared across business-owner flows (production requests, material orders)
// and the customer-facing flow (co-payment-modal).
//
// Responsibilities:
//   1. Lazy-load Stripe.js exactly once (cached promise, no duplicate <script> tags)
//   2. Hold a single Stripe instance keyed off environment.stripePublishableKey
//   3. Create payment intents for each order type and UNWRAP the API envelope
//      here, so every consumer gets the clean payload (not { success, data, ... })
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../core/environment/envirinment'; // adjust path if your env file lives elsewhere

// ── Generic API envelope (matches the Swagger shape you posted) ───────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  timestamp: string;
}

// ── Payment-intent payload shapes per endpoint ─────────────────────────────
// Customer order: POST /api/customer/orders/{id}/payment-intent
export interface CustomerOrderPaymentIntent {
  paymentMethod: string;
  stripeClientSecret: string;
  orderId: number;
}

// Production request: POST /api/Payment/production-requests/{requestId}/create-intent
// Material order:      createMaterialOrderIntent(...)
// Both already exist per your project history — kept here so this file is
// the single source of truth going forward. Adjust field names if your real
// backend responses differ; these mirror the customer-order shape.
export interface ProductionRequestPaymentIntent {
  paymentMethod: string;
  stripeClientSecret: string;
  requestId: number;
}

export interface MaterialOrderPaymentIntent {
  paymentMethod: string;
  stripeClientSecret: string;
  orderId: number;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.baseUrl; // e.g. https://localhost:xxxx/api

  private stripeInstance: any = null;
  private stripeLoadPromise: Promise<void> | null = null;

  // ───────────────────────────────────────────────────────────────────────
  // Stripe.js lazy loader — safe to call from every payment modal;
  // subsequent calls reuse the same in-flight/resolved promise.
  // ───────────────────────────────────────────────────────────────────────
  loadStripeJs(): Promise<void> {
    if (this.stripeInstance) {
      return Promise.resolve();
    }
    if (this.stripeLoadPromise) {
      return this.stripeLoadPromise;
    }

    this.stripeLoadPromise = new Promise<void>((resolve, reject) => {
      if (window.Stripe) {
        this.stripeInstance = window.Stripe(environment.stripePublishableKey);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        if (!window.Stripe) {
          reject(new Error('Stripe.js loaded but window.Stripe is unavailable.'));
          return;
        }
        this.stripeInstance = window.Stripe(environment.stripePublishableKey);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Stripe.js script.'));
      document.head.appendChild(script);
    });

    return this.stripeLoadPromise;
  }

  getStripeInstance(): any {
    return this.stripeInstance;
  }


 createCustomerOrderPaymentIntent(orderId: string): Observable<CustomerOrderPaymentIntent> {
    const numericId = Number(orderId);
    return this.http
      .post<ApiResponse<CustomerOrderPaymentIntent>>(
        `${this.baseUrl}/api/customer/orders/${numericId}/payment-intent`,
        {}
      )
      .pipe(map((res) => res.data));
  }

  createProductionRequestIntent(requestId: string | number): Observable<ProductionRequestPaymentIntent> {
    return this.http
      .post<ApiResponse<ProductionRequestPaymentIntent>>(
        `${this.baseUrl}/api/Payment/production-requests/${requestId}/create-intent`,
        {}
      )
      .pipe(map((res) => res.data));
  }

  createMaterialOrderIntent(orderId: string | number): Observable<MaterialOrderPaymentIntent> {
    return this.http
      .post<ApiResponse<MaterialOrderPaymentIntent>>(
        `${this.baseUrl}/api/Payment/material-orders/${orderId}/create-intent`,
        {}
      )
      .pipe(map((res) => res.data));
  }
}