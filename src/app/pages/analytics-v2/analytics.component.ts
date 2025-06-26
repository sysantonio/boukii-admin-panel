import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import moment from 'moment';
import Plotly from 'plotly.js-dist-min';

import { ApiCrudService } from '../../../service/crud.service';
import { TableColumn } from '../../../@vex/interfaces/table-column.interface';

// Interfaces para mejor tipado
interface AnalyticsFilters {
  startDate: string | null;
  endDate: string | null;
  courseType: number | null;
  source: string | null;
  sportId: number | null;
  onlyWeekends: boolean;
}

interface AnalyticsSummary {
  totalPaid: number;
  activeBookings: number;
  withInsurance: number;
  withVoucher: number;
  totalRefunds: number;
  netRevenue: number;
  expectedRevenue: number;
}

interface PaymentMethodBreakdown {
  cash: number;
  card: number;
  online: number;
  vouchers: number;
  pending: number;
}

interface CourseAnalytics {
  courseId: number;
  courseName: string;
  courseType: number;
  totalRevenue: number;
  totalBookings: number;
  averagePrice: number;
  completionRate: number;
  paymentMethods: PaymentMethodBreakdown;
}

interface RevenueAnalytics {
  date: string;
  revenue: number;
  bookings: number;
  refunds: number;
  netRevenue: number;
  expectedRevenue: number;
  paymentMethods: PaymentMethodBreakdown;
}

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {

  // Form controls
  filterForm: FormGroup;

  // Data properties
  summary: AnalyticsSummary = {
    totalPaid: 0,
    activeBookings: 0,
    withInsurance: 0,
    withVoucher: 0,
    totalRefunds: 0,
    netRevenue: 0,
    expectedRevenue: 0
  };

  courseAnalytics: CourseAnalytics[] = [];
  revenueAnalytics: RevenueAnalytics[] = [];

  // UI State
  loading = false;
  activeTab = 'overview';
  activeTabIndex = 0;

  // User data
  user: any;
  currency = 'CHF';

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Table columns for course analytics
  courseColumns: TableColumn<CourseAnalytics>[] = [
    { label: 'course_name', property: 'courseName', type: 'text', visible: true },
    { label: 'course_type', property: 'courseType', type: 'course_type_data', visible: true },
    { label: 'total_revenue', property: 'totalRevenue', type: 'price', visible: true },
    { label: 'total_bookings', property: 'totalBookings', type: 'text', visible: true },
    { label: 'average_price', property: 'averagePrice', type: 'price', visible: true },
    { label: 'completion_rate', property: 'completionRate', type: 'text', visible: true }
  ];

  // Table columns for revenue analytics
  revenueColumns: TableColumn<RevenueAnalytics>[] = [
    { label: 'date', property: 'date', type: 'date', visible: true },
    { label: 'revenue', property: 'revenue', type: 'price', visible: true },
    { label: 'bookings', property: 'bookings', type: 'text', visible: true },
    { label: 'refunds', property: 'refunds', type: 'price', visible: true },
    { label: 'net_revenue', property: 'netRevenue', type: 'price', visible: true }
  ];

  constructor(
    private fb: FormBuilder,
    private crudService: ApiCrudService,
    private router: Router,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser') || '{}');
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Set default date range (current month)
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

    this.filterForm = this.fb.group({
      startDate: [startOfMonth],
      endDate: [endOfMonth],
      courseType: [null],
      source: [null],
      sportId: [null],
      onlyWeekends: [false]
    });
  }

  private setupFormSubscriptions(): void {
    // Debounce form changes to avoid too many API calls
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadAnalyticsData();
      });
  }

  private loadInitialData(): void {
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    this.loading = true;
    const filters = this.getFilters();

    // Load all analytics data
    Promise.all([
      this.loadSummaryData(filters),
      this.loadCourseAnalytics(filters),
      this.loadRevenueAnalytics(filters)
    ]).then(() => {
      this.loading = false;
      this.updateCharts();
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading analytics data:', error);
      this.loading = false;
    });
  }

  private getFilters(): AnalyticsFilters {
    const formValue = this.filterForm.value;
    return {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      courseType: formValue.courseType,
      source: formValue.source,
      sportId: formValue.sportId,
      onlyWeekends: formValue.onlyWeekends
    };
  }

  private async loadSummaryData(filters: AnalyticsFilters): Promise<void> {
    try {
      const response = await this.getAnalyticsSummary(filters).toPromise();
      this.summary = response.data;
    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  }

  private async loadCourseAnalytics(filters: AnalyticsFilters): Promise<void> {
    try {
      const response = await this.getCourseAnalytics(filters).toPromise();
      this.courseAnalytics = response.data;
    } catch (error) {
      console.error('Error loading course analytics:', error);
    }
  }

  private async loadRevenueAnalytics(filters: AnalyticsFilters): Promise<void> {
    try {
      const response = await this.getRevenueAnalytics(filters).toPromise();
      this.revenueAnalytics = response.data;
    } catch (error) {
      console.error('Error loading revenue analytics:', error);
    }
  }

  // API Methods
  private getAnalyticsSummary(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/summary', 1, 1, 'desc', 'id', params);
  }

  private getCourseAnalytics(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/courses', 1, 1000, 'desc', 'totalRevenue', params);
  }

  private getRevenueAnalytics(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/revenue', 1, 1000, 'asc', 'date', params);
  }

  private buildQueryParams(filters: AnalyticsFilters): string {
    let params = `&school_id=${this.user.schools[0].id}`;

    if (filters.startDate) {
      params += `&start_date=${filters.startDate}`;
    }

    if (filters.endDate) {
      params += `&end_date=${filters.endDate}`;
    }

    if (filters.courseType) {
      params += `&course_type=${filters.courseType}`;
    }

    if (filters.source) {
      params += `&source=${filters.source}`;
    }

    if (filters.sportId) {
      params += `&sport_id=${filters.sportId}`;
    }

    if (filters.onlyWeekends) {
      params += `&only_weekends=true`;
    }

    return params;
  }

  // Chart Methods
  private updateCharts(): void {
    this.updateRevenueChart();
    this.updatePaymentMethodsChart();
    this.updateCourseTypeChart();
  }

  private updateRevenueChart(): void {
    if (!this.revenueAnalytics.length) return;

    const dates = this.revenueAnalytics.map(item => item.date);
    const revenues = this.revenueAnalytics.map(item => item.revenue);
    const refunds = this.revenueAnalytics.map(item => item.refunds);
    const netRevenues = this.revenueAnalytics.map(item => item.netRevenue);

    const traces = [
      {
        x: dates,
        y: revenues,
        type: 'scatter',
        mode: 'lines+markers',
        name: this.translateService.instant('revenue'),
        line: { color: '#2E7D32' },
        fill: 'tonexty'
      },
      {
        x: dates,
        y: refunds,
        type: 'scatter',
        mode: 'lines+markers',
        name: this.translateService.instant('refunds'),
        line: { color: '#D32F2F' }
      },
      {
        x: dates,
        y: netRevenues,
        type: 'scatter',
        mode: 'lines+markers',
        name: this.translateService.instant('net_revenue'),
        line: { color: '#1976D2', width: 3 }
      }
    ];
    const expected = this.revenueAnalytics.map(item => item.expectedRevenue); // <- nuevo backend
    traces.push({
      mode: 'lines+markers',
      x: dates,
      y: expected,
      type: 'scatter',
      name: this.translateService.instant('expected'),
      line: { color: '#9E9E9E' }
    });

    const layout = {
      title: this.translateService.instant('revenue_over_time'),
      xaxis: { title: this.translateService.instant('date') },
      yaxis: { title: this.translateService.instant('amount') + ` (${this.currency})` },
      showlegend: true,
      height: 400
    };

    Plotly.newPlot('revenueChart', traces, layout, { responsive: true });
  }

  private updatePaymentMethodsChart(): void {
    if (!this.summary) return;

    // Aggregate payment methods from course analytics
    const totalPayments = this.courseAnalytics.reduce((acc, course) => {
      acc.cash += course.paymentMethods.cash;
      acc.card += course.paymentMethods.card;
      acc.online += course.paymentMethods.online;
      acc.vouchers += course.paymentMethods.vouchers;
      acc.pending += course.paymentMethods.pending;
      return acc;
    }, { cash: 0, card: 0, online: 0, vouchers: 0, pending: 0 });

    const data = [{
      values: [
        totalPayments.cash,
        totalPayments.card,
        totalPayments.online,
        totalPayments.vouchers,
        totalPayments.pending
      ],
      labels: [
        this.translateService.instant('cash'),
        this.translateService.instant('card'),
        this.translateService.instant('online'),
        this.translateService.instant('vouchers'),
        this.translateService.instant('pending')
      ],
      type: 'pie',
      marker: {
        colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']
      }
    }];

    const layout = {
      title: this.translateService.instant('payment_methods_distribution'),
      height: 400
    };

    Plotly.newPlot('paymentMethodsChart', data, layout, { responsive: true });
  }

  private updateCourseTypeChart(): void {
    if (!this.courseAnalytics.length) return;

    // Group by course type
    const courseTypeData = this.courseAnalytics.reduce((acc, course) => {
      const type = course.courseType;
      if (!acc[type]) {
        acc[type] = { revenue: 0, bookings: 0 };
      }
      acc[type].revenue += course.totalRevenue;
      acc[type].bookings += course.totalBookings;
      return acc;
    }, {} as any);

    const types = Object.keys(courseTypeData);
    const revenues = types.map(type => courseTypeData[type].revenue);
    const bookings = types.map(type => courseTypeData[type].bookings);

    const trace1 = {
      x: types.map(type => this.getCourseTypeName(parseInt(type))),
      y: revenues,
      type: 'bar',
      name: this.translateService.instant('revenue'),
      yaxis: 'y',
      marker: { color: '#2196F3' }
    };

    const trace2 = {
      x: types.map(type => this.getCourseTypeName(parseInt(type))),
      y: bookings,
      type: 'bar',
      name: this.translateService.instant('bookings'),
      yaxis: 'y2',
      marker: { color: '#4CAF50' }
    };

    const layout = {
      title: this.translateService.instant('performance_by_course_type'),
      xaxis: { title: this.translateService.instant('course_type') },
      yaxis: {
        title: this.translateService.instant('revenue') + ` (${this.currency})`,
        side: 'left'
      },
      yaxis2: {
        title: this.translateService.instant('bookings'),
        side: 'right',
        overlaying: 'y'
      },
      height: 400
    };

    Plotly.newPlot('courseTypeChart', [trace1, trace2], layout, { responsive: true });
  }

  public getCourseTypeName(type: number): string {
    switch (type) {
      case 1: return this.translateService.instant('collective');
      case 2: return this.translateService.instant('private');
      case 3: return this.translateService.instant('activity');
      default: return 'Unknown';
    }
  }

  // Event handlers
  onTabChange(tabName: string): void {
    this.activeTab = tabName;

    // Reload data when switching to a new tab
    setTimeout(() => {
      this.updateCharts();
    }, 100);
  }

  onExportData(): void {
    // Implement export functionality
    const data = {
      summary: this.summary,
      courseAnalytics: this.courseAnalytics,
      revenueAnalytics: this.revenueAnalytics,
      filters: this.getFilters(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${moment().format('YYYY-MM-DD')}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: this.currency
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  getStatusClass(value: number, threshold: number = 0): string {
    return value >= threshold ? 'text-green-600' : 'text-red-600';
  }

  getTotalByPaymentMethod(method: string): number {
    return this.courseAnalytics.reduce((total, course) => {
      return total + (course.paymentMethods[method] || 0);
    }, 0);
  }

  // Additional API methods for enhanced analytics
  getFinancialDashboard(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/financial-dashboard', 1, 1, 'desc', 'id', params);
  }

  getPendingPayments(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/pending-payments', 1, 1000, 'asc', 'urgency_level', params);
  }

  getPerformanceComparison(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/performance-comparison', 1, 1, 'desc', 'id', params);
  }

  getPaymentDetails(filters: AnalyticsFilters): Observable<any> {
    const params = this.buildQueryParams(filters);
    return this.crudService.list('/admin/analytics/payment-details', 1, 1000, 'desc', 'booking_date', params);
  }

  // Enhanced chart methods
  private updateComparisonChart(): void {
    // Load performance comparison data
    this.getPerformanceComparison(this.getFilters()).subscribe(response => {
      const data = response.data;

      const traces = [{
        x: ['Revenue', 'Bookings', 'Avg. Value'],
        y: [
          data.comparison.revenue_change_percent,
          data.comparison.bookings_change_percent,
          ((data.current_period.data.avg_booking_value - data.previous_period.data.avg_booking_value) /
            data.previous_period.data.avg_booking_value) * 100
        ],
        type: 'bar',
        marker: {
          color: ['#4CAF50', '#2196F3', '#FF9800']
        },
        text: ['%', '%', '%'],
        textposition: 'auto'
      }];

      const layout = {
        title: this.translateService.instant('period_comparison'),
        yaxis: { title: this.translateService.instant('percentage_change') },
        height: 300
      };

      Plotly.newPlot('comparisonChart', traces, layout, { responsive: true });
    });
  }

  private updatePendingPaymentsChart(): void {
    this.getPendingPayments(this.getFilters()).subscribe(response => {
      const groupedData = response.data.grouped_by_urgency;

      const data = [{
        values: [
          groupedData.overdue.length,
          groupedData.urgent.length,
          groupedData.due_soon.length,
          groupedData.normal.length
        ],
        labels: [
          this.translateService.instant('overdue'),
          this.translateService.instant('urgent'),
          this.translateService.instant('due_soon'),
          this.translateService.instant('normal')
        ],
        type: 'pie',
        marker: {
          colors: ['#F44336', '#FF9800', '#FFC107', '#4CAF50']
        }
      }];

      const layout = {
        title: this.translateService.instant('pending_payments_by_urgency'),
        height: 300
      };

      Plotly.newPlot('pendingPaymentsChart', data, layout, { responsive: true });
    });
  }

  // Method to refresh all data
  refreshAllData(): void {
    this.loadAnalyticsData();
  }

  // Method to set preset date ranges
  setDateRange(range: string): void {
    let startDate: string, endDate: string;

    switch (range) {
      case 'today':
        startDate = endDate = moment().format('YYYY-MM-DD');
        break;
      case 'yesterday':
        startDate = endDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
        break;
      case 'this_week':
        startDate = moment().startOf('week').format('YYYY-MM-DD');
        endDate = moment().endOf('week').format('YYYY-MM-DD');
        break;
      case 'last_week':
        startDate = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
        break;
      case 'this_month':
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().endOf('month').format('YYYY-MM-DD');
        break;
      case 'last_month':
        startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'this_year':
        startDate = moment().startOf('year').format('YYYY-MM-DD');
        endDate = moment().endOf('year').format('YYYY-MM-DD');
        break;
      case 'last_year':
        startDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
        break;
      default:
        return;
    }

    this.filterForm.patchValue({
      startDate,
      endDate
    });
  }

  // Export methods
  onExportToCSV(): void {
    const csvData = this.prepareCsvData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${moment().format('YYYY-MM-DD')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private prepareCsvData(): string {
    const headers = [
      'Date',
      'Course Name',
      'Course Type',
      'Revenue',
      'Bookings',
      'Average Price',
      'Completion Rate'
    ];

    const rows = this.courseAnalytics.map(course => [
      new Date().toISOString().split('T')[0],
      course.courseName,
      this.getCourseTypeName(course.courseType),
      course.totalRevenue,
      course.totalBookings,
      course.averagePrice,
      course.completionRate
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  onExportToPDF(): void {
    // Implement PDF export functionality
    // This would typically use a library like jsPDF
    console.log('PDF export functionality would be implemented here');
  }

  // Real-time updates (if needed)
  startRealTimeUpdates(): void {
    // Set up periodic updates every 5 minutes
    setInterval(() => {
      if (this.activeTab === 'overview') {
        this.loadSummaryData(this.getFilters());
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Error handling
  private handleError(error: any): void {
    console.error('Analytics error:', error);
    // Implement user-friendly error handling
    // Show toast notification or error message
  }

  // Performance optimization
  private debounceSearch = this.debounce((filters: AnalyticsFilters) => {
    this.loadAnalyticsData();
  }, 300);

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Cache management
  private cacheKey(filters: AnalyticsFilters): string {
    return JSON.stringify(filters);
  }

  private getCachedData(key: string): any {
    // Implement caching logic if needed
    return null;
  }

  private setCachedData(key: string, data: any): void {
    // Implement caching logic if needed
  }

}
