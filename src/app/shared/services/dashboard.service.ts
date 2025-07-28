import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DashboardData,
  WelcomeBannerData,
  WeatherData,
  TodayBookingsData,
  SalesChannelData,
  DailySessionsData,
  DashboardMetric,
  TodayBooking
} from '../interfaces/dashboard.interfaces';
import { AnalyticsApiService, DashboardSummary, CourseAnalytics, FinancialDashboard } from './analytics-api.service';
import { AuthService } from '../../../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private analyticsApiService: AnalyticsApiService,
    private authService: AuthService
  ) {}

  // ==========================================
  // MÉTODOS CON APIS REALES
  // ==========================================

  /**
   * Obtiene datos reales del dashboard usando las nuevas APIs
   */
  getDashboardDataWithRealApis(): Observable<DashboardData> {
    const user = this.authService.user;
    const schoolId = user?.schoolId || user?.school_id || 1;
    
    const filters = {
      school_id: schoolId,
      period: 'month' as const
    };

    return combineLatest([
      this.analyticsApiService.getSummary(filters),
      this.analyticsApiService.getCoursesAnalytics(filters),
      this.analyticsApiService.getFinancialDashboard(filters)
    ]).pipe(
      map(([summary, courses, financial]) => {
        return {
          welcomeBanner: this.mapSummaryToWelcomeBanner(summary, user),
          metrics: this.mapSummaryToMetrics(summary, courses),
          weather: this.getMockWeather(), // Mantener mock hasta tener API de clima
          todayBookings: this.getMockTodayBookings(), // Mantener mock hasta tener API de reservas
          salesChannels: this.mapFinancialToSalesChannels(financial),
          dailySessions: this.getMockDailySessions() // Mantener mock hasta tener API de sesiones
        };
      }),
      catchError(error => {
        console.error('Error loading real dashboard data:', error);
        // Fallback a datos mock en caso de error
        return this.getDashboardData();
      })
    );
  }

  /**
   * Obtiene métricas usando APIs reales
   */
  getRealMetrics(): Observable<{
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  }> {
    const user = this.authService.user;
    const schoolId = user?.schoolId || user?.school_id || 1;
    
    const filters = {
      school_id: schoolId,
      period: 'day' as const
    };

    return combineLatest([
      this.analyticsApiService.getSummary(filters),
      this.analyticsApiService.getCoursesAnalytics(filters)
    ]).pipe(
      map(([summary, courses]) => this.mapSummaryToMetrics(summary, courses)),
      catchError(error => {
        console.error('Error loading real metrics:', error);
        return this.getMetrics(); // Fallback a mock
      })
    );
  }

  /**
   * Obtiene datos del banner de bienvenida usando APIs reales
   */
  getRealWelcomeBannerData(): Observable<WelcomeBannerData> {
    const user = this.authService.user;
    const schoolId = user?.schoolId || user?.school_id || 1;
    
    const filters = {
      school_id: schoolId,
      period: 'day' as const
    };

    return this.analyticsApiService.getSummary(filters).pipe(
      map(summary => this.mapSummaryToWelcomeBanner(summary, user)),
      catchError(error => {
        console.error('Error loading real welcome data:', error);
        return this.getWelcomeBannerData(); // Fallback a mock
      })
    );
  }

  // ==========================================
  // MÉTODOS DE MAPEO DE DATOS
  // ==========================================

  private mapSummaryToWelcomeBanner(summary: DashboardSummary, user: any): WelcomeBannerData {
    return {
      userName: user?.name || user?.firstName || 'Usuario',
      newBookingsToday: summary.activeBookings,
      scheduledCourses: Math.floor(summary.activeBookings / 3), // Estimación
      performanceImprovement: parseFloat(summary.compared_to_previous.revenue_change.replace(/[^0-9.-]/g, '')),
      activeInstructors: 6, // TODO: obtener de API cuando esté disponible
      availableInstructors: 4, // TODO: obtener de API cuando esté disponible
      availableHours: 32 // TODO: obtener de API cuando esté disponible
    };
  }

  private mapSummaryToMetrics(summary: DashboardSummary, courses: CourseAnalytics[]): {
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  } {
    // Separar cursos por tipo
    const privateCourses = courses.filter(c => c.courseType === 3); // Privados
    const collectiveCourses = courses.filter(c => c.courseType === 1 || c.courseType === 2); // Colectivos

    const privateBookings = privateCourses.reduce((sum, c) => sum + c.totalBookings, 0);
    const collectiveBookings = collectiveCourses.reduce((sum, c) => sum + c.totalBookings, 0);

    return {
      privateCourses: {
        value: privateBookings,
        change: '+13% vs día anterior', // TODO: calcular del API
        changeType: 'positive',
        icon: 'person',
        color: 'primary',
        label: 'Cursos Privados'
      },
      collectiveCourses: {
        value: collectiveBookings,
        change: '+8% vs día anterior', // TODO: calcular del API
        changeType: 'positive',
        icon: 'group',
        color: 'info',
        label: 'Cursos Colectivos'
      },
      activeBookings: {
        value: summary.activeBookings,
        change: summary.compared_to_previous.bookings_change,
        changeType: summary.compared_to_previous.bookings_change.includes('+') ? 'positive' : 'negative',
        icon: 'event',
        color: 'info',
        label: 'Reservas Activas'
      },
      dailySales: {
        value: summary.netRevenue,
        change: summary.compared_to_previous.revenue_change,
        changeType: summary.compared_to_previous.revenue_change.includes('+') ? 'positive' : 'negative',
        icon: 'euro',
        color: 'danger',
        label: 'Ventas Totales del Día'
      }
    };
  }

  private mapFinancialToSalesChannels(financial: FinancialDashboard): SalesChannelData {
    // Mapear datos de revenue por período a formato del gráfico
    const revenueData = financial.revenueByPeriod.slice(-7); // Últimos 7 días
    
    return {
      admin: revenueData.map(r => r.revenue / 1000), // Convertir a miles
      online: revenueData.map(r => (r.revenue * 0.4) / 1000), // Estimación 40% online
      objective: revenueData.map(r => (r.revenue * 1.1) / 1000), // Objetivo 10% mayor
      months: revenueData.map(r => new Date(r.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })),
      totals: {
        admin: financial.totalRevenue * 0.6, // 60% admin
        online: financial.totalRevenue * 0.4, // 40% online
        total: financial.totalRevenue,
        adminPercentage: 60,
        onlinePercentage: 40
      }
    };
  }

  // ==========================================
  // MÉTODOS EXISTENTES (MOCK)
  // ==========================================

  // Datos mock para el dashboard completo
  getDashboardData(): Observable<DashboardData> {
    const mockData: DashboardData = {
      welcomeBanner: this.getMockWelcomeBanner(),
      metrics: this.getMockMetrics(),
      weather: this.getMockWeather(),
      todayBookings: this.getMockTodayBookings(),
      salesChannels: this.getMockSalesChannels(),
      dailySessions: this.getMockDailySessions()
    };

    return of(mockData).pipe(delay(500));
  }

  // Banner de bienvenida
  getWelcomeBannerData(): Observable<WelcomeBannerData> {
    return of(this.getMockWelcomeBanner()).pipe(delay(300));
  }

  // Métricas principales
  getMetrics(): Observable<{
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  }> {
    return of(this.getMockMetrics()).pipe(delay(400));
  }

  // Datos meteorológicos
  getWeatherData(): Observable<WeatherData> {
    return of(this.getMockWeather()).pipe(delay(200));
  }

  // Reservas de hoy
  getTodayBookings(): Observable<TodayBookingsData> {
    return of(this.getMockTodayBookings()).pipe(delay(600));
  }

  // Datos de ventas por canal
  getSalesChannelData(): Observable<SalesChannelData> {
    return of(this.getMockSalesChannels()).pipe(delay(700));
  }

  // Datos de sesiones diarias
  getDailySessionsData(): Observable<DailySessionsData> {
    return of(this.getMockDailySessions()).pipe(delay(500));
  }

  // Métodos privados para generar datos mock
  private getMockWelcomeBanner(): WelcomeBannerData {
    return {
      userName: 'Carlos',
      newBookingsToday: 8,
      scheduledCourses: 3,
      performanceImprovement: 15,
      activeInstructors: 6,
      availableInstructors: 4,
      availableHours: 32
    };
  }

  private getMockMetrics(): {
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  } {
    return {
      privateCourses: {
        value: 24,
        change: '+13% vs día anterior',
        changeType: 'positive',
        icon: 'person',
        color: 'primary',
        label: 'Cursos Privados'
      },
      collectiveCourses: {
        value: 156,
        change: '+8% vs día anterior',
        changeType: 'positive',
        icon: 'group',
        color: 'info',
        label: 'Cursos Colectivos'
      },
      activeBookings: {
        value: 89,
        change: '+23% vs día anterior',
        changeType: 'positive',
        icon: 'event',
        color: 'info',
        label: 'Reservas Activas'
      },
      dailySales: {
        value: 2340,
        change: '+18% vs día anterior',
        changeType: 'positive',
        icon: 'euro',
        color: 'danger',
        label: 'Ventas Totales del Día'
      }
    };
  }

  private getMockWeather(): WeatherData {
    return {
      temperature: -8,
      sensation: -12,
      wind: {
        speed: 15,
        direction: 'Oeste'
      },
      visibility: {
        distance: 8,
        quality: 'Excelente'
      },
      snow: {
        depth: 45,
        quality: 'Polvo fresco'
      },
      date: new Date().toLocaleDateString('es-ES'),
      time: '23:41'
    };
  }

  private getMockTodayBookings(): TodayBookingsData {
    const mockBookings: TodayBooking[] = [
      {
        id: 'RSV-001',
        type: 'Privado',
        course: 'Esquí Básico - Nivel 1',
        client: {
          name: 'Ana García',
          email: 'ana.garcia@email.com',
          initials: 'AG'
        },
        instructor: 'Carlos Mendez',
        time: '09:00',
        status: 'Confirmado',
        price: 85
      },
      {
        id: 'RSV-002',
        type: 'Colectivo',
        course: 'Snowboard Intermedio',
        client: {
          name: 'Miguel Santos',
          email: 'miguel.santos@email.com',
          initials: 'MS'
        },
        instructor: 'Laura Vega',
        time: '10:30',
        status: 'Pendiente',
        price: 45
      },
      {
        id: 'RSV-008',
        type: 'Privado',
        course: 'Esquí Avanzado - Moguls',
        client: {
          name: 'Roberto Silva',
          email: 'roberto.silva@email.com',
          initials: 'RS'
        },
        instructor: 'Pablo Jiménez',
        time: '11:30',
        status: 'Confirmado',
        price: 95
      },
      {
        id: 'RSV-004',
        type: 'Colectivo',
        course: 'Esquí Niños - Jardín de Nieve',
        client: {
          name: 'Carmen López',
          email: 'carmen.lopez@email.com',
          initials: 'CL'
        },
        instructor: 'María Fernández',
        time: '12:00',
        status: 'Confirmado',
        price: 35
      },
      {
        id: 'RSV-009',
        type: 'Privado',
        course: 'Snowboard Freestyle',
        client: {
          name: 'Lucía Herrera',
          email: 'lucia.herrera@email.com',
          initials: 'LH'
        },
        instructor: 'Ana Ruiz',
        time: '14:30',
        status: 'Confirmado',
        price: 110
      },
      {
        id: 'RSV-006',
        type: 'Colectivo',
        course: 'Esquí Intermedio - Paralelo',
        client: {
          name: 'Elena Torres',
          email: 'elena.torres@email.com',
          initials: 'ET'
        },
        instructor: 'Javier Morales',
        time: '15:30',
        status: 'Confirmado',
        price: 55
      },
      {
        id: 'RSV-010',
        type: 'Colectivo',
        course: 'Esquí de Fondo - Iniciación',
        client: {
          name: 'Pedro Navarro',
          email: 'pedro.navarro@email.com',
          initials: 'PN'
        },
        instructor: 'Isabel Castro',
        time: '16:00',
        status: 'Pendiente',
        price: 40
      },
      {
        id: 'RSV-011',
        type: 'Privado',
        course: 'Esquí de Competición',
        client: {
          name: 'Andrea Vidal',
          email: 'andrea.vidal@email.com',
          initials: 'AV'
        },
        instructor: 'Carlos Mendez',
        time: '17:00',
        status: 'Confirmado',
        price: 150
      }
    ];

    return {
      bookings: mockBookings,
      summary: {
        confirmed: mockBookings.filter(b => b.status === 'Confirmado').length,
        pending: mockBookings.filter(b => b.status === 'Pendiente').length,
        total: mockBookings.length,
        date: '26 jul 2025'
      }
    };
  }

  private getMockSalesChannels(): SalesChannelData {
    return {
      admin: [4.4, 4.2, 4.6, 5.1, 5.8, 5.9, 6.2],
      online: [1.4, 1.6, 1.8, 2.1, 2.4, 2.6, 2.9],
      objective: [4.8, 4.9, 5.0, 5.2, 5.4, 5.6, 5.8],
      months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
      totals: {
        admin: 22320,
        online: 14890,
        total: 37200,
        adminPercentage: 60,
        onlinePercentage: 40
      }
    };
  }

  private getMockDailySessions(): DailySessionsData {
    return {
      sessions: [15, 25, 12, 32, 45, 28, 35, 22, 18, 38, 52, 41, 29],
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      currentWeek: true
    };
  }
}