import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { TimeSlot, ScheduleOption, CalendarDay } from '../interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class ScheduleSelectionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/v3`;

  /** Obtener calendario de disponibilidad */
  getAvailabilityCalendar(courseId: number, month?: Date): Observable<CalendarDay[]> {
    const params: any = { courseId: courseId.toString() };
    if (month) params.month = month.toISOString().split('T')[0];
    return this.http
      .get<any>(`${this.baseUrl}/availability/calendar`, { params })
      .pipe(map((res) => res.data?.days || res.data || []), catchError(this.handleError));
  }

  /** Obtener horarios disponibles para una fecha */
  getAvailableTimeSlots(courseId: number, date: string): Observable<TimeSlot[]> {
    const params: any = { courseId: courseId.toString(), date };
    return this.http
      .get<any>(`${this.baseUrl}/availability/time-slots`, { params })
      .pipe(map((res) => res.data?.slots || res.data || []), catchError(this.handleError));
  }

  /** Obtener opciones de horario recomendadas */
  getRecommendedSchedules(criteria: {
    courseId: number;
    participantCount: number;
    preferredDates?: string[];
    timePreferences?: string[];
    budgetRange?: { min: number; max: number };
  }): Observable<ScheduleOption[]> {
    return this.http
      .post<any>(`${this.baseUrl}/availability/optimal-slots`, criteria)
      .pipe(map((res) => res.data?.optimalSlots || res.data || []), catchError(this.handleError));
  }

  /** Verificar disponibilidad específica */
  checkSpecificAvailability(courseId: number, dates: string[], timeSlotIds: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/availability/realtime-check`, {
        courseId,
        dates,
        timeSlots: timeSlotIds,
      })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener información de precios por fecha */
  getPricingByDates(courseId: number, startDate: string, endDate: string): Observable<any> {
    const params: any = { courseId: courseId.toString(), startDate, endDate };
    return this.http
      .get<any>(`${this.baseUrl}/pricing/by-dates`, { params })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Obtener horarios flexibles */
  getFlexibleSchedules(courseId: number, criteria: { preferredDates: string[]; flexibility: number; timeFlexibility: number; }): Observable<ScheduleOption[]> {
    return this.http
      .post<any>(`${this.baseUrl}/availability/flexible`, {
        courseId,
        ...criteria,
      })
      .pipe(map((res) => res.data?.options || res.data || []), catchError(this.handleError));
  }

  /** Reservar temporalmente un slot */
  holdTimeSlot(courseId: number, date: string, timeSlotId: number, holdMinutes: number = 15): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/availability/hold`, { courseId, date, timeSlotId, holdMinutes })
      .pipe(map((res) => res.data), catchError(this.handleError));
  }

  /** Liberar slot reservado */
  releaseHeldSlot(holdId: string): Observable<boolean> {
    return this.http
      .delete<any>(`${this.baseUrl}/availability/hold/${holdId}`)
      .pipe(map((res) => !!res.success), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('ScheduleSelectionService Error:', error);
    return throwError(() => error);
  }
}
