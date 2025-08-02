import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Core Services
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiV5Response } from '../../../core/models/api-response.interface';

// Interfaces
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.interface';

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  page_size: number;
}

export interface ClientStats {
  total: number;
  nuevos: number;
  habituales: number;
  vip: number;
  activos: number;
  datos_faltantes: number;
}

export interface ClientFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'datos_faltantes';
  profile_type?: 'all' | 'nuevo' | 'habitual' | 'vip';
  season_id?: number;
}


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiV5 = inject(ApiV5Service);
  private seasonContext = inject(SeasonContextService);
  private notification = inject(NotificationService);

  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  constructor() {}

  // ==================== CLIENT CRUD OPERATIONS ====================

  /**
   * Get all clients with filters and pagination
   */
  getClients(params: any = {}): Observable<ClientListResponse> {
    let httpParams = new HttpParams();

    // Add season and school context
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('limit', params.page_size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.profile_type) httpParams = httpParams.set('profile_type', params.profile_type);

    return this.apiV5.get<any>('v5/clients', httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        // Transform V5 API response to expected format
        if (response.success) {
          const clients = response.data.clients || [];
          this.clientsSubject.next(clients);
          return {
            data: clients,
            total: response.data.pagination?.total || 0,
            page: response.data.pagination?.current_page || 1,
            page_size: response.data.pagination?.per_page || 25
          };
        }
        return {
          data: [],
          total: 0,
          page: 1,
          page_size: 25
        };
      }),
      catchError(error => {
        this.notification.error('Error al cargar los clientes');
        throw error;
      })
    );
  }

  /**
   * Get single client by ID
   */
  getClientById(id: number): Observable<Client> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();

    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }

    return this.apiV5.get<any>(`v5/clients/${id}`, httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.client;
        }
        throw new Error('Client not found');
      }),
      catchError(error => {
        this.notification.error('Error al cargar el cliente');
        throw error;
      })
    );
  }

  /**
   * Search clients by query
   */
  searchClients(query: string, limit: number = 20): Observable<Client[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams().set('q', query).set('limit', limit.toString());

    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }

    return this.apiV5.get<any>('v5/clients/search', httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.clients || [];
        }
        return [];
      }),
      catchError(error => {
        this.notification.error('Error al buscar clientes');
        throw error;
      })
    );
  }

  /**
   * Create new client
   */
  createClient(clientData: any): Observable<Client> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();

    const payload = {
      ...clientData,
      season_id: currentSeasonId
    };

    return this.apiV5.post<any>('v5/clients', payload).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.client;
        }
        throw new Error('Failed to create client');
      }),
      tap(client => {
        this.notification.success('Cliente creado exitosamente');
        this.refreshClients();
      }),
      catchError(error => {
        this.notification.error('Error al crear el cliente');
        throw error;
      })
    );
  }

  /**
   * Update existing client
   */
  updateClient(id: number, clientData: any): Observable<Client> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();

    const payload = {
      ...clientData,
      season_id: currentSeasonId
    };

    return this.apiV5.put<any>(`v5/clients/${id}`, payload).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.client;
        }
        throw new Error('Failed to update client');
      }),
      tap(client => {
        this.notification.success('Cliente actualizado exitosamente');
        this.refreshClients();
      }),
      catchError(error => {
        this.notification.error('Error al actualizar el cliente');
        throw error;
      })
    );
  }

  /**
   * Delete client
   */
  deleteClient(id: number, reason?: string): Observable<void> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();

    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    if (reason) {
      httpParams = httpParams.set('reason', reason);
    }

    return this.apiV5.delete<any>(`v5/clients/${id}`, httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        if (!response.success) {
          throw new Error('Failed to delete client');
        }
      }),
      tap(() => {
        this.notification.success('Cliente eliminado exitosamente');
        this.refreshClients();
      }),
      catchError(error => {
        this.notification.error('Error al eliminar el cliente');
        throw error;
      })
    );
  }

  // ==================== CLIENT STATISTICS ====================

  /**
   * Get client statistics
   */
  getClientStats(filters: ClientFilters = {}): Observable<ClientStats> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();

    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    if (filters.status && filters.status !== 'all') {
      httpParams = httpParams.set('status', filters.status);
    }
    if (filters.profile_type && filters.profile_type !== 'all') {
      httpParams = httpParams.set('profile_type', filters.profile_type);
    }

    return this.apiV5.get<any>('v5/clients/stats', httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.stats;
        }
        return {
          total: 0,
          nuevos: 0,
          habituales: 0,
          vip: 0,
          activos: 0,
          datos_faltantes: 0
        };
      }),
      catchError(error => {
        this.notification.error('Error al cargar las estadísticas');
        throw error;
      })
    );
  }

  // ==================== CLIENT BOOKINGS ====================

  /**
   * Get client booking history
   */
  getClientBookings(clientId: number, seasonId?: number, limit: number = 20): Observable<any[]> {
    const currentSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams().set('limit', limit.toString());

    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }

    return this.apiV5.get<any>(`v5/clients/${clientId}/bookings`, httpParams).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success) {
          return response.data.bookings || [];
        }
        return [];
      }),
      catchError(error => {
        this.notification.error('Error al cargar el historial de reservas');
        throw error;
      })
    );
  }

  // ==================== CLIENT PROFILE MANAGEMENT ====================

  /**
   * Update client profile type (nuevo, habitual, vip)
   */
  updateClientProfileType(id: number, profileType: string): any {
    return this.apiV5.patch<Client>(`clients/${id}/profile-type`, { profile_type: profileType }).pipe(
      tap(() => {
        this.notification.success('Perfil del cliente actualizado');
        this.refreshClients();
      }),
      catchError(error => {
        this.notification.error('Error al actualizar el perfil');
        throw error;
      })
    );
  }

  /**
   * Mark client as active/inactive
   */
  updateClientStatus(id: number, isActive: boolean): any {
    return this.apiV5.patch<Client>(`clients/${id}/status`, { is_active: isActive }).pipe(
      tap(() => {
        this.notification.success(`Cliente ${isActive ? 'activado' : 'desactivado'}`);
        this.refreshClients();
      }),
      catchError(error => {
        this.notification.error('Error al actualizar el estado');
        throw error;
      })
    );
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate if email exists
   */
  validateEmail(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.apiV5.get<any>('v5/clients/validate-email', params).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success && response.data) {
          return response.data.exists;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Validate if phone exists
   */
  validatePhone(phone: string): Observable<boolean> {
    const params = new HttpParams().set('phone', phone);
    return this.apiV5.get<any>('v5/clients/validate-phone', params).pipe(
      map((response: ApiV5Response<any>) => {
        if (response.success && response.data) {
          return response.data.exists;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Refresh clients list
   */
  private refreshClients(): void {
    this.getClients().subscribe();
  }

  /**
   * Export clients data
   */
  exportClients(clientIds?: number[]): any {
    const params = clientIds ? { client_ids: clientIds } : {};
    return this.apiV5.post<Blob>('v5/clients/export', params).pipe(
      catchError(error => {
        this.notification.error('Error al exportar los clientes');
        throw error;
      })
    );
  }

  /**
   * Validate client data
   */
  validateClientData(clientData: Partial<CreateClientRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!clientData.first_name) {
      errors.push('El nombre es obligatorio');
    }

    if (!clientData.last_name) {
      errors.push('El apellido es obligatorio');
    }

    if (!clientData.email) {
      errors.push('El email es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.push('El email no tiene un formato válido');
    }

    if (clientData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(clientData.phone)) {
      errors.push('El teléfono no tiene un formato válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
