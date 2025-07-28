import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {ApiService} from '../../../service/api.service';

// Interfaces para las APIs
export interface DashboardSummary {
  totalPaid: number;
  activeBookings: number;
  withInsurance: number;
  withVoucher: number;
  totalRefunds: number;
  netRevenue: number;
  compared_to_previous: {
    revenue_change: string;
    bookings_change: string;
  };
}

export interface CourseAnalytics {
  courseId: number;
  courseName: string;
  courseType: number;
  totalRevenue: number;
  totalBookings: number;
  averagePrice: number;
  completionRate: number;
  paymentMethods: {
    cash: number;
    card: number;
    online: number;
    vouchers: number;
    pending: number;
  };
}

export interface FinancialDashboard {
  totalRevenue: number;
  totalBookings: number;
  averageOrderValue: number;
  conversionRate: number;
  topCourses: CourseAnalytics[];
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

export interface DashboardFilters {
  school_id: number;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  start_date?: string;
  end_date?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // ==========================================
  // MÉTODOS PRINCIPALES DEL DASHBOARD
  // ==========================================

  /**
   * Obtiene el resumen general del dashboard
   */
  getSummary(filters: Partial<DashboardFilters>): Observable<DashboardSummary> {
    // Si no usamos servicios reales, devolver datos mock
    if (!environment.useRealServices) {
      return this.getMockSummary();
    }

    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/v3/admin/dashboard/summary`, { params, headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al obtener resumen');
          }
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtiene analytics de cursos
   */
  getCoursesAnalytics(filters: Partial<DashboardFilters>): Observable<CourseAnalytics[]> {
    // Si no usamos servicios reales, devolver datos mock
    if (!environment.useRealServices) {
      return this.getMockCoursesAnalytics();
    }

    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<CourseAnalytics[]>>(`${this.baseUrl}/v3/admin/dashboard/courses`, { params, headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al obtener analytics de cursos');
          }
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtiene el dashboard financiero completo
   */
  getFinancialDashboard(filters: Partial<DashboardFilters>): Observable<FinancialDashboard> {
    // Si no usamos servicios reales, devolver datos mock
    if (!environment.useRealServices) {
      return this.getMockFinancialDashboard();
    }

    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<FinancialDashboard>>(`${this.baseUrl}/v3/admin/dashboard/financial-dashboard`, { params, headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al obtener dashboard financiero');
          }
          return response.data;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // ==========================================
  // MÉTODOS DE EXPORTACIÓN
  // ==========================================

  /**
   * Exporta datos a CSV
   */
  exportToCsv(config: {
    school_id: number;
    report_type: string;
    start_date: string;
    end_date: string;
    columns: string[];
  }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/v3/admin/dashboard/export/csv`, config, {
      responseType: 'blob', headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Exporta datos a Excel
   */
  exportToExcel(config: {
    school_id: number;
    report_type: string;
    start_date: string;
    end_date: string;
    include_charts?: boolean;
  }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/v3/admin/dashboard/export/excel`, config, {
      responseType: 'blob', headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Construye parámetros HTTP desde filtros
   */
  private buildParams(filters: Partial<DashboardFilters>): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  /**
   * Maneja errores de HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('Analytics API Service Error:', error);

    let errorMessage = 'Error desconocido en el servicio de analytics';

    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

  // ==========================================
  // MÉTODOS MOCK PARA DESARROLLO
  // ==========================================

  private getMockSummary(): Observable<DashboardSummary> {
    const mockData: DashboardSummary = {
      totalPaid: 45750,
      activeBookings: 128,
      withInsurance: 87,
      withVoucher: 23,
      totalRefunds: 2340,
      netRevenue: 43410,
      compared_to_previous: {
        revenue_change: '+12.5%',
        bookings_change: '+8.3%'
      }
    };

    return of(mockData).pipe(delay(800));
  }

  private getMockCoursesAnalytics(): Observable<CourseAnalytics[]> {
    const mockData: CourseAnalytics[] = [
      {
        courseId: 1,
        courseName: 'Esquí Principiantes',
        courseType: 1,
        totalRevenue: 15400,
        totalBookings: 42,
        averagePrice: 367,
        completionRate: 94.2,
        paymentMethods: {
          cash: 8,
          card: 22,
          online: 10,
          vouchers: 2,
          pending: 0
        }
      },
      {
        courseId: 2,
        courseName: 'Snowboard Avanzado',
        courseType: 2,
        totalRevenue: 12800,
        totalBookings: 28,
        averagePrice: 457,
        completionRate: 89.3,
        paymentMethods: {
          cash: 3,
          card: 18,
          online: 6,
          vouchers: 1,
          pending: 0
        }
      },
      {
        courseId: 3,
        courseName: 'Esquí Privado',
        courseType: 3,
        totalRevenue: 9800,
        totalBookings: 15,
        averagePrice: 653,
        completionRate: 100,
        paymentMethods: {
          cash: 2,
          card: 10,
          online: 3,
          vouchers: 0,
          pending: 0
        }
      }
    ];

    return of(mockData).pipe(delay(600));
  }

  private getMockFinancialDashboard(): Observable<FinancialDashboard> {
    const mockData: FinancialDashboard = {
      totalRevenue: 45750,
      totalBookings: 128,
      averageOrderValue: 357,
      conversionRate: 68.4,
      topCourses: [
        {
          courseId: 1,
          courseName: 'Esquí Principiantes',
          courseType: 1,
          totalRevenue: 15400,
          totalBookings: 42,
          averagePrice: 367,
          completionRate: 94.2,
          paymentMethods: {
            cash: 8,
            card: 22,
            online: 10,
            vouchers: 2,
            pending: 0
          }
        }
      ],
      revenueByPeriod: [
        { date: '2024-01-01', revenue: 8500, bookings: 24 },
        { date: '2024-01-02', revenue: 9200, bookings: 28 },
        { date: '2024-01-03', revenue: 7800, bookings: 22 },
        { date: '2024-01-04', revenue: 10100, bookings: 31 },
        { date: '2024-01-05', revenue: 11300, bookings: 35 }
      ],
      paymentMethodBreakdown: [
        { method: 'Tarjeta', amount: 25200, percentage: 55.1 },
        { method: 'Online', amount: 13400, percentage: 29.3 },
        { method: 'Efectivo', amount: 5950, percentage: 13.0 },
        { method: 'Vouchers', amount: 1200, percentage: 2.6 }
      ]
    };

    return of(mockData).pipe(delay(700));
  }
}
