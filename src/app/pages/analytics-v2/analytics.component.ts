import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import moment from 'moment';
import Plotly from 'plotly.js-dist-min';

import { ApiCrudService } from '../../../service/crud.service';

// ==================== INTERFACES ====================

interface SeasonDashboardData {
  season_info: {
    season_name: string;
    date_range: {
      start: string;
      end: string;
      total_days: number;
    };
    total_bookings: number;
    booking_classification: {
      total_bookings: number;
      production_count: number;
      test_count: number;
      cancelled_count: number;
      production_revenue: number;
      test_revenue: number;
      cancelled_revenue: number;
    };
  };
  executive_kpis: {
    total_production_bookings: number;
    total_clients: number;
    total_participants: number;
    revenue_expected: number;
    revenue_received: number;
    revenue_pending: number;
    collection_efficiency: number;
    consistency_rate: number;
    average_booking_value: number;
  };
  booking_sources: {
    total_bookings: number;
    source_breakdown: Array<{
      source: string;
      bookings: number;
      percentage: number;
      unique_clients: number;
      revenue: number;
      avg_booking_value: number;
      consistency_rate: number;
    }>;
  };
  payment_methods: {
    total_payments: number;
    total_revenue: number;
    methods: Array<{
      method: string;
      display_name: string;
      count: number;
      percentage: number;
      revenue: number;
      revenue_percentage: number;
      avg_payment_amount: number;
    }>;
    online_vs_offline: {
      online: {
        revenue: number;
        count: number;
        revenue_percentage: number;
        count_percentage: number;
      };
      offline: {
        revenue: number;
        count: number;
        revenue_percentage: number;
        count_percentage: number;
      };
    };
  };
  booking_status_analysis: {
    [key: string]: {
      count: number;
      percentage: number;
      expected_revenue: number;
      received_revenue: number;
      pending_revenue: number;
      collection_efficiency: number;
      issues: number;
    };
  };
  financial_summary: {
    revenue_breakdown: {
      total_expected: number;
      total_received: number;
      total_pending: number;
      total_refunded: number;
    };
    consistency_metrics: {
      consistent_bookings: number;
      inconsistent_bookings: number;
      consistency_rate: number;
      major_discrepancies: number;
    };
    voucher_usage: {
      total_vouchers_used: number;
      total_voucher_amount: number;
      unique_vouchers: number;
    };
  };
  courses: Array<{
    id: number;
    name: string;
    type: number;
    sport: string;
    revenue: number;
    participants: number;
    bookings: number;
    average_price: number;
    payment_methods: any;
    status_breakdown: any;
    source_breakdown: any;
  }>;
  critical_issues: {
    [key: string]: {
      count: number;
      items: Array<any>;
    };
  };
  executive_alerts: Array<{
    level: string;
    type: string;
    title: string;
    description: string;
    impact: string;
    action_required: boolean;
  }>;
  priority_recommendations: Array<{
    priority: string;
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
    timeline: string;
    actions: string[];
    expected_benefit: string;
  }>;
  trend_analysis: {
    monthly_breakdown: Array<{
      month: string;
      bookings: number;
      revenue: number;
      unique_clients: number;
      consistency_rate: number;
      avg_booking_value: number;
    }>;
    booking_velocity: {
      recent_production_bookings: number;
      bookings_per_week: number;
      trend_direction: string;
      quality_trend: string;
    };
  };
  performance_metrics: {
    execution_time_ms: number;
    total_bookings_analyzed: number;
    production_bookings_count: number;
    test_bookings_excluded: number;
    cancelled_bookings_count: number;
  };
}

interface AnalyticsFilters {
  startDate: string | null;
  endDate: string | null;
  presetRange: string | null;
  courseType: number[] | null;
  source: string[] | null;
  paymentMethod: string[] | null;
  sportId: number[] | null;
  onlyWeekends: boolean;
  onlyPaidBookings: boolean;
  includeRefunds: boolean;
  includeTestDetection: boolean;
  includePayrexxAnalysis: boolean;
  optimizationLevel: string;
}

// ==================== COMPONENT ====================

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  animations: [
    trigger('slideDown', [
      state('in', style({height: '*'})),
      transition(':enter', [
        style({height: 0, opacity: 0}),
        animate('300ms ease-in-out', style({height: '*', opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({height: 0, opacity: 0}))
      ])
    ])
  ]
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {

  // ==================== VIEW CHILDREN ====================
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef;
  @ViewChild('courseTypeRevenueChart', { static: false }) courseTypeRevenueChartRef!: ElementRef;
  @ViewChild('paymentMethodsChart', { static: false }) paymentMethodsChartRef!: ElementRef;
  @ViewChild('paymentTrendsChart', { static: false }) paymentTrendsChartRef!: ElementRef;
  @ViewChild('topCoursesChart', { static: false }) topCoursesChartRef!: ElementRef;
  @ViewChild('completionRatesChart', { static: false }) completionRatesChartRef!: ElementRef;
  @ViewChild('sourcesChart', { static: false }) sourcesChartRef!: ElementRef;
  @ViewChild('sourcePerformanceChart', { static: false }) sourcePerformanceChartRef!: ElementRef;
  @ViewChild('comparisonChart', { static: false }) comparisonChartRef!: ElementRef;

  // ==================== FORM CONTROLS ====================
  filterForm: FormGroup;

  // ==================== DATA PROPERTIES ====================
  dashboardData: SeasonDashboardData | null = null;
  revenueTableData = new MatTableDataSource<any>([]);
  coursesTableData = new MatTableDataSource<any>([]);

  // ==================== UI STATE ====================
  loading = false;
  activeTab = 'revenue'; // ← AÑADIR ESTA LÍNEA
  activeTabIndex = 0;
  showAdvancedFilters = false;

  // ==================== USER DATA ====================
  user: any;
  currency = 'CHF';
  allSports: any[] = [];

  // ==================== TABLE COLUMNS ====================
  revenueDisplayedColumns: string[] = ['month', 'revenue', 'bookings', 'averageValue', 'clients', 'consistencyRate'];
  coursesDisplayedColumns: string[] = ['courseName', 'courseType', 'totalRevenue', 'totalBookings', 'averagePrice', 'participants', 'actions'];

  // ==================== CHART COLORS ====================
  chartColors = {
    primary: '#3A57A7',
    secondary: '#FCB859',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#2196F3',
    gradient: ['#3A57A7', '#FCB859', '#4CAF50', '#FF9800', '#F44336', '#2196F3']
  };

  // ==================== DESTROY SUBJECT ====================
  private destroy$ = new Subject<void>();

  // ==================== TABS CONFIGURATION (ACTUALIZADO) ====================
  tabs = [
    { id: 'revenue', label: 'Análisis de Ingresos', icon: 'monetization_on' },
    { id: 'payments', label: 'Métodos de Pago', icon: 'payment' },
    { id: 'courses', label: 'Análisis de Cursos', icon: 'school' },
    { id: 'sources', label: 'Fuentes de Reserva', icon: 'source' },
    { id: 'monitors', label: 'Monitores', icon: 'person' }, // ← NUEVA
    { id: 'comparative', label: 'Análisis Comparativo', icon: 'compare_arrows' },
    { id: 'alerts', label: 'Alertas y Recomendaciones', icon: 'warning' }
  ];

  // ==================== CONSTRUCTOR ====================
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private translateService: TranslateService,
    private apiService: ApiCrudService
  ) {
    this.initializeForm();
    this.loadUserData();
    this.loadMasterData();

    this.activeTab = this.tabs[0].id; // Inicializar con primera pestaña
  }

  // ==================== LIFECYCLE METHODS ====================

  ngOnInit(): void {
    this.setupFilterSubscriptions();
    this.loadAnalyticsData();
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán cuando los datos estén disponibles
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    const today = moment();
    const currentMonth = today.month(); // 0 = enero, 10 = noviembre

    let startDate: string;
    let endDate: string;

    if (currentMonth >= 5 && currentMonth <= 9) {
      // Junio a Octubre → temporada pasada fue Nov (año anterior) - Mayo (este año)
      startDate = moment().subtract(1, 'year').month(10).startOf('month').format('YYYY-MM-DD');
      endDate = moment().month(4).endOf('month').format('YYYY-MM-DD');
    } else {
      // Noviembre a Mayo → temporada pasada fue Nov (2 años atrás) - Mayo (año pasado)
      startDate = moment().subtract(2, 'year').month(10).startOf('month').format('YYYY-MM-DD');
      endDate = moment().subtract(1, 'year').month(4).endOf('month').format('YYYY-MM-DD');
    }

    this.filterForm = this.fb.group({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
      presetRange: new FormControl(''),
      courseType: new FormControl([]),
      source: new FormControl([]),
      paymentMethod: new FormControl([]),
      sportId: new FormControl([]),
      onlyWeekends: new FormControl(false),
      onlyPaidBookings: new FormControl(false),
      includeRefunds: new FormControl(true),
      includeTestDetection: new FormControl(true),
      includePayrexxAnalysis: new FormControl(false),
      optimizationLevel: new FormControl('balanced')
    });
  }

  private loadUserData(): void {
    const userStr = localStorage.getItem('boukiiUser');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.currency = this.user?.school?.currency || 'CHF';
    }
  }

  private loadMasterData(): void {
    // Cargar deportes
    this.apiService.get('/sports').subscribe({
      next: (response) => {
        this.allSports = response.data || [];
      },
      error: (error) => console.error('Error loading sports:', error)
    });
  }

  private setupFilterSubscriptions(): void {
    // Escuchar cambios en los filtros con debounce
    this.filterForm.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.loading) {
        this.loadAnalyticsData();
      }
    });
  }

  // ==================== DATA LOADING ====================

  public loadAnalyticsData(): void {
    this.loading = true;
    const filters = this.buildFiltersObject();

    console.log('🔍 Loading analytics data with filters:', filters);

    // Usar principalmente el endpoint season-dashboard
    this.apiService.get('/admin/finance/season-dashboard', [], filters).subscribe({
      next: (response) => {
        console.log('✅ Season dashboard data received:', response);
        this.processSeasonDashboardData(response.data);
        this.loading = false;
        this.cdr.detectChanges();

        // Crear gráficos después de que los datos estén listos
        setTimeout(() => this.createAllCharts(), 100);
      },
      error: (error) => {
        console.error('❌ Error loading analytics data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildFiltersObject(): any {
    const formValue = this.filterForm.value;

    const filters: any = {
      start_date: formValue.startDate,
      end_date: formValue.endDate,
      include_test_detection: formValue.includeTestDetection,
      include_payrexx_analysis: formValue.includePayrexxAnalysis,
      optimization_level: formValue.optimizationLevel
    };

    // Filtros opcionales
    if (formValue.courseType?.length) {
      filters.course_type = formValue.courseType.join(',');
    }
    if (formValue.source?.length) {
      filters.source = formValue.source.join(',');
    }
    if (formValue.paymentMethod?.length) {
      filters.payment_method = formValue.paymentMethod.join(',');
    }
    if (formValue.sportId?.length) {
      filters.sport_id = formValue.sportId.join(',');
    }
    if (formValue.onlyWeekends) {
      filters.only_weekends = true;
    }
    if (formValue.onlyPaidBookings) {
      filters.only_paid = true;
    }
    if (!formValue.includeRefunds) {
      filters.exclude_refunds = true;
    }

    return filters;
  }

  private processSeasonDashboardData(data: SeasonDashboardData): void {
    console.log('📊 Processing season dashboard data:', data);

    this.dashboardData = data;

    // Actualizar datos de las tablas
    this.updateTableData();

    console.log('✅ Dashboard data processed successfully');
  }

  private updateTableData(): void {
    if (!this.dashboardData) return;

    // Tabla de revenue (usar trend_analysis.monthly_breakdown)
    this.revenueTableData.data = this.dashboardData.trend_analysis?.monthly_breakdown || [];

    // Tabla de cursos
    this.coursesTableData.data = this.dashboardData.courses || [];

    console.log('📋 Tables updated:', {
      revenueRows: this.revenueTableData.data.length,
      coursesRows: this.coursesTableData.data.length
    });
  }

  // ==================== CHART CREATION ====================

  private createAllCharts(): void {
    if (!this.dashboardData) return;

    try {
      this.createRevenueChart();
      this.createCourseTypeRevenueChart();
      this.createPaymentMethodsChart();
      this.createPaymentTrendsChart();
      this.createTopCoursesChart();
      this.createCompletionRatesChart();
      this.createSourcesChart();
      this.createSourcePerformanceChart();
      this.createComparisonChart();
    } catch (error) {
      console.error('❌ Error creating charts:', error);
    }
  }

  private createRevenueChart(): void {
    if (!this.revenueChartRef?.nativeElement || !this.dashboardData) return;

    const data = this.dashboardData.trend_analysis?.monthly_breakdown || [];

    const trace = {
      x: data.map(d => d.month),
      y: data.map(d => d.revenue),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Revenue',
      line: { color: this.chartColors.primary, width: 3 },
      marker: { color: this.chartColors.primary, size: 6 }
    };

    const layout = {
      title: false,
      xaxis: { title: 'Month' },
      yaxis: { title: `Revenue (${this.currency})` },
      margin: { l: 60, r: 20, t: 20, b: 40 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.revenueChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createCourseTypeRevenueChart(): void {
    if (!this.courseTypeRevenueChartRef?.nativeElement || !this.dashboardData) return;

    const courses = this.dashboardData.courses || [];

    // Agrupar por tipo de curso
    const typeRevenue = courses.reduce((acc, course) => {
      const typeName = this.getCourseTypeName(course.type);
      acc[typeName] = (acc[typeName] || 0) + course.revenue;
      return acc;
    }, {} as { [key: string]: number });

    const trace = {
      values: Object.values(typeRevenue),
      labels: Object.keys(typeRevenue),
      type: 'pie',
      marker: { colors: this.chartColors.gradient }
    };

    const layout = {
      title: false,
      margin: { l: 20, r: 20, t: 20, b: 20 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.courseTypeRevenueChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createPaymentMethodsChart(): void {
    if (!this.paymentMethodsChartRef?.nativeElement || !this.dashboardData) return;

    const methods = this.dashboardData.payment_methods?.methods || [];

    const trace = {
      values: methods.map(m => m.revenue),
      labels: methods.map(m => m.display_name),
      type: 'pie',
      marker: { colors: this.chartColors.gradient }
    };

    const layout = {
      title: false,
      margin: { l: 20, r: 20, t: 20, b: 20 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.paymentMethodsChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createPaymentTrendsChart(): void {
    if (!this.paymentTrendsChartRef?.nativeElement || !this.dashboardData) return;

    const onlineVsOffline = this.dashboardData.payment_methods?.online_vs_offline;

    if (!onlineVsOffline) return;

    const trace = {
      x: ['Online', 'Offline'],
      y: [onlineVsOffline.online.revenue, onlineVsOffline.offline.revenue],
      type: 'bar',
      marker: { color: [this.chartColors.info, this.chartColors.secondary] }
    };

    const layout = {
      title: false,
      xaxis: { title: 'Payment Type' },
      yaxis: { title: `Revenue (${this.currency})` },
      margin: { l: 60, r: 20, t: 20, b: 40 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.paymentTrendsChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createTopCoursesChart(): void {
    if (!this.topCoursesChartRef?.nativeElement || !this.dashboardData) return;

    const courses = this.dashboardData.courses || [];
    const topCourses = courses
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const trace = {
      x: topCourses.map(c => c.revenue),
      y: topCourses.map(c => c.name),
      type: 'bar',
      orientation: 'h',
      marker: { color: this.chartColors.success }
    };

    const layout = {
      title: false,
      xaxis: { title: `Revenue (${this.currency})` },
      margin: { l: 150, r: 20, t: 20, b: 40 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.topCoursesChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createCompletionRatesChart(): void {
    if (!this.completionRatesChartRef?.nativeElement || !this.dashboardData) return;

    // Para completion rates, podríamos usar los status_breakdown de los cursos
    const courses = this.dashboardData.courses?.slice(0, 10) || [];

    const trace = {
      x: courses.map(c => c.name),
      y: courses.map(c => {
        const statusBreakdown = c.status_breakdown || {};
        const total = Number(Object.values(statusBreakdown).reduce(
          (sum: number, count: unknown) => sum + Number(count ?? 0),
          0
        ));
        const completed = Number(statusBreakdown[1] ?? 0); // 1 = activa
        return total > 0 ? (completed / total) * 100 : 0;
      }),
      type: 'bar',
      marker: { color: this.chartColors.info }
    };

    const layout = {
      title: false,
      xaxis: { title: 'Courses' },
      yaxis: { title: 'Completion Rate (%)' },
      margin: { l: 60, r: 20, t: 20, b: 100 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.completionRatesChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createSourcesChart(): void {
    if (!this.sourcesChartRef?.nativeElement || !this.dashboardData) return;

    const sources = this.dashboardData.booking_sources?.source_breakdown || [];

    const trace = {
      values: sources.map(s => s.revenue),
      labels: sources.map(s => s.source),
      type: 'pie',
      marker: { colors: this.chartColors.gradient }
    };

    const layout = {
      title: false,
      margin: { l: 20, r: 20, t: 20, b: 20 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.sourcesChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createSourcePerformanceChart(): void {
    if (!this.sourcePerformanceChartRef?.nativeElement || !this.dashboardData) return;

    const sources = this.dashboardData.booking_sources?.source_breakdown || [];

    const trace = {
      x: sources.map(s => s.source),
      y: sources.map(s => s.consistency_rate),
      type: 'bar',
      marker: { color: this.chartColors.warning }
    };

    const layout = {
      title: false,
      xaxis: { title: 'Source' },
      yaxis: { title: 'Consistency Rate (%)' },
      margin: { l: 60, r: 20, t: 20, b: 40 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.sourcePerformanceChartRef.nativeElement, [trace], layout, { responsive: true });
  }

  private createComparisonChart(): void {
    if (!this.comparisonChartRef?.nativeElement || !this.dashboardData) return;

    const kpis = this.dashboardData.executive_kpis;
    const classification = this.dashboardData.season_info.booking_classification;

    const trace1 = {
      x: ['Production', 'Test', 'Cancelled'],
      y: [classification.production_count, classification.test_count, classification.cancelled_count],
      name: 'Bookings Count',
      type: 'bar',
      marker: { color: this.chartColors.primary }
    };

    const trace2 = {
      x: ['Production', 'Test', 'Cancelled'],
      y: [classification.production_revenue, classification.test_revenue, classification.cancelled_revenue],
      name: 'Revenue',
      type: 'bar',
      yaxis: 'y2',
      marker: { color: this.chartColors.secondary }
    };

    const layout = {
      title: false,
      xaxis: { title: 'Booking Type' },
      yaxis: { title: 'Count', side: 'left' },
      yaxis2: { title: 'Revenue', side: 'right', overlaying: 'y' },
      margin: { l: 60, r: 60, t: 20, b: 40 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot(this.comparisonChartRef.nativeElement, [trace1, trace2], layout, { responsive: true });
  }

  // ==================== EVENT HANDLERS ====================

  // ==================== TAB MANAGEMENT (ACTUALIZADO) ====================

  onTabChange(event: MatTabChangeEvent): void {
    this.activeTabIndex = event.index;
    this.activeTab = this.tabs[event.index].id; // ← ESTO YA ESTABA

    // Cargar datos específicos de la pestaña
    switch (this.activeTab) {
      case 'revenue':
        // Ya se carga con loadAnalyticsData()
        console.log('Revenue tab selected');
        break;
      case 'payments':
        // Ya se carga con loadAnalyticsData()
        console.log('Payments tab selected');
        break;
      case 'courses':
        // Ya se carga con loadAnalyticsData()
        console.log('Courses tab selected');
        break;
      case 'sources':
        // Ya se carga con loadAnalyticsData()
        console.log('Sources tab selected');
        break;
      case 'comparative':
        // Ya se carga con loadAnalyticsData()
        console.log('Comparative tab selected');
        break;
      case 'alerts':
        // Ya se carga con loadAnalyticsData()
        console.log('Alerts tab selected');
        break;
      case 'monitors': // ← NUEVO CASE PARA MONITORES
        console.log('Monitors tab selected');
        // El componente MonitorsLegacy maneja su propia carga
        break;
      default:
        console.log('Default tab selected:', this.activeTab);
        break;
    }

    // Los gráficos se crean automáticamente con createAllCharts()
    // No necesitamos createTabSpecificCharts() porque no está implementado
  }

  public onPresetRangeChange(event: any): void {
    const value = event.value;
    if (!value) return;

    let startDate: moment.Moment;
    let endDate: moment.Moment = moment();

    switch (value) {
      case 'today':
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'yesterday':
        startDate = moment().subtract(1, 'day').startOf('day');
        endDate = moment().subtract(1, 'day').endOf('day');
        break;
      case 'this_week':
        startDate = moment().startOf('week');
        break;
      case 'last_week':
        startDate = moment().subtract(1, 'week').startOf('week');
        endDate = moment().subtract(1, 'week').endOf('week');
        break;
      case 'this_month':
        startDate = moment().startOf('month');
        break;
      case 'last_month':
        startDate = moment().subtract(1, 'month').startOf('month');
        endDate = moment().subtract(1, 'month').endOf('month');
        break;
      case 'this_quarter':
        startDate = moment().startOf('quarter');
        break;
      case 'last_quarter':
        startDate = moment().subtract(1, 'quarter').startOf('quarter');
        endDate = moment().subtract(1, 'quarter').endOf('quarter');
        break;
      case 'this_year':
        startDate = moment().startOf('year');
        break;
      case 'last_year':
        startDate = moment().subtract(1, 'year').startOf('year');
        endDate = moment().subtract(1, 'year').endOf('year');
        break;
      default:
        return;
    }

    this.filterForm.patchValue({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    });
  }

  public applyFilters(): void {
    this.loadAnalyticsData();
  }

  public refreshData(): void {
    this.loadAnalyticsData();
  }

  public toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  public onExportData(): void {
    if (!this.dashboardData) return;

    const filters = this.buildFiltersObject();
    const exportFilters = {
      ...filters,
      format: 'csv',
      sections: ['executive_summary', 'financial_kpis', 'booking_analysis', 'critical_issues']
    };

    this.apiService.get('/admin/finance/season-dashboard/export', [], exportFilters).subscribe({
      next: (response) => {
        console.log('✅ Export successful:', response);
        if (response.data?.download_url) {
          window.open(response.data.download_url, '_blank');
        }
      },
      error: (error) => console.error('❌ Export error:', error)
    });
  }

  public filterCourses(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.coursesTableData.filter = filterValue.trim().toLowerCase();
  }

  public viewCourseDetails(course: any): void {
    this.router.navigate(['/admin/courses', course.id]);
  }

  public exportCourseData(course: any): void {
    const filters = { ...this.buildFiltersObject(), course_id: course.id };
    this.apiService.get('/admin/finance/season-dashboard', [], filters).subscribe({
      next: (response) => {
        console.log('✅ Course export successful:', response);
      },
      error: (error) => console.error('❌ Course export error:', error)
    });
  }

  // ==================== GETTERS FOR TEMPLATE ====================

  get analyticsData() {
    if (!this.dashboardData) return null;

    const kpis = this.dashboardData.executive_kpis;
    const classification = this.dashboardData.season_info.booking_classification;

    return {
      totalRevenue: kpis.revenue_expected,
      totalBookings: kpis.total_production_bookings,
      totalParticipants: kpis.total_participants,
      averageBookingValue: kpis.average_booking_value,
      collectionEfficiency: kpis.collection_efficiency,
      pendingRevenue: kpis.revenue_pending,
      paymentMethods: this.dashboardData.payment_methods?.methods || [],
      bookingSources: this.dashboardData.booking_sources?.source_breakdown || [],
      courseAnalytics: this.dashboardData.courses || [],
      revenueOverTime: this.dashboardData.trend_analysis?.monthly_breakdown || []
    };
  }

  // ==================== UTILITY METHODS ====================

  public getTrend(current: number, previous?: number): 'up' | 'down' | 'stable' {
    if (!previous || previous === 0) return 'stable';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }

  public getTrendValue(current: number, previous?: number): number {
    if (!previous || previous === 0) return 0;
    return Math.abs(((current - previous) / previous) * 100);
  }

  public getCourseTypeName(type: number): string {
    switch (type) {
      case 1: return 'collective';
      case 2: return 'private';
      case 3: return 'activity';
      default: return 'unknown';
    }
  }

  public getComparisonClass(current: number, previous?: number): string {
    const trend = this.getTrend(current, previous);
    return trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral';
  }

  public getComparisonValue(current: number, previous?: number): string {
    if (!previous || previous === 0) return 'N/A';
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }
}
