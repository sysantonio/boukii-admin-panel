import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Client, ClientSuggestion } from '../interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class SmartClientService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3/clients`;

  /**
   * Búsqueda inteligente de clientes
   */
  searchClients(query: string): Observable<ClientSuggestion[]> {
    const params = { q: query } as any;
    return this.http
      .get<any>(`${this.baseUrl}/smart-search`, { params })
      .pipe(
        map((res) => res.data?.results || []),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener clientes recientes
   */
  getRecentClients(limit: number = 10): Observable<Client[]> {
    const params = { limit: limit.toString() } as any;
    return this.http
      .get<any>(`${this.baseUrl}/recent`, { params })
      .pipe(
        map((res) => res.data?.results || []),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener clientes favoritos
   */
  getFavoriteClients(limit: number = 6): Observable<Client[]> {
    const params = { limit: limit.toString() } as any;
    return this.http
      .get<any>(`${this.baseUrl}/favorites`, { params })
      .pipe(
        map((res) => res.data?.results || []),
        catchError(this.handleError)
      );
  }

  /**
   * Crear nuevo cliente
   */
  createClient(clientData: Partial<Client>): Observable<Client> {
    return this.http
      .post<any>(`${this.baseUrl}/smart-create`, clientData)
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('SmartClientService Error:', error);
    return throwError(() => error);
  }
}
