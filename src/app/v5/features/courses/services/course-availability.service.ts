import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { 
  CourseSeasonAvailability, 
  AvailableDate, 
  TimeSlot, 
  CapacitySettings 
} from '../../../core/models/course.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

export interface AvailabilityQuery {
  courseId: number;
  dateFrom: Date;
  dateTo: Date;
  participantCount: number;
  timeSlotId?: number;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  availableSlots: AvailableTimeSlot[];
  maxCapacity: number;
  currentBookings: number;
  waitlistCount: number;
  restrictions: AvailabilityRestriction[];
  alternativeDates: AlternativeDateSuggestion[];
}

export interface AvailableTimeSlot {
  slot: TimeSlot;
  date: Date;
  availableCapacity: number;
  currentBookings: number;
  isOverbookingAllowed: boolean;
  priceModifier?: number;
  monitorAssigned?: boolean;
  monitorId?: number;
}

export interface AvailabilityRestriction {
  type: RestrictionType;
  message: string;
  severity: 'info' | 'warning' | 'error';
  affectedDates?: Date[];
}

export type RestrictionType = 
  | 'weather_dependent'
  | 'monitor_unavailable'
  | 'capacity_exceeded'
  | 'booking_deadline'
  | 'season_closed'
  | 'maintenance_period'
  | 'holiday_exclusion';

export interface AlternativeDateSuggestion {
  date: Date;
  timeSlot: TimeSlot;
  availableCapacity: number;
  similarityScore: number; // 0-1, how similar to original request
  priceModifier?: number;
}

export interface RealTimeAvailability {
  courseId: number;
  timestamp: Date;
  availabilityMatrix: DateAvailabilityMatrix;
  nextUpdate: Date;
}

export interface DateAvailabilityMatrix {
  [dateKey: string]: {
    date: Date;
    slots: SlotAvailability[];
    totalCapacity: number;
    totalBooked: number;
    isHoliday: boolean;
    weatherRestrictions?: string[];
  };
}

export interface SlotAvailability {
  timeSlot: TimeSlot;
  capacity: number;
  booked: number;
  available: number;
  waitlist: number;
  monitorAssigned: boolean;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseAvailabilityService {
  private availabilityCache = new Map<string, RealTimeAvailability>();
  private refreshInterval = 30000; // 30 seconds
  
  private availabilitySubject = new BehaviorSubject<RealTimeAvailability | null>(null);
  public availability$ = this.availabilitySubject.asObservable();

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService
  ) {
    this.setupRealTimeUpdates();
  }

  // ==================== MAIN AVAILABILITY CHECK ====================

  async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    this.logger.debug('Checking course availability', query);

    try {
      const response = await this.apiV5
        .post<ApiResponse<AvailabilityResult>>('courses/check-availability', {
          course_id: query.courseId,
          date_from: query.dateFrom.toISOString(),
          date_to: query.dateTo.toISOString(),
          participant_count: query.participantCount,
          time_slot_id: query.timeSlotId,
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid availability response');
      }

      // Update real-time cache
      this.updateAvailabilityCache(query.courseId, response.data);

      return response.data;
    } catch (error) {
      this.logger.error('Failed to check availability', { query, error });
      throw error;
    }
  }

  // ==================== REAL-TIME AVAILABILITY ====================

  getRealTimeAvailability(courseId: number): Observable<RealTimeAvailability | null> {
    const cacheKey = this.getCacheKey(courseId);
    
    // Start monitoring this course if not already cached
    if (!this.availabilityCache.has(cacheKey)) {
      this.startMonitoring(courseId);
    }

    return this.availability$.pipe(
      map(availability => {
        if (availability && availability.courseId === courseId) {
          return availability;
        }
        return this.availabilityCache.get(cacheKey) || null;
      }),
      distinctUntilChanged((prev, curr) => 
        prev?.timestamp.getTime() === curr?.timestamp.getTime()
      )
    );
  }

  async refreshAvailability(courseId: number): Promise<RealTimeAvailability> {
    this.logger.debug('Refreshing availability for course', { courseId });

    try {
      const response = await this.apiV5
        .get<ApiResponse<RealTimeAvailability>>(`courses/${courseId}/availability/real-time`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to get real-time availability');
      }

      const availability = response.data;
      const cacheKey = this.getCacheKey(courseId);
      
      this.availabilityCache.set(cacheKey, availability);
      this.availabilitySubject.next(availability);

      return availability;
    } catch (error) {
      this.logger.error('Failed to refresh availability', { courseId, error });
      throw error;
    }
  }

  // ==================== AVAILABILITY MATRIX ====================

  async getAvailabilityMatrix(
    courseId: number, 
    dateFrom: Date, 
    dateTo: Date
  ): Promise<DateAvailabilityMatrix> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<DateAvailabilityMatrix>>(`courses/${courseId}/availability/matrix`, {
          params: {
            date_from: dateFrom.toISOString(),
            date_to: dateTo.toISOString(),
            season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
          }
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to get availability matrix');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get availability matrix', { courseId, dateFrom, dateTo, error });
      throw error;
    }
  }

  // ==================== SLOT-SPECIFIC OPERATIONS ====================

  async getAvailableSlots(
    courseId: number, 
    date: Date, 
    participantCount?: number
  ): Promise<AvailableTimeSlot[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<AvailableTimeSlot[]>>(`courses/${courseId}/availability/slots`, {
          params: {
            date: date.toISOString(),
            participant_count: participantCount?.toString() || '',
            season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
          }
        })
        .toPromise();

      return response?.data || [];
    } catch (error) {
      this.logger.error('Failed to get available slots', { courseId, date, participantCount, error });
      return [];
    }
  }

  async reserveSlot(
    courseId: number, 
    date: Date, 
    timeSlotId: number, 
    participantCount: number,
    temporaryReservation: boolean = true
  ): Promise<{ reservationId: string; expiresAt: Date }> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<{ reservation_id: string; expires_at: string }>>('courses/reserve-slot', {
          course_id: courseId,
          date: date.toISOString(),
          time_slot_id: timeSlotId,
          participant_count: participantCount,
          temporary: temporaryReservation,
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to reserve slot');
      }

      // Refresh availability after reservation
      this.refreshAvailability(courseId);

      return {
        reservationId: response.data.reservation_id,
        expiresAt: new Date(response.data.expires_at)
      };
    } catch (error) {
      this.logger.error('Failed to reserve slot', { courseId, date, timeSlotId, participantCount, error });
      throw error;
    }
  }

  async releaseSlot(reservationId: string): Promise<void> {
    try {
      await this.apiV5
        .delete(`courses/reservations/${reservationId}`)
        .toPromise();

      this.logger.debug('Slot reservation released', { reservationId });
    } catch (error) {
      this.logger.error('Failed to release slot reservation', { reservationId, error });
      throw error;
    }
  }

  // ==================== CAPACITY MANAGEMENT ====================

  async updateCapacitySettings(
    courseId: number, 
    settings: Partial<CapacitySettings>
  ): Promise<CapacitySettings> {
    try {
      const response = await this.apiV5
        .put<ApiResponse<CapacitySettings>>(`courses/${courseId}/capacity-settings`, settings)
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to update capacity settings');
      }

      // Refresh availability after capacity change
      this.refreshAvailability(courseId);

      return response.data;
    } catch (error) {
      this.logger.error('Failed to update capacity settings', { courseId, settings, error });
      throw error;
    }
  }

  async getCapacityUtilization(
    courseId: number, 
    dateFrom: Date, 
    dateTo: Date
  ): Promise<{
    totalCapacity: number;
    totalBooked: number;
    utilizationRate: number;
    peakDays: Date[];
    lowDemandDays: Date[];
  }> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<any>>(`courses/${courseId}/capacity/utilization`, {
          params: {
            date_from: dateFrom.toISOString(),
            date_to: dateTo.toISOString(),
            season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
          }
        })
        .toPromise();

      return response?.data || {
        totalCapacity: 0,
        totalBooked: 0,
        utilizationRate: 0,
        peakDays: [],
        lowDemandDays: []
      };
    } catch (error) {
      this.logger.error('Failed to get capacity utilization', { courseId, dateFrom, dateTo, error });
      throw error;
    }
  }

  // ==================== ALTERNATIVE SUGGESTIONS ====================

  async getAlternativeSuggestions(
    query: AvailabilityQuery
  ): Promise<AlternativeDateSuggestion[]> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<AlternativeDateSuggestion[]>>('courses/alternative-suggestions', {
          course_id: query.courseId,
          original_date_from: query.dateFrom.toISOString(),
          original_date_to: query.dateTo.toISOString(),
          participant_count: query.participantCount,
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || [];
    } catch (error) {
      this.logger.error('Failed to get alternative suggestions', { query, error });
      return [];
    }
  }

  // ==================== WAITLIST MANAGEMENT ====================

  async joinWaitlist(
    courseId: number, 
    date: Date, 
    timeSlotId: number, 
    participantCount: number,
    clientId: number
  ): Promise<{ position: number; estimatedWaitTime: number }> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<{ position: number; estimated_wait_minutes: number }>>('courses/waitlist/join', {
          course_id: courseId,
          date: date.toISOString(),
          time_slot_id: timeSlotId,
          participant_count: participantCount,
          client_id: clientId,
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to join waitlist');
      }

      return {
        position: response.data.position,
        estimatedWaitTime: response.data.estimated_wait_minutes
      };
    } catch (error) {
      this.logger.error('Failed to join waitlist', { courseId, date, timeSlotId, participantCount, clientId, error });
      throw error;
    }
  }

  async getWaitlistStatus(
    courseId: number, 
    date: Date, 
    timeSlotId: number
  ): Promise<{
    totalWaiting: number;
    averageWaitTime: number;
    nextAvailableSlot?: Date;
  }> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<any>>(`courses/${courseId}/waitlist/status`, {
          params: {
            date: date.toISOString(),
            time_slot_id: timeSlotId.toString(),
            season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
          }
        })
        .toPromise();

      return response?.data || {
        totalWaiting: 0,
        averageWaitTime: 0
      };
    } catch (error) {
      this.logger.error('Failed to get waitlist status', { courseId, date, timeSlotId, error });
      throw error;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private setupRealTimeUpdates(): void {
    // Set up periodic refresh for monitored courses
    setInterval(() => {
      this.refreshMonitoredCourses();
    }, this.refreshInterval);
  }

  private async refreshMonitoredCourses(): Promise<void> {
    const courseIds = Array.from(this.availabilityCache.keys())
      .map(key => parseInt(key.split('_')[1], 10));

    for (const courseId of courseIds) {
      try {
        await this.refreshAvailability(courseId);
      } catch (error) {
        this.logger.warn('Failed to refresh monitored course availability', { courseId, error });
      }
    }
  }

  private startMonitoring(courseId: number): void {
    const cacheKey = this.getCacheKey(courseId);
    
    if (!this.availabilityCache.has(cacheKey)) {
      this.logger.debug('Starting availability monitoring', { courseId });
      this.refreshAvailability(courseId);
    }
  }

  private updateAvailabilityCache(courseId: number, result: AvailabilityResult): void {
    const cacheKey = this.getCacheKey(courseId);
    
    // Convert AvailabilityResult to RealTimeAvailability format
    const availability: RealTimeAvailability = {
      courseId,
      timestamp: new Date(),
      availabilityMatrix: this.convertToMatrix(result),
      nextUpdate: new Date(Date.now() + this.refreshInterval)
    };

    this.availabilityCache.set(cacheKey, availability);
    this.availabilitySubject.next(availability);
  }

  private convertToMatrix(result: AvailabilityResult): DateAvailabilityMatrix {
    const matrix: DateAvailabilityMatrix = {};

    // Group available slots by date
    for (const slot of result.availableSlots) {
      const dateKey = slot.date.toISOString().split('T')[0];
      
      if (!matrix[dateKey]) {
        matrix[dateKey] = {
          date: slot.date,
          slots: [],
          totalCapacity: 0,
          totalBooked: 0,
          isHoliday: false
        };
      }

      matrix[dateKey].slots.push({
        timeSlot: slot.slot,
        capacity: slot.availableCapacity + slot.currentBookings,
        booked: slot.currentBookings,
        available: slot.availableCapacity,
        waitlist: 0, // Would need to be provided by the API
        monitorAssigned: slot.monitorAssigned || false,
        lastUpdated: new Date()
      });

      matrix[dateKey].totalCapacity += slot.availableCapacity + slot.currentBookings;
      matrix[dateKey].totalBooked += slot.currentBookings;
    }

    return matrix;
  }

  private getCacheKey(courseId: number): string {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    return `course_${courseId}_season_${seasonId}`;
  }

  // ==================== UTILITY METHODS ====================

  stopMonitoring(courseId: number): void {
    const cacheKey = this.getCacheKey(courseId);
    this.availabilityCache.delete(cacheKey);
    this.logger.debug('Stopped availability monitoring', { courseId });
  }

  clearCache(): void {
    this.availabilityCache.clear();
    this.availabilitySubject.next(null);
    this.logger.info('Availability cache cleared');
  }

  getMonitoredCourses(): number[] {
    return Array.from(this.availabilityCache.keys())
      .map(key => parseInt(key.split('_')[1], 10));
  }
}