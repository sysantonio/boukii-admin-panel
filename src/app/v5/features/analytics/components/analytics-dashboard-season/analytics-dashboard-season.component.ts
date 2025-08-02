import {Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Chart, ChartConfiguration, registerables} from 'chart.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

// Analytics Services
import {
  AnalyticsSeasonService,
  ComprehensiveAnalytics,
  CrossFunctionalInsight
} from '../../services/analytics-season.service';

// Interfaces
import {

  AnalyticsFilter, AnalyticsTimeRange
} from '../../models/analytics.interface';
import { Season } from '../../../../core/models/season.interface';

// Register Chart.js components
Chart.register(...registerables);

interface TimeRangeSelection {
  label: string;
  value: string;
  range: () => { start: Date; end: Date };
}

interface ChartInstance {
  chart: Chart;
  type: string;
  data: any;
  options: any;
}

@Component({
  selector: 'app-analytics-dashboard-season',
  templateUrl: './analytics-dashboard-season.component.html',
  styleUrls: ['./analytics-dashboard-season.component.scss']
})
export class AnalyticsDashboardSeasonComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bookingsChart', { static: false }) bookingsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('retentionChart', { static: false }) retentionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart', { static: false }) performanceChartRef!: ElementRef<HTMLCanvasElement>;

  // Observables
  public currentSeason$: Observable<Season | null>;

  private destroy$ = new Subject<void>();

  // Component State
  public analyticsData: ComprehensiveAnalytics | null = null;
  public isLoading = false;
  public lastUpdated: Date | null = null;

  // Time Range Configuration
  public selectedTimeRange = 'month';
  public customDateRange = {
    start: new Date(),
    end: new Date()
  };
  public comparisonEnabled = false;

  // Chart Instances
  private charts = new Map<string, ChartInstance>();

  // Time Range Options
  public timeRangeOptions: TimeRangeSelection[] = [
    {
      label: 'Today',
      value: 'today',
      range: () => {
        const today = new Date();
        return { start: new Date(today.setHours(0, 0, 0, 0)), end: new Date(today.setHours(23, 59, 59, 999)) };
      }
    },
    {
      label: 'This Week',
      value: 'week',
      range: () => {
        const now = new Date();
        const start = new Date(now.setDate(now.getDate() - now.getDay()));
        const end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return { start, end };
      }
    },
    {
      label: 'This Month',
      value: 'month',
      range: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
    },
    {
      label: 'This Quarter',
      value: 'quarter',
      range: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return { start, end };
      }
    },
    {
      label: 'This Year',
      value: 'year',
      range: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { start, end };
      }
    }
  ];

  constructor(
    private analyticsService: AnalyticsSeasonService,
    private seasonContext: SeasonContextService,
    private i18n: I18nService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.logger.info('Analytics dashboard component initialized');
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  // ==================== INITIALIZATION ====================

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;

    // React to season changes
    this.seasonContext.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => {
        if (season) {
          this.loadDashboardData();
        }
      });

    // Watch analytics data changes
    this.analyticsService.analyticsData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.analyticsData = data;
        this.lastUpdated = data?.generated_at || null;
        this.updateCharts();
      });

    // Watch loading state
    this.analyticsService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  // ==================== DATA LOADING ====================

  private async loadDashboardData(): Promise<void> {
    try {
      const timeRange = this.getCurrentTimeRange();
      const filters = this.getCurrentFilters();

      await this.analyticsService.getComprehensiveAnalytics({
        analytics_type: 'comprehensive',
        time_range: timeRange,
        filters: filters,
        include_forecasting: true,
        include_comparisons: this.comparisonEnabled,
        granularity: 'detailed'
      });

      this.logger.info('Dashboard data loaded successfully', { timeRange, filters });

    } catch (error) {
      this.logger.error('Failed to load dashboard data', { error });
      this.snackBar.open(
        this.i18n.translateSync('analytics.failed_to_load_data'),
        'Close',
        { duration: 5000 }
      );
    }
  }

  public async refreshDashboard(): Promise<void> {
    await this.loadDashboardData();
    this.snackBar.open(
      this.i18n.translateSync('analytics.dashboard_refreshed'),
      'Close',
      { duration: 3000 }
    );
  }

  // ==================== TIME RANGE MANAGEMENT ====================

  public onTimeRangeChange(newRange: string): void {
    this.selectedTimeRange = newRange;
    if (newRange !== 'custom') {
      this.loadDashboardData();
    }
  }

  public onCustomDateRangeChange(): void {
    if (this.selectedTimeRange === 'custom' && this.customDateRange.start && this.customDateRange.end) {
      this.loadDashboardData();
    }
  }

  public onComparisonToggle(enabled: boolean): void {
    this.comparisonEnabled = enabled;
    this.loadDashboardData();
  }

  private getCurrentTimeRange(): AnalyticsTimeRange {
    let range: { start: Date; end: Date };

    if (this.selectedTimeRange === 'custom') {
      range = {
        start: this.customDateRange.start,
        end: this.customDateRange.end
      };
    } else {
      const timeRangeOption = this.timeRangeOptions.find(option => option.value === this.selectedTimeRange);
      range = timeRangeOption ? timeRangeOption.range() : this.timeRangeOptions[2].range(); // Default to month
    }

    return {
      start_date: range.start,
      end_date: range.end,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      granularity: this.getGranularityForRange(range.start, range.end)
    };
  }

  private getGranularityForRange(start: Date, end: Date): 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' {
    const diffDays = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) return 'hour';
    if (diffDays <= 31) return 'day';
    if (diffDays <= 90) return 'week';
    if (diffDays <= 365) return 'month';
    if (diffDays <= 1095) return 'quarter';
    return 'year';
  }

  private getCurrentFilters(): AnalyticsFilter {
    // Get filters from current season context and any applied filters
    const seasonId = this.seasonContext.getCurrentSeasonId();
    return {
      season_ids: seasonId ? [seasonId] : undefined,
      // Add other filters as needed
    };
  }

  // ==================== CHART MANAGEMENT ====================

  private initializeCharts(): void {
    this.initializeRevenueChart();
    this.initializeBookingsChart();
    this.initializeRetentionChart();
    this.initializePerformanceChart();
  }

  private initializeRevenueChart(): void {
    if (!this.revenueChartRef?.nativeElement) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: this.i18n.translateSync('analytics.revenue'),
          data: [],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatCurrency(value as number)
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.set('revenue', { chart, type: 'line', data: config.data, options: config.options });
  }

  private initializeBookingsChart(): void {
    if (!this.bookingsChartRef?.nativeElement) return;

    const ctx = this.bookingsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#4CAF50', // Confirmed
            '#FF9800', // Pending
            '#F44336', // Cancelled
            '#9C27B0', // Completed
            '#607D8B'  // Other
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.set('bookings', { chart, type: 'doughnut', data: config.data, options: config.options });
  }

  private initializeRetentionChart(): void {
    if (!this.retentionChartRef?.nativeElement) return;

    const ctx = this.retentionChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: this.i18n.translateSync('analytics.retention_rate'),
          data: [],
          backgroundColor: '#9C27B0',
          borderColor: '#7B1FA2',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.set('retention', { chart, type: 'bar', data: config.data, options: config.options });
  }

  private initializePerformanceChart(): void {
    if (!this.performanceChartRef?.nativeElement) return;

    const ctx = this.performanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: [],
        datasets: [{
          label: this.i18n.translateSync('analytics.performance_metrics'),
          data: [],
          borderColor: '#FF5722',
          backgroundColor: 'rgba(255, 87, 34, 0.2)',
          pointBackgroundColor: '#FF5722',
          pointBorderColor: '#D84315',
          pointHoverBackgroundColor: '#D84315',
          pointHoverBorderColor: '#FF5722'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.set('performance', { chart, type: 'radar', data: config.data, options: config.options });
  }

  private updateCharts(): void {
    if (!this.analyticsData) return;

    this.updateRevenueChart();
    this.updateBookingsChart();
    this.updateRetentionChart();
    this.updatePerformanceChart();
  }

  private updateRevenueChart(): void {
    const chartInstance = this.charts.get('revenue');
    if (!chartInstance || !this.analyticsData?.revenue.revenue_by_period) return;

    const revenueData = this.analyticsData.revenue.revenue_by_period;
    chartInstance.chart.data.labels = revenueData.data_points.map(point =>
      this.formatDate(point.timestamp)
    );
    chartInstance.chart.data.datasets[0].data = revenueData.data_points.map(point => point.value);
    chartInstance.chart.update();
  }

  private updateBookingsChart(): void {
    const chartInstance = this.charts.get('bookings');
    if (!chartInstance || !this.analyticsData?.bookings.booking_status_distribution) return;

    const statusData = this.analyticsData.bookings.booking_status_distribution;
    chartInstance.chart.data.labels = statusData.map(status =>
      this.i18n.translateSync(`booking.status.${status.status}`)
    );
    chartInstance.chart.data.datasets[0].data = statusData.map(status => status.count);
    chartInstance.chart.update();
  }

  private updateRetentionChart(): void {
    const chartInstance = this.charts.get('retention');
    if (!chartInstance || !this.analyticsData?.clients.client_retention_analysis.retention_by_cohort) return;

    const retentionData = this.analyticsData.clients.client_retention_analysis.retention_by_cohort;
    chartInstance.chart.data.labels = retentionData.map(cohort => cohort.cohort_month);
    chartInstance.chart.data.datasets[0].data = retentionData.map(cohort =>
      cohort.retention_periods[cohort.retention_periods.length - 1]?.retention_rate * 100 || 0
    );
    chartInstance.chart.update();
  }

  private updatePerformanceChart(): void {
    const chartInstance = this.charts.get('performance');
    if (!chartInstance || !this.analyticsData?.performance_summary.health_score) return;

    const healthScore = this.analyticsData.performance_summary.health_score;
    chartInstance.chart.data.labels = [
      this.i18n.translateSync('analytics.financial_health'),
      this.i18n.translateSync('analytics.operational_health'),
      this.i18n.translateSync('analytics.client_satisfaction_health'),
      this.i18n.translateSync('analytics.staff_satisfaction_health')
    ];
    chartInstance.chart.data.datasets[0].data = [
      healthScore.financial_health,
      healthScore.operational_health,
      healthScore.client_satisfaction_health,
      healthScore.staff_satisfaction_health
    ];
    chartInstance.chart.update();
  }

  private destroyCharts(): void {
    this.charts.forEach(chartInstance => {
      chartInstance.chart.destroy();
    });
    this.charts.clear();
  }

  // ==================== USER INTERACTIONS ====================

  public exportDashboard(): void {
    // Implementation for exporting entire dashboard
    this.logger.info('Exporting dashboard');
    // Would generate PDF or Excel export
  }

  public exportChart(chartType: string, format: 'png' | 'csv'): void {
    const chartInstance = this.charts.get(chartType);
    if (!chartInstance) return;

    if (format === 'png') {
      const canvas = chartInstance.chart.canvas;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartType}-chart.png`;
      link.href = url;
      link.click();
    } else if (format === 'csv') {
      // Export chart data as CSV
      this.exportChartDataAsCSV(chartType, chartInstance);
    }
  }

  public toggleChartComparison(chartType: string): void {
    // Toggle comparison data for specific chart
    this.logger.info('Toggling chart comparison', { chartType });
  }

  public applyInsightAction(insight: CrossFunctionalInsight): void {
    // Apply recommended action for insight
    this.logger.info('Applying insight action', { insight });
    this.snackBar.open(
      this.i18n.translateSync('analytics.insight_action_applied'),
      'Close',
      { duration: 3000 }
    );
  }

  public dismissInsight(insight: CrossFunctionalInsight): void {
    // Dismiss insight
    this.logger.info('Dismissing insight', { insight });
  }

  public openDashboardSettings(): void {
    // Open dashboard configuration dialog
    this.logger.info('Opening dashboard settings');
  }

  public saveDashboard(): void {
    // Save current dashboard configuration
    this.logger.info('Saving dashboard configuration');
  }

  public resetDashboard(): void {
    // Reset dashboard to default state
    this.logger.info('Resetting dashboard');
    this.loadDashboardData();
  }

  public shareSettings(): void {
    // Share dashboard configuration
    this.logger.info('Sharing dashboard');
  }

  // ==================== UTILITY METHODS ====================

  public getChangeClass(changePercentage: number): string {
    if (changePercentage > 0) return 'positive-change';
    if (changePercentage < 0) return 'negative-change';
    return 'neutral-change';
  }

  public getChangeIcon(changePercentage: number): string {
    if (changePercentage > 0) return 'trending_up';
    if (changePercentage < 0) return 'trending_down';
    return 'trending_flat';
  }

  public getInsightIcon(insightType: string): string {
    const iconMap: { [key: string]: string } = {
      correlation: 'link',
      trend: 'trending_up',
      anomaly: 'warning',
      opportunity: 'lightbulb'
    };
    return iconMap[insightType] || 'info';
  }

  public getRiskIcon(severity: string): string {
    const iconMap: { [key: string]: string } = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'dangerous'
    };
    return iconMap[severity] || 'info';
  }

  public getFreshnessIcon(qualityScore: number): string {
    if (qualityScore >= 90) return 'check_circle';
    if (qualityScore >= 70) return 'warning';
    return 'error';
  }

  public getFreshnessIconClass(qualityScore: number): string {
    if (qualityScore >= 90) return 'freshness-excellent';
    if (qualityScore >= 70) return 'freshness-good';
    return 'freshness-poor';
  }

  public getChartSubtitle(chartType: string): string {
    const timeRange = this.getCurrentTimeRange();
    const startDate = this.formatDate(timeRange.start_date);
    const endDate = this.formatDate(timeRange.end_date);
    return `${startDate} - ${endDate}`;
  }

  public getScoreCircumference(): string {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    return `${circumference} ${circumference}`;
  }

  public getScoreOffset(score: number): string {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return offset.toString();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private exportChartDataAsCSV(chartType: string, chartInstance: ChartInstance): void {
    const { data } = chartInstance;
    const headers = ['Label', 'Value'];
    const rows = [headers.join(',')];

    if (data.labels && data.datasets[0]?.data) {
      data.labels.forEach((label: string, index: number) => {
        const value = data.datasets[0].data[index];
        rows.push(`"${label}",${value}`);
      });
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${chartType}-data.csv`;
    link.click();
  }
}
