import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { Client, ClientSuggestion } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SmartClientServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Búsqueda inteligente de clientes
   */
  searchClients(query: string): Observable<ClientSuggestion[]> {
    console.log('🔍 [MOCK] Searching clients:', query);
    return this.mockData.searchClients(query);
  }

  /**
   * Obtener clientes recientes
   */
  getRecentClients(limit: number = 10): Observable<Client[]> {
    console.log('📅 [MOCK] Getting recent clients, limit:', limit);
    return this.mockData.getRecentClients(limit);
  }

  /**
   * Obtener clientes favoritos
   */
  getFavoriteClients(limit: number = 6): Observable<Client[]> {
    console.log('⭐ [MOCK] Getting favorite clients, limit:', limit);
    return this.mockData.getFavoriteClients(limit);
  }

  /**
   * Crear nuevo cliente
   */
  createClient(clientData: Partial<Client>): Observable<Client> {
    console.log('👤 [MOCK] Creating new client:', clientData);
    return this.mockData.createClient(clientData);
  }
}