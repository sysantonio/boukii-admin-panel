import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { TimeSlot, ScheduleOption, CalendarDay } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ScheduleSelectionServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Obtener calendario de disponibilidad
   */
  getAvailabilityCalendar(courseId: number, month?: Date): Observable<CalendarDay[]> {
    console.log('📅 [MOCK] Getting availability calendar for course:', courseId, 'month:', month);
    return this.mockData.getAvailabilityCalendar(courseId, month);
  }

  /**
   * Obtener horarios disponibles para una fecha
   */
  getAvailableTimeSlots(courseId: number, date: string): Observable<TimeSlot[]> {
    console.log('⏰ [MOCK] Getting available time slots for:', courseId, date);
    return this.mockData.getAvailableTimeSlots(courseId, date);
  }

  /**
   * Obtener opciones de horario recomendadas
   */
  getRecommendedSchedules(criteria: {
    courseId: number;
    participantCount: number;
    preferredDates?: string[];
    timePreferences?: string[];
    budgetRange?: { min: number; max: number };
  }): Observable<ScheduleOption[]> {
    console.log('🎯 [MOCK] Getting recommended schedules:', criteria);
    
    const schedules: ScheduleOption[] = [
      {
        id: 1,
        dates: [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
        timeSlots: [
          {
            id: 1,
            startTime: '09:00',
            endTime: '13:00',
            duration: 240,
            price: 285,
            available: true,
            capacity: 8,
            booked: 3
          }
        ],
        totalPrice: 285,
        score: 95,
        highlights: [
          'Mejor condiciones meteorológicas',
          'Instructor más experimentado disponible',
          'Menor afluencia de público'
        ],
        weather: {
          temperature: -2,
          conditions: 'Soleado',
          windSpeed: 5,
          snowConditions: 'Polvo fresco',
          visibility: 'Excelente'
        },
        monitor: this.mockData.getMockMonitors()[0]
      },
      {
        id: 2,
        dates: [new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
        timeSlots: [
          {
            id: 2,
            startTime: '14:00',
            endTime: '18:00',
            duration: 240,
            price: 320,
            available: true,
            capacity: 6,
            booked: 2
          }
        ],
        totalPrice: 320,
        score: 88,
        highlights: [
          'Más económico por la tarde',
          'Grupo más pequeño',
          'Perfecto para fotografías'
        ],
        weather: {
          temperature: -1,
          conditions: 'Parcialmente nublado',
          windSpeed: 8,
          snowConditions: 'Buena base',
          visibility: 'Buena'
        },
        monitor: this.mockData.getMockMonitors()[1]
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(schedules);
        observer.complete();
      }, 900);
    });
  }

  /**
   * Verificar disponibilidad específica
   */
  checkSpecificAvailability(courseId: number, dates: string[], timeSlotIds: number[]): Observable<any> {
    console.log('✅ [MOCK] Checking specific availability:', courseId, dates, timeSlotIds);
    
    const result = {
      available: true,
      conflicts: [],
      alternatives: [
        {
          date: dates[0],
          timeSlotId: timeSlotIds[0] + 1,
          reason: 'Mayor disponibilidad',
          priceDifference: -15
        }
      ],
      capacity: {
        requested: 1,
        available: 5,
        total: 8
      },
      pricing: {
        basePrice: 285,
        finalPrice: 285,
        factors: {
          demand: 1.0,
          weather: 0.95,
          earlyBird: 0.9
        }
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 700);
    });
  }

  /**
   * Obtener información de precios por fecha
   */
  getPricingByDates(courseId: number, startDate: string, endDate: string): Observable<any> {
    console.log('💰 [MOCK] Getting pricing by dates:', courseId, startDate, endDate);
    
    const pricing = {
      dateRange: { start: startDate, end: endDate },
      dailyPrices: [
        {
          date: startDate,
          basePrice: 285,
          dynamicPrice: 270,
          factors: {
            demand: 0.9,
            weather: 1.05,
            promotion: 0.9
          },
          availability: 'high'
        }
      ],
      trends: {
        averagePrice: 285,
        lowestPrice: 245,
        highestPrice: 350,
        bestValueDates: [startDate],
        premiumDates: []
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(pricing);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Obtener horarios flexibles
   */
  getFlexibleSchedules(courseId: number, criteria: {
    preferredDates: string[];
    flexibility: number; // días de flexibilidad
    timeFlexibility: number; // horas de flexibilidad
  }): Observable<ScheduleOption[]> {
    console.log('🔀 [MOCK] Getting flexible schedules:', courseId, criteria);
    
    const flexibleOptions: ScheduleOption[] = [
      {
        id: 3,
        dates: [criteria.preferredDates[0]],
        timeSlots: [
          {
            id: 3,
            startTime: '10:00',
            endTime: '14:00',
            duration: 240,
            price: 260,
            available: true,
            capacity: 8,
            booked: 4
          }
        ],
        totalPrice: 260,
        score: 92,
        highlights: [
          'Ahorro de €25 por flexibilidad',
          'Horario menos concurrido',
          'Monitor premium disponible'
        ],
        flexibility: {
          dateOptions: 3,
          timeOptions: 2,
          savingsAmount: 25
        }
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(flexibleOptions);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Reservar temporalmente un slot
   */
  holdTimeSlot(courseId: number, date: string, timeSlotId: number, holdMinutes: number = 15): Observable<any> {
    console.log('🔒 [MOCK] Holding time slot:', courseId, date, timeSlotId, 'for', holdMinutes, 'minutes');
    
    const holdResult = {
      success: true,
      holdId: `HOLD_${Date.now()}`,
      expiresAt: new Date(Date.now() + holdMinutes * 60 * 1000),
      slot: {
        courseId,
        date,
        timeSlotId,
        price: 285,
        conditions: 'Precio garantizado hasta expiración'
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(holdResult);
        observer.complete();
      }, 300);
    });
  }

  /**
   * Liberar slot reservado
   */
  releaseHeldSlot(holdId: string): Observable<boolean> {
    console.log('🔓 [MOCK] Releasing held slot:', holdId);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 200);
    });
  }
}