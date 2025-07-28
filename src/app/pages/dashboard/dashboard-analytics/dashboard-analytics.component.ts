import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

// Servicios
import { DashboardService } from 'src/app/shared/services/dashboard.service';

// Interfaces
import {
  WelcomeBannerData,
  WeatherData,
  TodayBookingsData,
  MetricCardConfig,
  TodayBooking,
  SalesChannelData,
  DailySessionsData
} from 'src/app/shared/interfaces/dashboard.interfaces';

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss']
})
export class DashboardAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos para los componentes
  welcomeData?: WelcomeBannerData;
  weatherData?: WeatherData;
  todayBookingsData?: TodayBookingsData;

  // Configuraciones para las métricas
  privateCourseMetric: MetricCardConfig = {
    title: 'Cursos Privados',
    value: 0,
    change: '',
    changeType: 'neutral',
    icon: 'person',
    color: 'primary'
  };

  collectiveCourseMetric: MetricCardConfig = {
    title: 'Cursos Colectivos',
    value: 0,
    change: '',
    changeType: 'neutral',
    icon: 'group',
    color: 'info'
  };

  activeBookingsMetric: MetricCardConfig = {
    title: 'Reservas Activas',
    value: 0,
    change: '',
    changeType: 'neutral',
    icon: 'event',
    color: 'info'
  };

  dailySalesMetric: MetricCardConfig = {
    title: 'Ventas del Día',
    value: 0,
    change: '',
    changeType: 'neutral',
    icon: 'euro',
    color: 'danger'
  };

  // Datos y configuraciones para gráficos
  salesChannelSeries: any[] = [];
  salesChannelOptions: any = {};
  dailySessionsSeries: any[] = [];
  dailySessionsOptions: any = {};

  constructor(private dashboardService: DashboardService) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============= DATA LOADING =============

  private loadDashboardData(): void {
    // Decidir si usar APIs reales o datos mock
    const useRealApis = true; // Cambiar a true para usar APIs reales

    if (useRealApis) {
      this.loadRealDashboardData();
    } else {
      this.loadMockDashboardData();
    }
  }

  private loadRealDashboardData(): void {
    console.log('Cargando datos del dashboard con APIs reales...');

    // Cargar datos del banner de bienvenida con API real
    this.dashboardService.getRealWelcomeBannerData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.welcomeData = data;
          console.log('Welcome data loaded:', data);
        },
        error: error => {
          console.error('Error loading welcome data:', error);
          // Fallback a datos mock
          this.dashboardService.getWelcomeBannerData()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => this.welcomeData = data);
        }
      });

    // Cargar métricas con API real
    this.dashboardService.getRealMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: metrics => {
          this.updateMetrics(metrics);
          console.log('Real metrics loaded:', metrics);
        },
        error: error => {
          console.error('Error loading real metrics:', error);
          // Fallback a datos mock
          this.dashboardService.getMetrics()
            .pipe(takeUntil(this.destroy$))
            .subscribe(metrics => this.updateMetrics(metrics));
        }
      });

    // Cargar dashboard completo con APIs reales (para gráficos)
    this.dashboardService.getDashboardDataWithRealApis()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: dashboardData => {
          // Actualizar gráficos con datos reales
          this.updateSalesChannelChart(dashboardData.salesChannels);
          this.updateDailySessionsChart(dashboardData.dailySessions);
          console.log('Real dashboard data loaded:', dashboardData);
        },
        error: error => {
          console.error('Error loading real dashboard data:', error);
          // Fallback a datos mock para gráficos
          this.loadMockChartsData();
        }
      });

    // Mantener datos mock para componentes que aún no tienen API
    this.dashboardService.getWeatherData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.weatherData = data;
      });

    this.dashboardService.getTodayBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.todayBookingsData = data;
      });
  }

  private loadMockDashboardData(): void {
    console.log('Cargando datos del dashboard con datos mock...');

    // Cargar datos del banner de bienvenida
    this.dashboardService.getWelcomeBannerData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.welcomeData = data;
      });

    // Cargar métricas
    this.dashboardService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.updateMetrics(metrics);
      });

    // Cargar datos meteorológicos
    this.dashboardService.getWeatherData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.weatherData = data;
      });

    // Cargar reservas de hoy
    this.dashboardService.getTodayBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.todayBookingsData = data;
      });

    // Cargar datos de ventas por canal
    this.dashboardService.getSalesChannelData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateSalesChannelChart(data);
      });

    // Cargar datos de sesiones diarias
    this.dashboardService.getDailySessionsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateDailySessionsChart(data);
      });
  }

  private loadMockChartsData(): void {
    // Cargar datos de ventas por canal
    this.dashboardService.getSalesChannelData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateSalesChannelChart(data);
      });

    // Cargar datos de sesiones diarias
    this.dashboardService.getDailySessionsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateDailySessionsChart(data);
      });
  }

  // ============= METRIC UPDATES =============

  private updateMetrics(metrics: any): void {
    this.privateCourseMetric = {
      title: 'Cursos Privados',
      value: metrics.privateCourses.value,
      change: metrics.privateCourses.change,
      changeType: metrics.privateCourses.changeType,
      icon: 'person',
      color: 'primary'
    };

    this.collectiveCourseMetric = {
      title: 'Cursos Colectivos',
      value: metrics.collectiveCourses.value,
      change: metrics.collectiveCourses.change,
      changeType: metrics.collectiveCourses.changeType,
      icon: 'group',
      color: 'info'
    };

    this.activeBookingsMetric = {
      title: 'Reservas Activas',
      value: metrics.activeBookings.value,
      change: metrics.activeBookings.change,
      changeType: metrics.activeBookings.changeType,
      icon: 'event',
      color: 'info'
    };

    this.dailySalesMetric = {
      title: 'Ventas del Día',
      value: `€${metrics.dailySales.value}`,
      change: metrics.dailySales.change,
      changeType: metrics.dailySales.changeType,
      icon: 'euro',
      color: 'danger'
    };
  }

  // ============= CHART CONFIGURATIONS =============

  private initializeChartOptions(): void {
    // Configuración del gráfico de ventas por canal
    this.salesChannelOptions = {
      chart: {
        type: 'line',
        height: 300,
        toolbar: {
          show: false
        }
      },
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      colors: ['#ef4444', '#3b82f6', '#10b981'],
      markers: {
        size: 6,
        hover: {
          size: 8
        }
      },
      xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']
      },
      yaxis: {
        title: {
          text: 'Ventas (€k)'
        }
      },
      legend: {
        position: 'top'
      },
      grid: {
        borderColor: '#e5e7eb'
      }
    };

    // Configuración del gráfico de sesiones diarias
    this.dailySessionsOptions = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        }
      },
      colors: ['#10b981'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      },
      yaxis: {
        title: {
          text: 'Sesiones'
        }
      },
      grid: {
        borderColor: '#e5e7eb'
      }
    };
  }

  private updateSalesChannelChart(data: SalesChannelData): void {
    this.salesChannelSeries = [
      {
        name: 'Objetivo',
        data: data.objective
      },
      {
        name: 'Ventas Admin',
        data: data.admin
      },
      {
        name: 'Ventas Online',
        data: data.online
      }
    ];

    // Actualizar categorías
    this.salesChannelOptions = {
      ...this.salesChannelOptions,
      xaxis: {
        categories: data.months
      }
    };
  }

  private updateDailySessionsChart(data: DailySessionsData): void {
    this.dailySessionsSeries = [
      {
        name: 'Sesiones',
        data: data.sessions
      }
    ];

    // Actualizar categorías
    this.dailySessionsOptions = {
      ...this.dailySessionsOptions,
      xaxis: {
        categories: data.days
      }
    };
  }

  // ============= EVENT HANDLERS =============

  onViewBooking(booking: TodayBooking): void {
    console.log('Ver reserva:', booking);
    // Implementar navegación o modal de detalles
  }

  onEditBooking(booking: TodayBooking): void {
    console.log('Editar reserva:', booking);
    // Implementar navegación a edición
  }

  onCancelBooking(booking: TodayBooking): void {
    console.log('Cancelar reserva:', booking);
    // Implementar confirmación y cancelación
  }

  onCreateBooking(): void {
    console.log('Crear nueva reserva');
    // Implementar navegación a creación
  }

  onOpenFullAgenda(): void {
    console.log('Abrir agenda completa');
    // Implementar navegación al timeline/agenda
  }
}