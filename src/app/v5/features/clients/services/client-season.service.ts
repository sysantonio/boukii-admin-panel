import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, catchError, finalize, shareReplay } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CacheService } from '../../../core/services/cache.service';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchCriteria,
  ClientStats,
  ClientSegment,
  ClientCommunication
} from '../models/client.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';
import { Season } from '../../../core/models/season.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientSeasonService {
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  private selectedClientSubject = new BehaviorSubject<Client | null>(null);
  public selectedClient$ = this.selectedClientSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private statsSubject = new BehaviorSubject<ClientStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  // Season-aware client cache
  private clientCache = new Map<string, Client[]>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlerService,
    private cache: CacheService
  ) {
    this.initializeService();
  }

  // ==================== INITIALIZATION ====================

  private initializeService(): void {
    // React to season changes and invalidate client cache
    this.seasonContext.currentSeason$.subscribe(season => {
      if (season) {
        this.invalidateClientCache();
        this.logger.info('Client service initialized for season', { seasonId: season.id });
      }
    });
  }

  // ==================== SEASON-AWARE CLIENT OPERATIONS ====================

  async getClientsBySeason(seasonId?: number): Promise<Client[]> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();

    if (!targetSeasonId) {
      throw new Error('No season selected');
    }

    const cacheKey = `clients_season_${targetSeasonId}`;

    // Check cache first
    const cachedClients = this.clientCache.get(cacheKey);
    if (cachedClients) {
      this.logger.debug('Returning cached clients for season', { seasonId: targetSeasonId });
      this.clientsSubject.next(cachedClients);
      return cachedClients;
    }

    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5
        .get<ApiResponse<Client[]>>(`seasons/${targetSeasonId}/clients`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid clients response');
      }

      const clients = this.processClientData(response.data);

      // Cache the results
      this.clientCache.set(cacheKey, clients);
      this.clientsSubject.next(clients);

      this.logger.info('Clients loaded for season', {
        seasonId: targetSeasonId,
        clientCount: clients.length
      });

      return clients;

    } catch (error) {
      this.logger.error('Failed to load clients for season', { seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getClientById(id: number): Promise<Client> {
    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5
        .get<ApiResponse<Client>>(`clients/${id}`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Client not found');
      }

      const client = this.processClientData([response.data])[0];
      this.selectedClientSubject.next(client);

      this.logger.info('Client loaded successfully', { clientId: id });
      return client;

    } catch (error) {
      this.logger.error('Failed to load client', { id, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (!currentSeasonId) {
      throw new Error('No season selected');
    }

    this.loadingSubject.next(true);

    try {
      const requestData = {
        ...clientData,
        season_id: currentSeasonId
      };

      const response = await this.apiV5
        .post<ApiResponse<Client>>('clients', requestData)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid client creation response');
      }

      const newClient = this.processClientData([response.data])[0];

      // Update local state
      const currentClients = this.clientsSubject.value;
      this.clientsSubject.next([newClient, ...currentClients]);

      // Invalidate cache
      this.invalidateClientCache();

      this.logger.info('Client created successfully', {
        clientId: newClient.id,
        seasonId: currentSeasonId
      });

      return newClient;

    } catch (error) {
      this.logger.error('Failed to create client', { clientData, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateClient(clientData: UpdateClientRequest): Promise<Client> {
    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5
        .put<ApiResponse<Client>>(`clients/${clientData.id}`, clientData)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid client update response');
      }

      const updatedClient = this.processClientData([response.data])[0];

      // Update local state
      const currentClients = this.clientsSubject.value;
      const updatedClients = currentClients.map(client =>
        client.id === updatedClient.id ? updatedClient : client
      );
      this.clientsSubject.next(updatedClients);

      // Update selected client if it matches
      const selectedClient = this.selectedClientSubject.value;
      if (selectedClient?.id === updatedClient.id) {
        this.selectedClientSubject.next(updatedClient);
      }

      // Invalidate cache
      this.invalidateClientCache();

      this.logger.info('Client updated successfully', { clientId: updatedClient.id });
      return updatedClient;

    } catch (error) {
      this.logger.error('Failed to update client', { clientData, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteClient(id: number): Promise<void> {
    this.loadingSubject.next(true);

    try {
      await this.apiV5.delete(`clients/${id}`).toPromise();

      // Update local state
      const currentClients = this.clientsSubject.value;
      const updatedClients = currentClients.filter(client => client.id !== id);
      this.clientsSubject.next(updatedClients);

      // Clear selection if deleted client was selected
      const selectedClient = this.selectedClientSubject.value;
      if (selectedClient?.id === id) {
        this.selectedClientSubject.next(null);
      }

      // Invalidate cache
      this.invalidateClientCache();

      this.logger.info('Client deleted successfully', { clientId: id });

    } catch (error) {
      this.logger.error('Failed to delete client', { id, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== CLIENT SEARCH AND FILTERING ====================

  async searchClients(criteria: ClientSearchCriteria): Promise<{
    clients: Client[];
    totalCount: number;
    page: number;
  }> {
    const seasonId = criteria.season_id || this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    this.loadingSubject.next(true);

    try {
      const params = this.buildSearchParams({ ...criteria, season_id: seasonId });

      const response = await this.apiV5
        .get<ApiResponse<{
          clients: Client[];
          total_count: number;
          current_page: number;
        }>>('clients/search', { params })
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid search response');
      }

      const clients = this.processClientData(response.data.clients);

      this.logger.info('Client search completed', {
        criteria,
        resultCount: clients.length,
        totalCount: response.data.total_count
      });

      return {
        clients,
        totalCount: response.data.total_count,
        page: response.data.current_page
      };

    } catch (error) {
      this.logger.error('Failed to search clients', { criteria, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== CLIENT STATISTICS ====================

  async getClientStats(seasonId?: number): Promise<ClientStats> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
    if (!targetSeasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5
        .get<ApiResponse<ClientStats>>(`seasons/${targetSeasonId}/clients/statistics`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid statistics response');
      }

      const stats = response.data;
      this.statsSubject.next(stats);

      this.logger.info('Client statistics loaded', { seasonId: targetSeasonId });
      return stats;

    } catch (error) {
      this.logger.error('Failed to load client statistics', { seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== CLIENT BOOKING HISTORY ====================

  async getClientBookingHistory(clientId: number, seasonId?: number): Promise<any[]> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();

    try {
      const params: any = {};
      if (targetSeasonId) {
        params.season_id = targetSeasonId.toString();
      }

      const response = await this.apiV5
        .get<ApiResponse<any[]>>(`clients/${clientId}/bookings`, { params })
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid booking history response');
      }

      this.logger.info('Client booking history loaded', {
        clientId,
        seasonId: targetSeasonId,
        bookingCount: response.data.length
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to load client booking history', { clientId, seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== CLIENT COMMUNICATION ====================

  async getClientCommunications(clientId: number): Promise<ClientCommunication[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<ClientCommunication[]>>(`clients/${clientId}/communications`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid communications response');
      }

      this.logger.info('Client communications loaded', {
        clientId,
        communicationCount: response.data.length
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to load client communications', { clientId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async sendClientCommunication(
    clientId: number,
    type: string,
    subject: string,
    content: string,
    channel: string = 'email'
  ): Promise<ClientCommunication> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<ClientCommunication>>(`clients/${clientId}/communications`, {
          type,
          subject,
          content,
          channel
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid communication response');
      }

      this.logger.info('Client communication sent', {
        clientId,
        type,
        channel,
        communicationId: response.data.id
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to send client communication', { clientId, type, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== CLIENT SEGMENTATION ====================

  async getClientSegments(): Promise<ClientSegment[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<ClientSegment[]>>('clients/segments')
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid segments response');
      }

      this.logger.info('Client segments loaded', { segmentCount: response.data.length });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load client segments', { error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getClientsInSegment(segmentId: number): Promise<Client[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<Client[]>>(`clients/segments/${segmentId}/clients`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid segment clients response');
      }

      const clients = this.processClientData(response.data);

      this.logger.info('Segment clients loaded', {
        segmentId,
        clientCount: clients.length
      });

      return clients;

    } catch (error) {
      this.logger.error('Failed to load segment clients', { segmentId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== CLIENT VALIDATION ====================

  canEditClient(client: Client): boolean {
    const currentSeason = this.seasonContext.getCurrentSeason();

    if (!currentSeason) {
      return false;
    }

    // Can edit if client belongs to current season and season is not closed
    return client.season_id === currentSeason.id && !currentSeason.is_closed;
  }

  canDeleteClient(client: Client): boolean {
    // Additional business rules for deletion
    if (!this.canEditClient(client)) {
      return false;
    }

    // Cannot delete if client has active bookings
    if (client.booking_stats?.total_bookings > 0) {
      return false;
    }

    return true;
  }

  validateClientData(clientData: CreateClientRequest | UpdateClientRequest): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!clientData.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!clientData.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!clientData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.push('Invalid email format');
    }

    if (!clientData.phone?.trim()) {
      errors.push('Phone number is required');
    }

    if (!clientData.document_number?.trim()) {
      errors.push('Document number is required');
    }

    // Business rule validations
    if (clientData.document_type === 'dni' && clientData.document_number) {
      if (!/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i.test(clientData.document_number)) {
        errors.push('Invalid DNI format');
      }
    }

    if (clientData.document_type === 'nie' && clientData.document_number) {
      if (!/^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i.test(clientData.document_number)) {
        errors.push('Invalid NIE format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ==================== UTILITY METHODS ====================

  getCurrentClients(): Client[] {
    return this.clientsSubject.value;
  }

  getClientById_Sync(id: number): Client | undefined {
    return this.clientsSubject.value.find(client => client.id === id);
  }

  clearSelectedClient(): void {
    this.selectedClientSubject.next(null);
  }

  selectClient(client: Client): void {
    this.selectedClientSubject.next(client);
  }

  // ==================== PRIVATE METHODS ====================

  private processClientData(clients: Client[]): Client[] {
    return clients.map(client => ({
      ...client,
      full_name: `${client.first_name} ${client.last_name}`,
      age: client.birth_date ? this.calculateAge(new Date(client.birth_date)) : undefined,
      created_at: new Date(client.created_at),
      updated_at: new Date(client.updated_at),
      last_login: client.last_login ? new Date(client.last_login) : undefined
    }));
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private buildSearchParams(criteria: ClientSearchCriteria): any {
    const params: any = {};

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          params[key] = value.join(',');
        } else {
          params[key] = value.toString();
        }
      }
    });

    return params;
  }

  private invalidateClientCache(): void {
    this.clientCache.clear();
    this.logger.debug('Client cache invalidated');
  }
}
