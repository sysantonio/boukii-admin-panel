import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, catchError, finalize, shareReplay } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CacheService } from '../../../core/services/cache.service';
import {
  Monitor,
  CreateMonitorRequest,
  UpdateMonitorRequest,
  MonitorSearchCriteria,
  MonitorStats,
  MonitorEvaluation,
  MonitorAvailability,
  MonitorPerformanceStats
} from '../models/monitor.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';
import { Season } from '../../../core/models/season.interface';

@Injectable({
  providedIn: 'root'
})
export class MonitorSeasonService {
  private monitorsSubject = new BehaviorSubject<Monitor[]>([]);
  public monitors$ = this.monitorsSubject.asObservable();

  private selectedMonitorSubject = new BehaviorSubject<Monitor | null>(null);
  public selectedMonitor$ = this.selectedMonitorSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private statsSubject = new BehaviorSubject<MonitorStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  // Season-aware monitor cache
  private monitorCache = new Map<string, Monitor[]>();
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
    // React to season changes and invalidate monitor cache
    this.seasonContext.currentSeason$.subscribe(season => {
      if (season) {
        this.invalidateMonitorCache();
        this.logger.info('Monitor service initialized for season', { seasonId: season.id });
      }
    });
  }

  // ==================== SEASON-AWARE MONITOR OPERATIONS ====================

  async getMonitorsBySeason(seasonId?: number): Promise<Monitor[]> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();

    if (!targetSeasonId) {
      throw new Error('No season selected');
    }

    const cacheKey = `monitors_season_${targetSeasonId}`;

    // Check cache first
    const cachedMonitors = this.monitorCache.get(cacheKey);
    if (cachedMonitors) {
      this.logger.debug('Returning cached monitors for season', { seasonId: targetSeasonId });
      this.monitorsSubject.next(cachedMonitors);
      return cachedMonitors;
    }

    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5
        .get<ApiResponse<Monitor[]>>(`seasons/${targetSeasonId}/monitors`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid monitors response');
      }

      const monitors = this.processMonitorData(response.data);

      // Cache the results
      this.monitorCache.set(cacheKey, monitors);
      this.monitorsSubject.next(monitors);

      this.logger.info('Monitors loaded for season', {
        seasonId: targetSeasonId,
        monitorCount: monitors.length
      });

      return monitors;

    } catch (error) {
      this.logger.error('Failed to load monitors for season', { seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getMonitorById(id: number): Promise<Monitor> {
    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5
        .get<ApiResponse<Monitor>>(`monitors/${id}`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Monitor not found');
      }

      const monitor = this.processMonitorData([response.data])[0];
      this.selectedMonitorSubject.next(monitor);

      this.logger.info('Monitor loaded successfully', { monitorId: id });
      return monitor;

    } catch (error) {
      this.logger.error('Failed to load monitor', { id, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createMonitor(monitorData: CreateMonitorRequest): Promise<Monitor> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (!currentSeasonId) {
      throw new Error('No season selected');
    }

    this.loadingSubject.next(true);

    try {
      const requestData = {
        ...monitorData,
        season_id: currentSeasonId,
        hire_date: monitorData.hire_date.toISOString(),
        birth_date: monitorData.birth_date.toISOString()
      };

      const response = await this.apiV5
        .post<ApiResponse<Monitor>>('monitors', requestData)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid monitor creation response');
      }

      const newMonitor = this.processMonitorData([response.data])[0];

      // Update local state
      const currentMonitors = this.monitorsSubject.value;
      this.monitorsSubject.next([newMonitor, ...currentMonitors]);

      // Invalidate cache
      this.invalidateMonitorCache();

      this.logger.info('Monitor created successfully', {
        monitorId: newMonitor.id,
        seasonId: currentSeasonId
      });

      return newMonitor;

    } catch (error) {
      this.logger.error('Failed to create monitor', { monitorData, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateMonitor(monitorData: UpdateMonitorRequest): Promise<Monitor> {
    this.loadingSubject.next(true);

    try {
      const requestData = {
        ...monitorData,
        hire_date: monitorData.hire_date?.toISOString(),
        birth_date: monitorData.birth_date?.toISOString()
      };

      const response = await this.apiV5
        .put<ApiResponse<Monitor>>(`monitors/${monitorData.id}`, requestData)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid monitor update response');
      }

      const updatedMonitor = this.processMonitorData([response.data])[0];

      // Update local state
      const currentMonitors = this.monitorsSubject.value;
      const updatedMonitors = currentMonitors.map(monitor =>
        monitor.id === updatedMonitor.id ? updatedMonitor : monitor
      );
      this.monitorsSubject.next(updatedMonitors);

      // Update selected monitor if it matches
      const selectedMonitor = this.selectedMonitorSubject.value;
      if (selectedMonitor?.id === updatedMonitor.id) {
        this.selectedMonitorSubject.next(updatedMonitor);
      }

      // Invalidate cache
      this.invalidateMonitorCache();

      this.logger.info('Monitor updated successfully', { monitorId: updatedMonitor.id });
      return updatedMonitor;

    } catch (error) {
      this.logger.error('Failed to update monitor', { monitorData, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteMonitor(id: number): Promise<void> {
    this.loadingSubject.next(true);

    try {
      await this.apiV5.delete(`monitors/${id}`).toPromise();

      // Update local state
      const currentMonitors = this.monitorsSubject.value;
      const updatedMonitors = currentMonitors.filter(monitor => monitor.id !== id);
      this.monitorsSubject.next(updatedMonitors);

      // Clear selection if deleted monitor was selected
      const selectedMonitor = this.selectedMonitorSubject.value;
      if (selectedMonitor?.id === id) {
        this.selectedMonitorSubject.next(null);
      }

      // Invalidate cache
      this.invalidateMonitorCache();

      this.logger.info('Monitor deleted successfully', { monitorId: id });

    } catch (error) {
      this.logger.error('Failed to delete monitor', { id, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== MONITOR SEARCH AND FILTERING ====================

  async searchMonitors(criteria: MonitorSearchCriteria): Promise<{
    monitors: Monitor[];
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
          monitors: Monitor[];
          total_count: number;
          current_page: number;
        }>>('monitors/search', params)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid search response');
      }

      const monitors = this.processMonitorData(response.data.monitors);

      this.logger.info('Monitor search completed', {
        criteria,
        resultCount: monitors.length,
        totalCount: response.data.total_count
      });

      return {
        monitors,
        totalCount: response.data.total_count,
        page: response.data.current_page
      };

    } catch (error) {
      this.logger.error('Failed to search monitors', { criteria, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getAvailableMonitors(
    date: Date,
    startTime?: string,
    endTime?: string,
    courseGroupId?: number
  ): Promise<Monitor[]> {
    try {
      const params: any = {
        date: date.toISOString(),
        season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
      };

      if (startTime) params.start_time = startTime;
      if (endTime) params.end_time = endTime;
      if (courseGroupId) params.course_group_id = courseGroupId.toString();

      const response = await this.apiV5
        .get<ApiResponse<Monitor[]>>('monitors/available', params)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid available monitors response');
      }

      const monitors = this.processMonitorData(response.data);

      this.logger.info('Available monitors loaded', {
        date,
        startTime,
        endTime,
        courseGroupId,
        availableCount: monitors.length
      });

      return monitors;

    } catch (error) {
      this.logger.error('Failed to get available monitors', { date, startTime, endTime, courseGroupId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR STATISTICS ====================

  async getMonitorStats(seasonId?: number): Promise<MonitorStats> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
    if (!targetSeasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5
        .get<ApiResponse<MonitorStats>>(`seasons/${targetSeasonId}/monitors/statistics`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid statistics response');
      }

      const stats = response.data;
      this.statsSubject.next(stats);

      this.logger.info('Monitor statistics loaded', { seasonId: targetSeasonId });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load monitor statistics', { seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getMonitorPerformanceStats(monitorId: number, seasonId?: number): Promise<MonitorPerformanceStats> {
    const targetSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();

    try {
      const params: any = {};
      if (targetSeasonId) {
        params.season_id = targetSeasonId.toString();
      }

      const response = await this.apiV5
        .get<ApiResponse<MonitorPerformanceStats>>(`monitors/${monitorId}/performance-stats`, params)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid performance stats response');
      }

      this.logger.info('Monitor performance stats loaded', {
        monitorId,
        seasonId: targetSeasonId
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to load monitor performance stats', { monitorId, seasonId: targetSeasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR EVALUATION ====================

  async getMonitorEvaluations(monitorId: number): Promise<MonitorEvaluation[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<MonitorEvaluation[]>>(`monitors/${monitorId}/evaluations`)
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid evaluations response');
      }

      this.logger.info('Monitor evaluations loaded', {
        monitorId,
        evaluationCount: response.data?.length || 0
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to load monitor evaluations', { monitorId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async createMonitorEvaluation(evaluation: Omit<MonitorEvaluation, 'id' | 'evaluation_date'>): Promise<ApiResponse<MonitorEvaluation>> {
    try {
      const requestData = {
        ...evaluation,
        evaluation_period_start: evaluation.evaluation_period_start.toISOString(),
        evaluation_period_end: evaluation.evaluation_period_end.toISOString(),
        next_evaluation_date: evaluation.next_evaluation_date.toISOString()
      };

      const response = await this.apiV5
        .post<ApiResponse<MonitorEvaluation>>(`monitors/${evaluation.monitor_id}/evaluations`, requestData)
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to create monitor evaluation');
      }

      this.logger.info('Monitor evaluation created', {
        monitorId: evaluation.monitor_id,
        evaluationId: response.data?.id
      });

      return response.data;

    } catch (error) {
      this.logger.error('Failed to create monitor evaluation', { evaluation, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR CERTIFICATIONS ====================

  async getMonitorCertifications(monitorId: number): Promise<ApiResponse<any[]> | any[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<any[]>>(`monitors/${monitorId}/certifications`)
        .toPromise();

      return response?.data ?? [];

    } catch (error) {
      this.logger.error('Failed to load monitor certifications', { monitorId, error });
      return [];
    }
  }

  async addMonitorCertification(monitorId: number, certification: any): Promise<any> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<any>>(`monitors/${monitorId}/certifications`, {
          ...certification,
          issue_date: certification.issue_date.toISOString(),
          expiry_date: certification.expiry_date?.toISOString()
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Failed to add certification');
      }

      this.logger.info('Monitor certification added', { monitorId, certificationId: response.data?.id });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to add monitor certification', { monitorId, certification, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR ASSIGNMENTS ====================

  async getMonitorAssignments(monitorId: number, dateFrom?: Date, dateTo?: Date): Promise<ApiResponse<any[]> | any[]> {
    try {
      const params: any = {
        season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
      };

      if (dateFrom) params.date_from = dateFrom.toISOString();
      if (dateTo) params.date_to = dateTo.toISOString();

      const response = await this.apiV5
        .get<ApiResponse<any[]>>(`monitors/${monitorId}/assignments`, params)
        .toPromise();

      return response?.data ?? [];

    } catch (error) {
      this.logger.error('Failed to load monitor assignments', { monitorId, dateFrom, dateTo, error });
      return [];
    }
  }

  async assignMonitorToBooking(monitorId: number, bookingId: number): Promise<void> {
    try {
      await this.apiV5
        .post(`monitors/${monitorId}/assign`, {
          booking_id: bookingId,
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      this.logger.info('Monitor assigned to booking', { monitorId, bookingId });

    } catch (error) {
      this.logger.error('Failed to assign monitor to booking', { monitorId, bookingId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async unassignMonitorFromBooking(monitorId: number, bookingId: number): Promise<void> {
    try {
      await this.apiV5
        .delete(`monitors/${monitorId}/assignments/${bookingId}`)
        .toPromise();

      this.logger.info('Monitor unassigned from booking', { monitorId, bookingId });

    } catch (error) {
      this.logger.error('Failed to unassign monitor from booking', { monitorId, bookingId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR VALIDATION ====================

  canEditMonitor(monitor: Monitor): boolean {
    const currentSeason = this.seasonContext.getCurrentSeason();

    if (!currentSeason) {
      return false;
    }

    // Can edit if monitor belongs to current season and season is not closed
    return monitor.season_id === currentSeason.id && !currentSeason.is_closed;
  }

  canDeleteMonitor(monitor: Monitor): boolean {
    // Additional business rules for deletion
    if (!this.canEditMonitor(monitor)) {
      return false;
    }

    // Cannot delete if monitor has active assignments
    if (monitor.performance_stats?.courses_this_season > 0) {
      return false;
    }

    return true;
  }

  validateMonitorData(monitorData: CreateMonitorRequest | UpdateMonitorRequest): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!monitorData.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!monitorData.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!monitorData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(monitorData.email)) {
      errors.push('Invalid email format');
    }

    if (!monitorData.phone?.trim()) {
      errors.push('Phone number is required');
    }

    if (!monitorData.document_number?.trim()) {
      errors.push('Document number is required');
    }

    if (!monitorData.hire_date) {
      errors.push('Hire date is required');
    }

    if (!monitorData.base_hourly_rate || monitorData.base_hourly_rate <= 0) {
      errors.push('Valid hourly rate is required');
    }

    // Business rule validations
    if (monitorData.hire_date && monitorData.hire_date > new Date()) {
      warnings.push('Hire date is in the future');
    }

    if (monitorData.base_hourly_rate && monitorData.base_hourly_rate < 10) {
      warnings.push('Hourly rate seems low for monitor position');
    }

    if (monitorData.base_hourly_rate && monitorData.base_hourly_rate > 100) {
      warnings.push('Hourly rate seems high - please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ==================== UTILITY METHODS ====================

  getCurrentMonitors(): Monitor[] {
    return this.monitorsSubject.value;
  }

  getMonitorById_Sync(id: number): Monitor | undefined {
    return this.monitorsSubject.value.find(monitor => monitor.id === id);
  }

  clearSelectedMonitor(): void {
    this.selectedMonitorSubject.next(null);
  }

  selectMonitor(monitor: Monitor): void {
    this.selectedMonitorSubject.next(monitor);
  }

  // ==================== PRIVATE METHODS ====================

  private processMonitorData(monitors: Monitor[]): Monitor[] {
    return monitors.map(monitor => ({
      ...monitor,
      full_name: `${monitor.first_name} ${monitor.last_name}`,
      age: this.calculateAge(new Date(monitor.birth_date)),
      created_at: new Date(monitor.created_at),
      updated_at: new Date(monitor.updated_at),
      hire_date: new Date(monitor.hire_date)
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

  private buildSearchParams(criteria: MonitorSearchCriteria): any {
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

  private invalidateMonitorCache(): void {
    this.monitorCache.clear();
    this.logger.debug('Monitor cache invalidated');
  }
}
