import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, switchMap, catchError, shareReplay, debounceTime } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
  Monitor,
  MonitorAvailability,
  AvailableTimeSlot,
  MonitorScheduleRequest,
  MonitorScheduleConflict,
  MonitorAlternative,
  TimeSlotStatus,
  DateOverride,
  WeeklySchedule
} from '../models/monitor.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

export interface AvailabilityQuery {
  date: Date;
  start_time?: string;
  end_time?: string;
  course_group_id?: number;
  location_id?: number;
  min_rating?: number;
  required_certifications?: string[];
  max_travel_distance_km?: number;
}

export interface AvailabilityResult {
  available_monitors: Monitor[];
  total_available: number;
  peak_hours: PeakHoursInfo;
  alternatives: MonitorAlternative[];
  scheduling_conflicts: MonitorScheduleConflict[];
}

export interface PeakHoursInfo {
  most_available_hours: TimeSlotInfo[];
  least_available_hours: TimeSlotInfo[];
  optimal_scheduling_window: {
    start_time: string;
    end_time: string;
    available_monitor_count: number;
  };
}

export interface TimeSlotInfo {
  time_slot: string;
  available_monitors: number;
  average_hourly_rate: number;
  specialization_coverage: SpecializationCoverage[];
}

export interface SpecializationCoverage {
  course_group_id: number;
  course_group_name: string;
  available_monitors: number;
  average_rating: number;
}

export interface RealTimeMonitorStatus {
  monitor_id: number;
  current_status: TimeSlotStatus;
  current_booking_id?: number;
  next_available_slot?: Date;
  location_id?: number;
  estimated_free_time?: Date;
  is_traveling: boolean;
  travel_eta?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MonitorAvailabilityService {
  private realTimeStatusSubject = new BehaviorSubject<Map<number, RealTimeMonitorStatus>>(new Map());
  public realTimeStatus$ = this.realTimeStatusSubject.asObservable();

  private availabilityUpdateInterval = 30000; // 30 seconds
  private monitoredMonitors = new Set<number>();

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeRealTimeTracking();
  }

  // ==================== REAL-TIME AVAILABILITY TRACKING ====================

  private initializeRealTimeTracking(): void {
    // Update real-time status every 30 seconds
    interval(this.availabilityUpdateInterval).subscribe(() => {
      this.updateRealTimeStatus();
    });

    this.logger.info('Monitor availability real-time tracking initialized');
  }

  startMonitoringMonitor(monitorId: number): void {
    this.monitoredMonitors.add(monitorId);
    this.updateMonitorStatus(monitorId);
    this.logger.debug('Started monitoring monitor availability', { monitorId });
  }

  stopMonitoringMonitor(monitorId: number): void {
    this.monitoredMonitors.delete(monitorId);
    const currentStatus = this.realTimeStatusSubject.value;
    currentStatus.delete(monitorId);
    this.realTimeStatusSubject.next(new Map(currentStatus));
    this.logger.debug('Stopped monitoring monitor availability', { monitorId });
  }

  private async updateRealTimeStatus(): Promise<void> {
    if (this.monitoredMonitors.size === 0) return;

    try {
      const monitorIds = Array.from(this.monitoredMonitors);
      const response = await this.apiV5.post<ApiResponse<RealTimeMonitorStatus[]>>(
        'monitors/real-time-status',
        { monitor_ids: monitorIds }
      ).toPromise();

      if (response?.data) {
        const statusMap = new Map<number, RealTimeMonitorStatus>();
        response.data.forEach(status => {
          statusMap.set(status.monitor_id, status);
        });
        this.realTimeStatusSubject.next(statusMap);
      }

    } catch (error) {
      this.logger.warn('Failed to update real-time monitor status', { error });
    }
  }

  private async updateMonitorStatus(monitorId: number): Promise<void> {
    try {
      const response = await this.apiV5.get<ApiResponse<RealTimeMonitorStatus>>(
        `monitors/${monitorId}/real-time-status`
      ).toPromise();

      if (response?.data) {
        const currentStatus = this.realTimeStatusSubject.value;
        currentStatus.set(monitorId, response.data);
        this.realTimeStatusSubject.next(new Map(currentStatus));
      }

    } catch (error) {
      this.logger.warn('Failed to update individual monitor status', { monitorId, error });
    }
  }

  // ==================== AVAILABILITY QUERIES ====================

  async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    this.logger.info('Checking monitor availability', query);

    try {
      const response = await this.apiV5.post<ApiResponse<AvailabilityResult>>(
        'monitors/check-availability',
        {
          ...query,
          date: query.date.toISOString(),
          season_id: seasonId
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid availability response');
      }

      this.logger.info('Monitor availability check completed', {
        query,
        availableMonitors: response.data.total_available
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to check monitor availability', { query, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getMonitorAvailability(monitorId: number, dateFrom: Date, dateTo: Date): Promise<MonitorAvailability> {
    try {
      const params = new HttpParams()
        .set('date_from', dateFrom.toISOString())
        .set('date_to', dateTo.toISOString())
        .set('season_id', this.seasonContext.getCurrentSeasonId()?.toString() || '');

      const response = await this.apiV5.get<ApiResponse<MonitorAvailability>>(
        `monitors/${monitorId}/availability`,
        params
      ).toPromise();

      if (!response?.data) {
        throw new Error('Monitor availability not found');
      }

      return response.data;

    } catch (error) {
      this.logger.error('Failed to get monitor availability', { monitorId, dateFrom, dateTo, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async updateMonitorAvailability(monitorId: number, availability: Partial<MonitorAvailability>): Promise<MonitorAvailability> {
    try {
      const response = await this.apiV5.put<ApiResponse<MonitorAvailability>>(
        `monitors/${monitorId}/availability`,
        {
          ...availability,
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to update monitor availability');
      }

      this.logger.info('Monitor availability updated', { monitorId });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to update monitor availability', { monitorId, availability, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== TIME SLOT MANAGEMENT ====================

  async getAvailableTimeSlots(
    monitorId: number,
    date: Date,
    includeBooked: boolean = false
  ): Promise<AvailableTimeSlot[]> {
    try {
      const params = new HttpParams()
        .set('date', date.toISOString())
        .set('include_booked', includeBooked.toString())
        .set('season_id', this.seasonContext.getCurrentSeasonId()?.toString() || '');

      const response = await this.apiV5.get<ApiResponse<AvailableTimeSlot[]>>(
        `monitors/${monitorId}/time-slots`,
        params
      ).toPromise();

      return response?.data || [];

    } catch (error) {
      this.logger.error('Failed to get monitor time slots', { monitorId, date, error });
      return [];
    }
  }

  async blockTimeSlot(
    monitorId: number,
    date: Date,
    startTime: string,
    endTime: string,
    reason: string
  ): Promise<AvailableTimeSlot> {
    try {
      const response = await this.apiV5.post<ApiResponse<AvailableTimeSlot>>(
        `monitors/${monitorId}/block-time-slot`,
        {
          date: date.toISOString(),
          start_time: startTime,
          end_time: endTime,
          reason,
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to block time slot');
      }

      this.logger.info('Time slot blocked for monitor', {
        monitorId,
        date,
        startTime,
        endTime,
        reason
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to block time slot', { monitorId, date, startTime, endTime, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async unblockTimeSlot(timeSlotId: number): Promise<void> {
    try {
      await this.apiV5.delete(`monitors/time-slots/${timeSlotId}`).toPromise();

      this.logger.info('Time slot unblocked', { timeSlotId });

    } catch (error) {
      this.logger.error('Failed to unblock time slot', { timeSlotId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== SCHEDULING OPERATIONS ====================

  async scheduleMonitor(request: MonitorScheduleRequest): Promise<{
    success: boolean;
    scheduled_slot?: AvailableTimeSlot;
    conflicts?: MonitorScheduleConflict[];
  }> {
    try {
      const response = await this.apiV5.post<ApiResponse<any>>(
        'monitors/schedule',
        {
          ...request,
          date: request.date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid scheduling response');
      }

      if (response.data.success) {
        this.logger.info('Monitor scheduled successfully', request);
        // Update real-time status
        this.updateMonitorStatus(request.monitor_id);
      } else {
        this.logger.warn('Monitor scheduling failed due to conflicts', {
          request,
          conflicts: response.data.conflicts
        });
      }

      return response.data;

    } catch (error) {
      this.logger.error('Failed to schedule monitor', { request, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async findAlternativeMonitors(
    originalMonitorId: number,
    date: Date,
    startTime: string,
    endTime: string,
    courseGroupId?: number
  ): Promise<MonitorAlternative[]> {
    try {
      const response = await this.apiV5.post<ApiResponse<MonitorAlternative[]>>(
        'monitors/find-alternatives',
        {
          original_monitor_id: originalMonitorId,
          date: date.toISOString(),
          start_time: startTime,
          end_time: endTime,
          course_group_id: courseGroupId,
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      return response?.data || [];

    } catch (error) {
      this.logger.error('Failed to find alternative monitors', {
        originalMonitorId,
        date,
        startTime,
        endTime,
        error
      });
      return [];
    }
  }

  async checkSchedulingConflicts(request: MonitorScheduleRequest): Promise<MonitorScheduleConflict[]> {
    try {
      const response = await this.apiV5.post<ApiResponse<MonitorScheduleConflict[]>>(
        'monitors/check-conflicts',
        {
          ...request,
          date: request.date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      return response?.data || [];

    } catch (error) {
      this.logger.error('Failed to check scheduling conflicts', { request, error });
      return [];
    }
  }

  // ==================== BULK AVAILABILITY OPERATIONS ====================

  async getBulkAvailability(
    monitorIds: number[],
    dateFrom: Date,
    dateTo: Date
  ): Promise<Map<number, AvailableTimeSlot[]>> {
    try {
      const response = await this.apiV5.post<ApiResponse<{ [monitorId: string]: AvailableTimeSlot[] }>>(
        'monitors/bulk-availability',
        {
          monitor_ids: monitorIds,
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      const resultMap = new Map<number, AvailableTimeSlot[]>();

      if (response?.data) {
        Object.entries(response.data).forEach(([monitorId, slots]:any) => {
          resultMap.set(parseInt(monitorId, 10), slots);
        });
      }

      return resultMap;

    } catch (error) {
      this.logger.error('Failed to get bulk availability', { monitorIds, dateFrom, dateTo, error });
      return new Map();
    }
  }

  async updateBulkAvailability(
    updates: { monitor_id: number; availability: Partial<MonitorAvailability> }[]
  ): Promise<{ success: boolean; updated_count: number; errors: any[] }> {
    try {
      const response = await this.apiV5.post<ApiResponse<any>>(
        'monitors/bulk-update-availability',
        {
          updates: updates.map(update => ({
            ...update,
            availability: {
              ...update.availability,
              season_id: this.seasonContext.getCurrentSeasonId()
            }
          }))
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid bulk update response');
      }

      this.logger.info('Bulk availability update completed', {
        requestedUpdates: updates.length,
        successfulUpdates: response.data.updated_count
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to update bulk availability', { updates, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== AVAILABILITY ANALYTICS ====================

  async getAvailabilityAnalytics(
    dateFrom: Date,
    dateTo: Date,
    monitorIds?: number[]
  ): Promise<{
    total_available_hours: number;
    total_booked_hours: number;
    utilization_rate: number;
    peak_hours: TimeSlotInfo[];
    monitor_utilization: { monitor_id: number; utilization_rate: number }[];
    daily_availability: { date: Date; available_hours: number; booked_hours: number }[];
  }> {
    try {
      const response = await this.apiV5.post<ApiResponse<any>>(
        'monitors/availability-analytics',
        {
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          monitor_ids: monitorIds,
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      return response?.data || {
        total_available_hours: 0,
        total_booked_hours: 0,
        utilization_rate: 0,
        peak_hours: [],
        monitor_utilization: [],
        daily_availability: []
      };

    } catch (error) {
      this.logger.error('Failed to get availability analytics', { dateFrom, dateTo, monitorIds, error });
      throw error;
    }
  }

  // ==================== DATE OVERRIDES AND EXCEPTIONS ====================

  async addDateOverride(
    monitorId: number,
    dateOverride: Omit<DateOverride, 'id'>
  ): Promise<DateOverride> {
    try {
      const response = await this.apiV5.post<ApiResponse<DateOverride>>(
        `monitors/${monitorId}/date-overrides`,
        {
          ...dateOverride,
          date: dateOverride.date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to add date override');
      }

      this.logger.info('Date override added for monitor', { monitorId, dateOverride });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to add date override', { monitorId, dateOverride, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async removeDateOverride(monitorId: number, overrideId: number): Promise<void> {
    try {
      await this.apiV5.delete(`monitors/${monitorId}/date-overrides/${overrideId}`).toPromise();

      this.logger.info('Date override removed for monitor', { monitorId, overrideId });

    } catch (error) {
      this.logger.error('Failed to remove date override', { monitorId, overrideId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  getMonitorRealTimeStatus(monitorId: number): Observable<RealTimeMonitorStatus | undefined> {
    return this.realTimeStatus$.pipe(
      map(statusMap => statusMap.get(monitorId))
    );
  }

  isMonitorAvailable(monitorId: number, date: Date, startTime: string, endTime: string): Observable<boolean> {
    return this.getMonitorRealTimeStatus(monitorId).pipe(
      map(status => {
        if (!status) return false;

        // Basic availability check based on current status
        return status.current_status === 'available' &&
               (!status.next_available_slot || status.next_available_slot <= date);
      })
    );
  }

  formatTimeSlot(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  calculateSlotDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes - startMinutes;
  }

  isTimeSlotConflict(
    slot1: { start_time: string; end_time: string },
    slot2: { start_time: string; end_time: string }
  ): boolean {
    const slot1Start = this.timeToMinutes(slot1.start_time);
    const slot1End = this.timeToMinutes(slot1.end_time);
    const slot2Start = this.timeToMinutes(slot2.start_time);
    const slot2End = this.timeToMinutes(slot2.end_time);

    return !(slot1End <= slot2Start || slot2End <= slot1Start);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  clearRealTimeTracking(): void {
    this.monitoredMonitors.clear();
    this.realTimeStatusSubject.next(new Map());
    this.logger.info('Monitor real-time tracking cleared');
  }
}
