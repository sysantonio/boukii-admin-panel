import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap, catchError, shareReplay, finalize } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CacheService } from '../../../core/services/cache.service';
import {
  AnalyticsTimeRange,
  AnalyticsFilter,
  RevenueAnalytics,
  BookingAnalytics,
  ClientAnalytics,
  MonitorAnalytics,
  OperationalAnalytics,
  AnalyticsDashboard,
  AnalyticsReport,
  AnalyticsMetric,
  AnalyticsTimeSeriesData,
  SeasonalRevenueComparison,
  ClientRetentionAnalysis,
  MonitorUtilizationAnalytics
} from '../models/analytics.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';
import { Season } from '../../../core/models/season.interface';

export interface AnalyticsRequest {
  analytics_type: 'revenue' | 'bookings' | 'clients' | 'monitors' | 'operational' | 'comprehensive';
  time_range: AnalyticsTimeRange;
  filters: AnalyticsFilter;
  include_forecasting?: boolean;
  include_comparisons?: boolean;
  granularity?: 'summary' | 'detailed';
}

export interface ComprehensiveAnalytics {
  revenue: RevenueAnalytics;
  bookings: BookingAnalytics;
  clients: ClientAnalytics;
  monitors: MonitorAnalytics;
  operational: OperationalAnalytics;
  cross_functional_insights: CrossFunctionalInsight[];
  performance_summary: PerformanceSummary;
  generated_at: Date;
  data_freshness: DataFreshnessInfo;
}

export interface CrossFunctionalInsight {
  insight_id: string;
  insight_type: 'correlation' | 'trend' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  affected_areas: string[];
  impact_score: number;
  confidence_level: number;
  recommended_actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceSummary {
  overall_score: number;
  key_performance_indicators: AnalyticsMetric[];
  performance_vs_targets: { metric: string; target: number; actual: number; variance: number }[];
  trend_indicators: { area: string; trend: 'improving' | 'declining' | 'stable'; strength: number }[];
  health_score: HealthScore;
}

export interface HealthScore {
  financial_health: number;
  operational_health: number;
  client_satisfaction_health: number;
  staff_satisfaction_health: number;
  overall_health: number;
  risk_factors: RiskFactor[];
}

export interface RiskFactor {
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  potential_impact: string;
  mitigation_strategies: string[];
}

export interface DataFreshnessInfo {
  last_updated: Date;
  data_sources: { source: string; last_sync: Date; status: 'current' | 'stale' | 'error' }[];
  coverage_percentage: number;
  quality_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsSeasonService {
  private analyticsDataSubject = new BehaviorSubject<ComprehensiveAnalytics | null>(null);
  public analyticsData$ = this.analyticsDataSubject.asObservable();

  private dashboardsSubject = new BehaviorSubject<AnalyticsDashboard[]>([]);
  public dashboards$ = this.dashboardsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Season-aware analytics cache
  private analyticsCache = new Map<string, any>();
  private readonly cacheTimeout = 10 * 60 * 1000; // 10 minutes for analytics data

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
    // React to season changes and invalidate analytics cache
    this.seasonContext.currentSeason$.subscribe(season => {
      if (season) {
        this.invalidateAnalyticsCache();
        this.logger.info('Analytics service initialized for season', { seasonId: season.id });
      }
    });
  }

  // ==================== COMPREHENSIVE ANALYTICS ====================

  async getComprehensiveAnalytics(request: AnalyticsRequest): Promise<ComprehensiveAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    const cacheKey = `comprehensive_analytics_${seasonId}_${JSON.stringify(request)}`;

    // Check cache first
    const cachedData = this.analyticsCache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData.timestamp)) {
      this.logger.debug('Returning cached comprehensive analytics', { seasonId, cacheKey });
      this.analyticsDataSubject.next(cachedData.data);
      return cachedData.data;
    }

    this.loadingSubject.next(true);

    try {
      const response = await this.apiV5.post<ApiResponse<ComprehensiveAnalytics>>(
        `seasons/${seasonId}/analytics/comprehensive`,
        {
          ...request,
          time_range: {
            ...request.time_range,
            start_date: request.time_range.start_date.toISOString(),
            end_date: request.time_range.end_date.toISOString()
          }
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid comprehensive analytics response');
      }

      const analyticsData = this.processAnalyticsData(response.data);

      // Cache the results
      this.analyticsCache.set(cacheKey, {
        data: analyticsData,
        timestamp: Date.now()
      });

      this.analyticsDataSubject.next(analyticsData);

      this.logger.info('Comprehensive analytics loaded successfully', {
        seasonId,
        timeRange: request.time_range,
        dataFreshness: analyticsData.data_freshness
      });

      return analyticsData;

    } catch (error) {
      this.logger.error('Failed to load comprehensive analytics', { seasonId, request, error });
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== REVENUE ANALYTICS ====================

  async getRevenueAnalytics(timeRange: AnalyticsTimeRange, filters?: AnalyticsFilter): Promise<RevenueAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<RevenueAnalytics>>(
        `seasons/${seasonId}/analytics/revenue`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          filters: filters || {}
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid revenue analytics response');
      }

      this.logger.info('Revenue analytics loaded successfully', { seasonId, timeRange });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load revenue analytics', { seasonId, timeRange, filters, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getSeasonalRevenueComparison(seasons: number[]): Promise<SeasonalRevenueComparison[]> {
    try {
      const response = await this.apiV5.post<ApiResponse<SeasonalRevenueComparison[]>>(
        'analytics/seasonal-revenue-comparison',
        { season_ids: seasons }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid seasonal revenue comparison response');
      }

      this.logger.info('Seasonal revenue comparison loaded', { seasons, comparisons: response.data.length });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load seasonal revenue comparison', { seasons, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== BOOKING ANALYTICS ====================

  async getBookingAnalytics(timeRange: AnalyticsTimeRange, filters?: AnalyticsFilter): Promise<BookingAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<BookingAnalytics>>(
        `seasons/${seasonId}/analytics/bookings`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          filters: filters || {}
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid booking analytics response');
      }

      this.logger.info('Booking analytics loaded successfully', { seasonId, timeRange });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load booking analytics', { seasonId, timeRange, filters, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== CLIENT ANALYTICS ====================

  async getClientAnalytics(timeRange: AnalyticsTimeRange, filters?: AnalyticsFilter): Promise<ClientAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<ClientAnalytics>>(
        `seasons/${seasonId}/analytics/clients`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          filters: filters || {}
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid client analytics response');
      }

      this.logger.info('Client analytics loaded successfully', { seasonId, timeRange });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load client analytics', { seasonId, timeRange, filters, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getClientRetentionAnalysis(cohortStartDate: Date, analysisEndDate: Date): Promise<ClientRetentionAnalysis> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<ClientRetentionAnalysis>>(
        `seasons/${seasonId}/analytics/client-retention`,
        {
          cohort_start_date: cohortStartDate.toISOString(),
          analysis_end_date: analysisEndDate.toISOString()
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid client retention analysis response');
      }

      this.logger.info('Client retention analysis loaded successfully', { seasonId, cohortStartDate, analysisEndDate });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load client retention analysis', { seasonId, cohortStartDate, analysisEndDate, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== MONITOR ANALYTICS ====================

  async getMonitorAnalytics(timeRange: AnalyticsTimeRange, filters?: AnalyticsFilter): Promise<MonitorAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<MonitorAnalytics>>(
        `seasons/${seasonId}/analytics/monitors`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          filters: filters || {}
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid monitor analytics response');
      }

      this.logger.info('Monitor analytics loaded successfully', { seasonId, timeRange });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load monitor analytics', { seasonId, timeRange, filters, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async getMonitorUtilizationAnalytics(timeRange: AnalyticsTimeRange, monitorIds?: number[]): Promise<MonitorUtilizationAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<MonitorUtilizationAnalytics>>(
        `seasons/${seasonId}/analytics/monitor-utilization`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          monitor_ids: monitorIds
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid monitor utilization analytics response');
      }

      this.logger.info('Monitor utilization analytics loaded successfully', { seasonId, timeRange, monitorCount: monitorIds?.length });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load monitor utilization analytics', { seasonId, timeRange, monitorIds, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== OPERATIONAL ANALYTICS ====================

  async getOperationalAnalytics(timeRange: AnalyticsTimeRange, filters?: AnalyticsFilter): Promise<OperationalAnalytics> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<OperationalAnalytics>>(
        `seasons/${seasonId}/analytics/operational`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          filters: filters || {}
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid operational analytics response');
      }

      this.logger.info('Operational analytics loaded successfully', { seasonId, timeRange });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load operational analytics', { seasonId, timeRange, filters, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== DASHBOARD MANAGEMENT ====================

  async getDashboards(): Promise<AnalyticsDashboard[]> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.get<ApiResponse<AnalyticsDashboard[]>>(
        `seasons/${seasonId}/analytics/dashboards`
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid dashboards response');
      }

      const dashboards = response.data.map(dashboard => ({
        ...dashboard,
        created_at: new Date(dashboard.created_at),
        last_modified: new Date(dashboard.last_modified)
      }));

      this.dashboardsSubject.next(dashboards);

      this.logger.info('Analytics dashboards loaded successfully', { seasonId, dashboardCount: dashboards.length });
      return dashboards;

    } catch (error) {
      this.logger.error('Failed to load analytics dashboards', { seasonId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async createDashboard(dashboard: Omit<AnalyticsDashboard, 'dashboard_id' | 'created_at' | 'last_modified'>): Promise<AnalyticsDashboard> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<AnalyticsDashboard>>(
        `seasons/${seasonId}/analytics/dashboards`,
        {
          ...dashboard,
          time_range: {
            ...dashboard.time_range,
            start_date: dashboard.time_range.start_date.toISOString(),
            end_date: dashboard.time_range.end_date.toISOString()
          }
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to create dashboard');
      }

      const newDashboard = {
        ...response.data,
        created_at: new Date(response.data.created_at),
        last_modified: new Date(response.data.last_modified)
      };

      // Update local state
      const currentDashboards = this.dashboardsSubject.value;
      this.dashboardsSubject.next([newDashboard, ...currentDashboards]);

      this.logger.info('Analytics dashboard created successfully', { seasonId, dashboardId: newDashboard.dashboard_id });
      return newDashboard;

    } catch (error) {
      this.logger.error('Failed to create analytics dashboard', { seasonId, dashboard, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async updateDashboard(dashboardId: string, updates: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.put<ApiResponse<AnalyticsDashboard>>(
        `seasons/${seasonId}/analytics/dashboards/${dashboardId}`,
        {
          ...updates,
          time_range: updates.time_range ? {
            ...updates.time_range,
            start_date: updates.time_range.start_date.toISOString(),
            end_date: updates.time_range.end_date.toISOString()
          } : undefined
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to update dashboard');
      }

      const updatedDashboard = {
        ...response.data,
        created_at: new Date(response.data.created_at),
        last_modified: new Date(response.data.last_modified)
      };

      // Update local state
      const currentDashboards = this.dashboardsSubject.value;
      const updatedDashboards = currentDashboards.map(dashboard =>
        dashboard.dashboard_id === dashboardId ? updatedDashboard : dashboard
      );
      this.dashboardsSubject.next(updatedDashboards);

      this.logger.info('Analytics dashboard updated successfully', { seasonId, dashboardId });
      return updatedDashboard;

    } catch (error) {
      this.logger.error('Failed to update analytics dashboard', { seasonId, dashboardId, updates, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      await this.apiV5.delete(`seasons/${seasonId}/analytics/dashboards/${dashboardId}`).toPromise();

      // Update local state
      const currentDashboards = this.dashboardsSubject.value;
      const updatedDashboards = currentDashboards.filter(dashboard => dashboard.dashboard_id !== dashboardId);
      this.dashboardsSubject.next(updatedDashboards);

      this.logger.info('Analytics dashboard deleted successfully', { seasonId, dashboardId });

    } catch (error) {
      this.logger.error('Failed to delete analytics dashboard', { seasonId, dashboardId, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== REPORTING ====================

  async generateReport(report: Omit<AnalyticsReport, 'report_id' | 'created_at'>): Promise<AnalyticsReport> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<AnalyticsReport>>(
        `seasons/${seasonId}/analytics/reports`,
        {
          ...report,
          time_range: {
            ...report.time_range,
            start_date: report.time_range.start_date.toISOString(),
            end_date: report.time_range.end_date.toISOString()
          }
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Failed to generate report');
      }

      this.logger.info('Analytics report generated successfully', { seasonId, reportId: response.data.report_id });
      return {
        ...response.data,
        created_at: new Date(response.data.created_at)
      };

    } catch (error) {
      this.logger.error('Failed to generate analytics report', { seasonId, report, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<unknown> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.get(
        `seasons/${seasonId}/analytics/reports/${reportId}/download`,
        {
          params: { format },
          responseType: 'blob'
        }
      ).toPromise();

      this.logger.info('Analytics report downloaded successfully', { seasonId, reportId, format });
      return response;

    } catch (error) {
      this.logger.error('Failed to download analytics report', { seasonId, reportId, format, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== REAL-TIME ANALYTICS ====================

  async getRealtimeMetrics(): Promise<{
    active_bookings: number;
    revenue_today: number;
    monitors_active: number;
    client_satisfaction_today: number;
    system_health: number;
  }> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.get<ApiResponse<any>>(
        `seasons/${seasonId}/analytics/realtime-metrics`
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid realtime metrics response');
      }

      return response.data;

    } catch (error) {
      this.logger.error('Failed to load realtime metrics', { seasonId, error });
      throw error;
    }
  }

  // ==================== ANALYTICS INSIGHTS ====================

  async getAnalyticsInsights(
    timeRange: AnalyticsTimeRange,
    focusAreas?: string[]
  ): Promise<CrossFunctionalInsight[]> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<CrossFunctionalInsight[]>>(
        `seasons/${seasonId}/analytics/insights`,
        {
          time_range: {
            ...timeRange,
            start_date: timeRange.start_date.toISOString(),
            end_date: timeRange.end_date.toISOString()
          },
          focus_areas: focusAreas
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid analytics insights response');
      }

      this.logger.info('Analytics insights loaded successfully', { seasonId, insightCount: response.data.length });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load analytics insights', { seasonId, timeRange, focusAreas, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== FORECASTING ====================

  async getForecastingData(
    metric: string,
    historicalRange: AnalyticsTimeRange,
    forecastPeriods: number
  ): Promise<AnalyticsTimeSeriesData> {
    const seasonId = this.seasonContext.getCurrentSeasonId();
    if (!seasonId) {
      throw new Error('No season selected');
    }

    try {
      const response = await this.apiV5.post<ApiResponse<AnalyticsTimeSeriesData>>(
        `seasons/${seasonId}/analytics/forecasting`,
        {
          metric,
          historical_range: {
            ...historicalRange,
            start_date: historicalRange.start_date.toISOString(),
            end_date: historicalRange.end_date.toISOString()
          },
          forecast_periods: forecastPeriods
        }
      ).toPromise();

      if (!response?.data) {
        throw new Error('Invalid forecasting data response');
      }

      this.logger.info('Forecasting data loaded successfully', { seasonId, metric, forecastPeriods });
      return response.data;

    } catch (error) {
      this.logger.error('Failed to load forecasting data', { seasonId, metric, historicalRange, forecastPeriods, error });
      this.errorHandler.handleError(error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  getCurrentAnalyticsData(): ComprehensiveAnalytics | null {
    return this.analyticsDataSubject.value;
  }

  getCurrentDashboards(): AnalyticsDashboard[] {
    return this.dashboardsSubject.value;
  }

  private processAnalyticsData(data: ComprehensiveAnalytics): ComprehensiveAnalytics {
    return {
      ...data,
      generated_at: new Date(data.generated_at),
      data_freshness: {
        ...data.data_freshness,
        last_updated: new Date(data.data_freshness.last_updated),
        data_sources: data.data_freshness.data_sources.map(source => ({
          ...source,
          last_sync: new Date(source.last_sync)
        }))
      }
    };
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private invalidateAnalyticsCache(): void {
    this.analyticsCache.clear();
    this.logger.debug('Analytics cache invalidated');
  }

  clearCache(): void {
    this.invalidateAnalyticsCache();
    this.analyticsDataSubject.next(null);
    this.dashboardsSubject.next([]);
  }
}
