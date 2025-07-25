import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientAnalyticsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3/clients`;

  /** Obtener insights completos */
  getClientInsights(clientId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/${clientId}/insights`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener métricas del cliente */
  getClientMetrics(clientId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/${clientId}/metrics`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Historial de reservas */
  getBookingHistory(clientId: number, limit: number = 10): Observable<any[]> {
    const params = { limit: limit.toString() } as any;
    return this.http
      .get<any>(`${this.baseUrl}/${clientId}/bookings`, { params })
      .pipe(map((res) => res.data?.history || res.data || []), catchError(this.handleError));
  }

  /** Preferencias del cliente */
  getClientPreferences(clientId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/${clientId}/preferences`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Perfil de riesgo */
  getClientRiskProfile(clientId: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/${clientId}/risk-profile`)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('ClientAnalyticsService Error:', error);
    return throwError(() => error);
  }
}
