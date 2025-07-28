import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, retry, shareReplay } from 'rxjs/operators';


// Interfaces
import { BookingWizardState, ConflictAlert } from '../interfaces/booking-wizard.interfaces';
import { SmartEditBooking, EditConflict } from '../interfaces/booking-edit.interfaces';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SmartBookingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3/bookings`;

  // Cache de datos frecuentemente usados
  private coursesCache$ = new BehaviorSubject<any[]>([]);
  private monitorsCache$ = new BehaviorSubject<any[]>([]);
  private availabilityCache$ = new BehaviorSubject<Map<string, any>>(new Map());

  constructor() {
    this.initializeCache();
  }

  // ============= WIZARD OPERATIONS =============

  /**
   * Crear nueva reserva usando el wizard inteligente
   */
  async createBooking(bookingData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Validación final antes de crear
      const finalValidation = await this.validateBookingData(bookingData);
      if (!finalValidation.isValid) {
        return {
          success: false,
          message: 'Error de validación: ' + finalValidation.errors.join(', ')
        };
      }

      // Crear reserva
      const response = await this.http.post<any>(`${this.baseUrl}/smart-create`, {
        ...bookingData,
        metadata: {
          ...bookingData.metadata,
          validationPassed: true,
          createdVia: 'smart-wizard-v3'
        }
      }).toPromise();

      // Limpiar caches relevantes
      this.invalidateRelevantCaches(bookingData);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: error.message || 'Error al crear la reserva'
      };
    }
  }

  /**
   * Guardar borrador del wizard
   */
  async saveDraft(draftData: any): Promise<void> {
    try {
      await this.http.post(`${this.baseUrl}/drafts`, {
        data: draftData,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      }).toPromise();
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Cargar borrador guardado
   */
  async loadDraft(draftId: string): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.baseUrl}/drafts/${draftId}`).toPromise();
      return response.data;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Validar datos de reserva
   */
  private async validateBookingData(bookingData: any): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const response = await this.http.post<any>(`${this.baseUrl}/validate-complete`, bookingData).toPromise();
      return {
        isValid: response.success,
        errors: response.errors || []
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [error.message || 'Error de validación']
      };
    }
  }

  // ============= SMART SUGGESTIONS =============

  /**
   * Obtener sugerencias inteligentes basadas en contexto
   */
  getSmartSuggestions(context: {
    clientId?: number;
    date?: Date;
    courseType?: string;
    location?: string;
  }): Observable<any[]> {
    const params = new URLSearchParams();

    if (context.clientId) params.set('client_id', context.clientId.toString());
    if (context.date) params.set('date', context.date.toISOString());
    if (context.courseType) params.set('course_type', context.courseType);
    if (context.location) params.set('location', context.location);

    return this.http.get<any>(`${this.baseUrl}/smart-suggestions?${params}`).pipe(
      map(response => response.data),
      retry(2),
      shareReplay(1)
    );
  }

  /**
   * Obtener slots óptimos para una reserva
   */
  getOptimalSlots(criteria: {
    courseId: number;
    participantCount: number;
    preferredDates: Date[];
    clientPreferences?: any;
  }): Observable<any[]> {
    return this.http.post<any>(`${this.baseUrl}/optimal-slots`, criteria).pipe(
      map(response => response.data.slots),
      catchError(error => {
        console.error('Error getting optimal slots:', error);
        return [];
      })
    );
  }

  /**
   * Calcular precio dinámico en tiempo real
   */
  calculateDynamicPricing(pricingData: {
    courseId: number;
    dates: Date[];
    participantCount: number;
    clientId?: number;
    promoCode?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/calculate-dynamic-pricing`, pricingData).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  // ============= AVAILABILITY MANAGEMENT =============

  /**
   * Verificar disponibilidad en tiempo real
   */
  checkRealTimeAvailability(checkData: {
    courseId: number;
    dates: Date[];
    participantCount: number;
    monitorId?: number;
  }): Observable<any> {
    const cacheKey = this.generateAvailabilityCacheKey(checkData);
    const cached = this.availabilityCache$.value.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return new BehaviorSubject(cached.data).asObservable();
    }

    return this.http.post<any>(`${this.baseUrl}/check-availability`, checkData).pipe(
      map(response => {
        // Guardar en cache
        this.availabilityCache$.value.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        return response.data;
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtener matriz de disponibilidad
   */
  getAvailabilityMatrix(criteria: {
    startDate: Date;
    endDate: Date;
    courseId?: number;
    sportId?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/availability-matrix`, criteria).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  // ============= CONFLICT DETECTION =============

  /**
   * Detectar conflictos en tiempo real
   */
  detectConflicts(bookingData: any): Observable<ConflictAlert[]> {
    return this.http.post<any>(`${this.baseUrl}/detect-conflicts`, bookingData).pipe(
      map(response => response.data.conflicts || []),
      catchError(error => {
        console.error('Error detecting conflicts:', error);
        return [];
      })
    );
  }

  /**
   * Resolver conflictos automáticamente
   */
  resolveConflicts(conflictResolutions: {
    conflictId: string;
    resolutionId: string;
    parameters?: any;
  }[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/resolve-conflicts`, {
      resolutions: conflictResolutions
    }).pipe(
      map(response => response.data)
    );
  }

  // ============= BOOKING EDITING =============

  /**
   * Cargar datos de reserva para edición
   */
  loadBookingForEdit(bookingId: number): Observable<SmartEditBooking> {
    return this.http.get<any>(`${this.baseUrl}/${bookingId}/edit-data`).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Actualizar reserva con validación en tiempo real
   */
  updateBookingWithValidation(bookingId: number, changes: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${bookingId}/smart-update`, {
      changes: changes,
      validateRealTime: true,
      notifyClient: changes.notifyClient || false
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Analizar impacto de cambios
   */
  analyzeChangeImpact(bookingId: number, proposedChanges: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${bookingId}/analyze-impact`, {
      changes: proposedChanges
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener historial de cambios
   */
  getChangeHistory(bookingId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${bookingId}/change-history`).pipe(
      map(response => response.data)
    );
  }

  // ============= BOOKING DETAILS =============

  /**
   * Obtener vista detallada de reserva
   */
  getBookingDetails(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${bookingId}/detailed-view`).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    await this.http.post(`${this.baseUrl}/${bookingId}/cancel`, {
      reason: reason,
      notifyClient: true
    }).toPromise();
  }

  /**
   * Obtener métricas de reserva
   */
  getBookingMetrics(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${bookingId}/metrics`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener insights de rentabilidad
   */
  getProfitabilityInsights(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${bookingId}/profitability`).pipe(
      map(response => response.data)
    );
  }

  // ============= BATCH OPERATIONS =============

  /**
   * Operaciones masivas en reservas
   */
  performBulkOperations(operations: {
    type: 'update' | 'cancel' | 'reschedule' | 'notify';
    bookingIds: number[];
    parameters: any;
  }[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bulk-operations`, {
      operations: operations
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Duplicar reserva con optimizaciones
   */
  duplicateBookingSmart(bookingId: number, modifications?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${bookingId}/duplicate-smart`, {
      modifications: modifications || {},
      optimizeForNewDate: true,
      suggestBestSlots: true
    }).pipe(
      map(response => response.data)
    );
  }

  // ============= CACHE MANAGEMENT =============

  private initializeCache(): void {
    // Cache inicial se carga de forma lazy cuando se necesita
  }

  private generateAvailabilityCacheKey(checkData: any): string {
    return `availability_${checkData.courseId}_${checkData.dates.join(',')}_${checkData.participantCount}`;
  }

  private isCacheValid(timestamp: number, maxAge: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp < maxAge;
  }

  private invalidateRelevantCaches(bookingData: any): void {
    // Limpiar caches que podrían estar afectados por la nueva reserva
    const currentCache = this.availabilityCache$.value;
    const keysToRemove: string[] = [];

    currentCache.forEach((value, key) => {
      if (key.includes(`${bookingData.course.id}`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => currentCache.delete(key));
    this.availabilityCache$.next(currentCache);
  }

  /**
   * Limpiar todos los caches
   */
  clearAllCaches(): void {
    this.availabilityCache$.next(new Map());
    this.coursesCache$.next([]);
    this.monitorsCache$.next([]);
  }

  // ============= WEBHOOKS & REAL-TIME =============

  /**
   * Configurar webhooks para actualizaciones en tiempo real
   */
  setupRealTimeUpdates(bookingId: number, callback: (update: any) => void): void {
    // Implementar WebSocket o Server-Sent Events
    // Por ahora usando polling como fallback
    const interval = setInterval(async () => {
      try {
        const updates = await this.http.get<any>(`${this.baseUrl}/${bookingId}/updates`).toPromise();
        if (updates.data.hasUpdates) {
          callback(updates.data);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }, 30000); // Check every 30 seconds

    // Guardar referencia para cleanup
    (window as any)[`booking_${bookingId}_interval`] = interval;
  }

  /**
   * Desconectar actualizaciones en tiempo real
   */
  disconnectRealTimeUpdates(bookingId: number): void {
    const interval = (window as any)[`booking_${bookingId}_interval`];
    if (interval) {
      clearInterval(interval);
      delete (window as any)[`booking_${bookingId}_interval`];
    }
  }

  // ============= SKIPRO SPECIFIC METHODS =============

  /**
   * Obtener dashboard de Skipro con KPIs y datos principales
   */
  getSkiProDashboard(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/v3/skipro/dashboard`).pipe(
      map(response => response.data),
      shareReplay(1),
      catchError(error => {
        console.error('Error loading Skipro dashboard:', error);
        return [];
      })
    );
  }

  /**
   * Obtener lista de reservas optimizada para interfaz Skipro
   */
  getSkiProBookings(filters?: {
    tipo?: 'Todas' | 'Cursos' | 'Actividades' | 'Material';
    estado?: string;
    busqueda?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Observable<any> {
    const params = new URLSearchParams();

    if (filters?.tipo && filters.tipo !== 'Todas') {
      params.set('type', this.mapSkiProTypeToApi(filters.tipo));
    }
    if (filters?.estado) params.set('status', filters.estado);
    if (filters?.busqueda) params.set('search', filters.busqueda);
    if (filters?.fechaDesde) params.set('dateFrom', filters.fechaDesde.toISOString());
    if (filters?.fechaHasta) params.set('dateTo', filters.fechaHasta.toISOString());

    return this.http.get<any>(`${environment.baseUrl}/v3/skipro/bookings?${params}`).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Validar paso del wizard Skipro
   */
/*  validateSkiProWizardStep(step: number, data: any, previousSteps: any[] = []): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/v3/skipro/wizard/validate-step`, {
      step,
      data,
      previousSteps
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error validating wizard step:', error);
        return {
          valid: false,
          errors: ['Error de validación'],
          warnings: [],
          suggestions: []
        };
      })
    );
  }*/

  /**
   * Crear reserva usando el formato Skipro
   */
  createSkiProBooking(wizardState: any): Observable<any> {
    const bookingData = this.mapSkiProWizardToBooking(wizardState);

    return this.http.post<any>(`${this.baseUrl}/smart-create`, {
      ...bookingData,
      metadata: {
        ...bookingData.metadata,
        source: 'skipro-wizard',
        version: '3.0'
      }
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating Skipro booking:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener clientes con formato optimizado para Skipro
   */
  getSkiProClients(busqueda?: string): Observable<any[]> {
    const params = new URLSearchParams();
    if (busqueda) params.set('search', busqueda);
    params.set('include', 'activeBookings,analytics');

    return this.http.get<any>(`${environment.baseUrl}/v3/clients?${params}`).pipe(
      map(response => response.data.clients),
      shareReplay(1)
    );
  }

  /**
   * Obtener perfil completo de cliente para Skipro
   */
  getSkiProClientProfile(clientId: number): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/v3/clients/${clientId}`).pipe(
      map(response => response.data),
      shareReplay(1)
    );
  }

  /**
   * Crear nuevo cliente desde Skipro
   */
  createSkiProClient(clientData: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/v3/clients`, {
      ...clientData,
      source: 'skipro-wizard'
    }).pipe(
      map(response => response.data)
    );
  }

  // ============= HELPER METHODS =============

  private mapSkiProTypeToApi(tipo: string): string {
    const mapping: Record<string, string> = {
      'Cursos': 'course',
      'Actividades': 'activity',
      'Material': 'material'
    };
    return mapping[tipo] || 'course';
  }

  private mapSkiProWizardToBooking(wizardState: any): any {
    return {
      client: wizardState.cliente ? {
        id: wizardState.cliente.id
      } : {
        data: wizardState.nuevoClienteData
      },
      course: {
        id: wizardState.cursoSeleccionado?.id,
        type: this.mapSkiProTypeToApi(wizardState.tipoReserva?.nombre || 'Cursos')
      },
      schedule: {
        dates: wizardState.configuracion?.fechasSeleccionadas?.map((d: Date) => d.toISOString()) || [],
        participants: wizardState.configuracion?.participantes || 1,
        notes: wizardState.configuracion?.notasAdicionales
      },
      participants: [{
        firstName: wizardState.cliente?.nombre || wizardState.nuevoClienteData?.nombre,
        lastName: wizardState.cliente?.apellido || wizardState.nuevoClienteData?.apellido,
        age: this.calculateAge(wizardState.cliente?.fechaRegistro),
        level: wizardState.cliente?.nivel || 'Principiante'
      }],
      pricing: {
        basePrice: wizardState.cursoSeleccionado?.precio || 0,
        discounts: [],
        totalPrice: wizardState.resumen?.total || 0
      },
      metadata: {
        source: 'skipro-wizard',
        puntoEncuentro: wizardState.configuracion?.puntoEncuentro,
        createdVia: 'skipro-v3'
      }
    };
  }

  private calculateAge(birthDate?: Date): number {
    if (!birthDate) return 25; // Default age
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(age, 0);
  }

  // ============= ERROR HANDLING =============

  private handleError(error: any): Observable<never> {
    console.error('SmartBookingService Error:', error);
    throw error;
  }
}
