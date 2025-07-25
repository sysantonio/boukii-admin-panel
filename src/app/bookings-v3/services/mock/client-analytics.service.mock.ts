import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ClientAnalyticsServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Obtener insights completos del cliente
   */
  getClientInsights(clientId: number): Observable<any> {
    console.log('🧠 [MOCK] Getting client insights for ID:', clientId);
    return this.mockData.getClientInsights(clientId);
  }

  /**
   * Obtener métricas del cliente
   */
  getClientMetrics(clientId: number): Observable<any> {
    console.log('📊 [MOCK] Getting client metrics for ID:', clientId);
    // Retornar datos simplificados por ahora
    return this.mockData.getClientInsights(clientId);
  }

  /**
   * Obtener historial de reservas
   */
  getBookingHistory(clientId: number, limit: number = 10): Observable<any[]> {
    console.log('📜 [MOCK] Getting booking history for client:', clientId, 'limit:', limit);
    return this.mockData.getClientInsights(clientId);
  }

  /**
   * Obtener preferencias del cliente
   */
  getClientPreferences(clientId: number): Observable<any> {
    console.log('⚙️ [MOCK] Getting client preferences for ID:', clientId);
    return this.mockData.getClientInsights(clientId);
  }

  /**
   * Obtener perfil de riesgo
   */
  getClientRiskProfile(clientId: number): Observable<any> {
    console.log('⚠️ [MOCK] Getting client risk profile for ID:', clientId);
    return this.mockData.getClientInsights(clientId);
  }
}