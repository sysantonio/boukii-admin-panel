import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { ConflictAlert } from '../../interfaces/booking-wizard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SmartBookingServiceMock {
  private mockData = inject(MockDataService);

  // ============= WIZARD OPERATIONS =============
  
  /**
   * Crear nueva reserva usando el wizard inteligente
   */
  async createBooking(bookingData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    console.log('🎯 [MOCK] Creating booking with data:', bookingData);
    
    try {
      const result = await this.mockData.createBooking(bookingData).toPromise();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Error simulado en la creación de la reserva'
      };
    }
  }

  /**
   * Guardar borrador del wizard  
   */
  async saveDraft(draftData: any): Promise<void> {
    console.log('💾 [MOCK] Saving draft:', draftData);
    return this.mockData.saveDraft(draftData).toPromise();
  }

  /**
   * Cargar borrador guardado
   */
  async loadDraft(draftId: string): Promise<any> {
    console.log('📂 [MOCK] Loading draft:', draftId);
    // Simular carga de borrador
    return Promise.resolve({
      currentStep: 1,
      stepData: {},
      timestamp: new Date()
    });
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
    console.log('🤖 [MOCK] Getting smart suggestions for context:', context);
    
    // Simular sugerencias basadas en contexto
    const suggestions = [
      {
        type: 'course',
        item: this.mockData.getMockCourses()[0],
        confidence: 0.85,
        reason: 'Basado en historial del cliente'
      },
      {
        type: 'schedule',
        item: { 
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          timeSlot: '10:00-14:00' 
        },
        confidence: 0.92,
        reason: 'Condiciones meteorológicas óptimas'
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(suggestions);
        observer.complete();
      }, 600);
    });
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
    console.log('⚡ [MOCK] Getting optimal slots for criteria:', criteria);
    return this.mockData.getOptimalSlots();
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
    console.log('💰 [MOCK] Calculating dynamic pricing:', pricingData);
    return this.mockData.calculateDynamicPricing(pricingData);
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
    console.log('✅ [MOCK] Checking real-time availability:', checkData);
    
    const availability = {
      available: true,
      totalSlots: 8,
      availableSlots: 6,
      bookedSlots: 2,
      waitingList: 0,
      restrictions: [],
      lastUpdated: new Date()
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(availability);
        observer.complete();
      }, 800);
    });
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
    console.log('📅 [MOCK] Getting availability matrix:', criteria);
    
    const matrix = {
      dateRange: {
        start: criteria.startDate,
        end: criteria.endDate
      },
      days: [
        {
          date: new Date(),
          slots: [
            { time: '09:00-13:00', available: 6, total: 8, price: 285 },
            { time: '14:00-18:00', available: 3, total: 8, price: 320 }
          ]
        }
      ]
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(matrix);
        observer.complete();
      }, 900);
    });
  }

  // ============= CONFLICT DETECTION =============

  /**
   * Detectar conflictos en tiempo real
   */
  detectConflicts(bookingData: any): Observable<ConflictAlert[]> {
    console.log('⚠️ [MOCK] Detecting conflicts for:', bookingData);
    
    // Simular algunos conflictos ocasionales
    const conflicts: ConflictAlert[] = [];
    
    if (Math.random() > 0.7) {
      conflicts.push({
        type: 'schedule',
        severity: 'warning',
        message: 'El monitor tiene otra reserva muy próxima',
        affectedElements: ['monitor', 'schedule'],
        suggestedActions: [
          {
            id: 'change-time',
            title: 'Cambiar horario',
            description: 'Mover 30 minutos más tarde',
            type: 'reschedule' as any,
            priority: 'medium' as any,
            effort: 'low' as any,
            impact: 'medium' as any,
            automatic: true
          }
        ],
        autoResolvable: true
      });
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(conflicts);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Resolver conflictos automáticamente
   */
  resolveConflicts(conflictResolutions: {
    conflictId: string;
    resolutionId: string;
    parameters?: any;
  }[]): Observable<any> {
    console.log('🔧 [MOCK] Resolving conflicts:', conflictResolutions);
    
    const result = {
      resolved: conflictResolutions.length,
      successful: conflictResolutions.length,
      failed: 0,
      details: conflictResolutions.map(res => ({
        conflictId: res.conflictId,
        status: 'resolved',
        changes: ['Horario ajustado automáticamente']
      }))
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 1000);
    });
  }

  // ============= BOOKING EDITING =============

  /**
   * Cargar datos de reserva para edición
   */
  loadBookingForEdit(bookingId: number): Observable<any> {
    console.log('📝 [MOCK] Loading booking for edit:', bookingId);
    
    const bookingData = {
      id: bookingId,
      client: this.mockData.getMockClients()[0],
      course: this.mockData.getMockCourses()[0],
      monitor: this.mockData.getMockMonitors()[0],
      status: 'confirmed',
      editableFields: [
        'dates', 'participants', 'notes', 'monitor'
      ],
      restrictions: ['cannot_change_course'],
      history: []
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(bookingData);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Actualizar reserva con validación en tiempo real
   */
  updateBookingWithValidation(bookingId: number, changes: any): Observable<any> {
    console.log('🔄 [MOCK] Updating booking with validation:', bookingId, changes);
    
    const result = {
      success: true,
      updatedFields: Object.keys(changes.changes || {}),
      conflicts: [],
      notifications: {
        clientNotified: changes.notifyClient || false,
        notificationsSent: ['email']
      },
      newTotal: 320 // Simular nuevo precio
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 1200);
    });
  }

  /**
   * Analizar impacto de cambios
   */
  analyzeChangeImpact(bookingId: number, proposedChanges: any): Observable<any> {
    console.log('🔍 [MOCK] Analyzing change impact:', bookingId, proposedChanges);
    
    const impact = {
      impactLevel: 'medium' as const,
      financialImpact: {
        priceChange: 35,
        refundRequired: 0,
        additionalCharges: 35,
        netImpact: 35
      },
      operationalImpact: {
        monitorReassignment: false,
        capacityImpact: 0,
        scheduleConflicts: []
      },
      clientImpact: {
        notificationRequired: true,
        satisfactionRisk: 0.2,
        compensationSuggested: false
      },
      recommendations: [
        'Notificar al cliente del cambio de precio',
        'Confirmar disponibilidad del monitor'
      ],
      approvalRequired: false
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(impact); 
        observer.complete();
      }, 800);
    });
  }

  /**
   * Obtener historial de cambios
   */
  getChangeHistory(bookingId: number): Observable<any[]> {
    console.log('📜 [MOCK] Getting change history for booking:', bookingId);
    
    const history = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'created',
        description: 'Reserva creada',
        user: 'Sistema',
        details: {}
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'confirmed',
        description: 'Reserva confirmada por el cliente',
        user: 'Cliente',
        details: { paymentReceived: true }
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(history);
        observer.complete();
      }, 400);
    });
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
    console.log('🔄 [MOCK] Performing bulk operations:', operations);
    
    const result = {
      totalOperations: operations.length,
      successful: operations.length,
      failed: 0,
      results: operations.map(op => ({
        type: op.type,
        affectedBookings: op.bookingIds.length,
        status: 'completed',
        duration: Math.random() * 2000 + 500 // 500-2500ms
      }))
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 2000);
    });
  }

  /**
   * Duplicar reserva con optimizaciones
   */
  duplicateBookingSmart(bookingId: number, modifications?: any): Observable<any> {
    console.log('📋 [MOCK] Duplicating booking smart:', bookingId, modifications);
    
    const duplicatedBooking = {
      originalId: bookingId,
      newId: Math.floor(Math.random() * 1000) + 2000,
      bookingNumber: `BOK${Date.now().toString().slice(-6)}`,
      modifications: modifications || {},
      optimizations: [
        'Precio actualizado según temporada actual',
        'Monitor asignado automáticamente',
        'Horario optimizado para mejor disponibilidad'
      ],
      status: 'confirmed'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(duplicatedBooking);
        observer.complete();
      }, 1500);
    });
  }

  // ============= METRICS AND DETAILS =============

  /**
   * Obtener vista detallada de reserva
   */
  getBookingDetails(bookingId: number): Observable<any> {
    console.log('🔍 [MOCK] Getting booking details:', bookingId);
    
    const details = {
      id: bookingId,
      bookingNumber: `BOK${bookingId}`,
      client: this.mockData.getMockClients()[0],
      course: this.mockData.getMockCourses()[0],
      monitor: this.mockData.getMockMonitors()[0],
      status: 'confirmed',
      pricing: {
        total: 285,
        paid: 285,
        pending: 0
      },
      timeline: [
        { type: 'created', date: new Date(), description: 'Reserva creada' },
        { type: 'confirmed', date: new Date(), description: 'Pago procesado' }
      ],
      metrics: {
        satisfactionScore: 4.8,
        profitMargin: 45,
        utilizationRate: 0.75
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(details);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Obtener métricas de reserva
   */
  getBookingMetrics(bookingId: number): Observable<any> {
    console.log('📊 [MOCK] Getting booking metrics:', bookingId);
    
    const metrics = {
      performance: {
        createdToConfirmedTime: 45, // minutos
        modificationsCount: 1,
        communicationsCount: 3,
        clientEngagementScore: 0.85,
        onTimeArrival: true
      },
      financial: {
        revenue: 285,
        costs: 156,
        profit: 129,
        marginPercentage: 45.3
      },
      satisfaction: {
        score: 4.8,
        nps: 9
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(metrics);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Cancel booking (mock implementation)
   */
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    console.log('❌ [MOCK] Cancel booking', bookingId, reason);
    return Promise.resolve();
  }

  /**
   * Limpiar todos los caches
   */
  clearAllCaches(): void {
    console.log('🧹 [MOCK] Clearing all caches');
    // Simular limpieza de cache
  }
}