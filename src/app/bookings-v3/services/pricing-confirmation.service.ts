import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { PriceBreakdown, PaymentPlan, PromoCode } from '../interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class PricingConfirmationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3`;

  /** Calcular precio final */
  calculateFinalPricing(bookingData: any): Observable<PriceBreakdown> {
    return this.http
      .post<any>(`${this.baseUrl}/pricing/calculate-dynamic`, bookingData)
      .pipe(map((res) => res.data?.breakdown || res.data), catchError(this.handleError));
  }

  /** Validar código promocional */
  validatePromoCode(code: string, bookingData: any): Observable<PromoCode> {
    return this.http
      .post<any>(`${this.baseUrl}/pricing/validate-promo`, { code, bookingData })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener planes de pago */
  getPaymentPlans(totalAmount: number): Observable<PaymentPlan[]> {
    const params = { amount: totalAmount.toString() } as any;
    return this.http
      .get<any>(`${this.baseUrl}/pricing/payment-plans`, { params })
      .pipe(map((res) => res.data?.plans || res.data || []), catchError(this.handleError));
  }

  /** Procesar pago */
  processPayment(paymentData: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/payments/process`, paymentData)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener métodos de pago */
  getPaymentMethods(clientId?: number): Observable<any[]> {
    const params: any = {};
    if (clientId) params.clientId = clientId.toString();
    return this.http
      .get<any>(`${this.baseUrl}/payments/methods`, { params })
      .pipe(map((res) => res.data?.methods || res.data || []), catchError(this.handleError));
  }

  /** Aplicar descuentos automáticos */
  applyAutoDiscounts(bookingData: any): Observable<any[]> {
    return this.http
      .post<any>(`${this.baseUrl}/pricing/auto-discounts`, bookingData)
      .pipe(map((res) => res.data?.discounts || res.data || []), catchError(this.handleError));
  }

  /** Generar factura proforma */
  generateProformaInvoice(bookingData: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/pricing/proforma-invoice`, bookingData)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('PricingConfirmationService Error:', error);
    return throwError(() => error);
  }
}
