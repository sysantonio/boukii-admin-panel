import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { DashboardService, DashboardStats, RecentActivity, AlertItem } from './dashboard.service';
import { ApiV5Service } from './api-v5.service';
import { SeasonContextService } from './season-context.service';
import { LoggingService } from './logging.service';
import { ErrorHandlerService } from './error-handler.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockApiV5Service: jasmine.SpyObj<ApiV5Service>;
  let mockSeasonContextService: jasmine.SpyObj<SeasonContextService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockErrorHandlerService: jasmine.SpyObj<ErrorHandlerService>;

  const mockSeasonId = 1;
  const mockDashboardStats: DashboardStats = {
    bookings: {
      total: 150,
      pending: 12,
      confirmed: 128,
      cancelled: 10,
      todayCount: 8,
      weeklyGrowth: 15.5,
      todayRevenue: 450.00,
      pendingPayments: 3
    },
    clients: {
      total: 89,
      active: 76,
      newThisMonth: 12,
      vipClients: 8,
      averageAge: 28.5,
      topNationalities: ['Spanish', 'French', 'German']
    },
    revenue: {
      thisMonth: 15450.00,
      lastMonth: 13200.00,
      growth: 17.05,
      pending: 340.00,
      dailyAverage: 498.38,
      topPaymentMethod: 'Credit Card',
      totalThisSeason: 45600.00
    },
    courses: {
      active: 24,
      upcoming: 18,
      completedThisWeek: 45,
      totalCapacity: 192,
      occupancyRate: 78.5,
      averageRating: 4.6
    },
    monitors: {
      total: 12,
      active: 10,
      available: 8,
      onLeave: 2,
      newThisMonth: 1,
      averageRating: 4.8,
      hoursWorkedThisWeek: 240
    },
    weather: {
      location: 'Madrid, Spain',
      temperature: 22,
      condition: 'sunny',
      windSpeed: 8,
      humidity: 45,
      visibility: 10,
      forecast: [],
      lastUpdated: new Date()
    },
    salesChannels: [
      { channel: 'Online', bookings: 85, revenue: 8500.00, percentage: 65.2, growth: 12.3 },
      { channel: 'Phone', bookings: 35, revenue: 4200.00, percentage: 26.9, growth: -2.1 },
      { channel: 'Walk-in', bookings: 10, revenue: 1200.00, percentage: 7.9, growth: 8.7 }
    ],
    dailySessions: [
      {
        date: new Date('2025-01-06'),
        morningSlots: 8,
        afternoonSlots: 12,
        totalSessions: 20,
        occupancy: 85.5
      }
    ],
    todayReservations: [
      {
        id: 1,
        clientName: 'Juan Pérez',
        courseType: 'Surf Beginner',
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed',
        paymentStatus: 'paid',
        monitorName: 'Carlos Ruiz'
      }
    ]
  };

  const mockRecentActivity: RecentActivity[] = [
    {
      id: 'act_1',
      type: 'booking',
      title: 'Nueva reserva creada',
      description: 'Juan Pérez reservó Surf Beginner',
      timestamp: new Date(),
      status: 'success',
      actionUrl: '/v5/bookings/123'
    }
  ];

  const mockAlerts: AlertItem[] = [
    {
      id: 'alert_1',
      type: 'warning',
      title: 'Pagos pendientes',
      message: 'Hay 3 pagos pendientes por revisar',
      timestamp: new Date(),
      priority: 2,
      actionUrl: '/v5/payments/pending'
    }
  ];

  beforeEach(() => {
    const apiV5Spy = jasmine.createSpyObj('ApiV5Service', ['get', 'delete', 'testAuth']);
    const seasonSpy = jasmine.createSpyObj('SeasonContextService', ['getCurrentSeasonId']);
    const loggingSpy = jasmine.createSpyObj('LoggingService', ['info', 'error', 'warn']);
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        { provide: ApiV5Service, useValue: apiV5Spy },
        { provide: SeasonContextService, useValue: seasonSpy },
        { provide: LoggingService, useValue: loggingSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy }
      ]
    });

    service = TestBed.inject(DashboardService);
    mockApiV5Service = TestBed.inject(ApiV5Service) as jasmine.SpyObj<ApiV5Service>;
    mockSeasonContextService = TestBed.inject(SeasonContextService) as jasmine.SpyObj<SeasonContextService>;
    mockLoggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    mockErrorHandlerService = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDashboardData', () => {
    beforeEach(() => {
      mockSeasonContextService.getCurrentSeasonId.and.returnValue(mockSeasonId);
      mockApiV5Service.testAuth.and.returnValue(of(true));
    });

    it('should load dashboard data successfully', async () => {
      // Arrange
      const mockStatsResponse = { success: true, data: mockDashboardStats };
      const mockDailySessionsResponse = { success: true, data: mockDashboardStats.dailySessions };
      const mockTodayReservationsResponse = { success: true, data: mockDashboardStats.todayReservations };

      mockApiV5Service.get.and.returnValues(
        of(mockStatsResponse),
        of(mockDailySessionsResponse),
        of(mockTodayReservationsResponse)
      );

      // Act
      const result = await service.loadDashboardData();

      // Assert
      expect(result).toBeDefined();
      expect(result.bookings.total).toBe(150);
      expect(result.clients.total).toBe(89);
      expect(result.revenue.thisMonth).toBe(15450.00);
      
      expect(mockApiV5Service.get).toHaveBeenCalledWith('dashboard/stats', { season_id: mockSeasonId.toString() });
      expect(mockLoggingService.info).toHaveBeenCalledWith('Loading dashboard data', { seasonId: mockSeasonId });
    });

    it('should handle authentication failure', async () => {
      // Arrange
      mockApiV5Service.testAuth.and.returnValue(throwError('Auth failed'));

      // Act
      const result = await service.loadDashboardData();

      // Assert
      expect(result).toBeDefined();
      expect(result.bookings.total).toBe(0); // Should return empty data
      expect(mockLoggingService.error).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockApiV5Service.get.and.returnValue(throwError('API Error'));

      // Act
      const result = await service.loadDashboardData();

      // Assert
      expect(result).toBeDefined();
      expect(result.bookings.total).toBe(0);
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        'Failed to load dashboard data',
        jasmine.objectContaining({
          seasonId: mockSeasonId,
          error: 'API Error'
        })
      );
    });

    it('should throw error when no season selected', async () => {
      // Arrange
      mockSeasonContextService.getCurrentSeasonId.and.returnValue(null);

      // Act & Assert
      await expectAsync(service.loadDashboardData()).toBeRejectedWithError('No season selected for dashboard');
    });
  });

  describe('getRecentActivity', () => {
    it('should load recent activity successfully', async () => {
      // Arrange
      const mockResponse = { success: true, data: mockRecentActivity };
      mockApiV5Service.get.and.returnValue(of(mockResponse));

      // Act
      const result = await service.getRecentActivity(5);

      // Assert
      expect(result).toEqual(mockRecentActivity);
      expect(mockApiV5Service.get).toHaveBeenCalledWith('dashboard/recent-activity', { limit: '5' });
      expect(mockLoggingService.info).toHaveBeenCalledWith('Recent activity loaded', { count: 1 });
    });

    it('should handle failed recent activity request', async () => {
      // Arrange
      mockApiV5Service.get.and.returnValue(throwError('Network error'));

      // Act
      const result = await service.getRecentActivity();

      // Assert
      expect(result).toEqual([]);
      expect(mockLoggingService.warn).toHaveBeenCalledWith('Recent activity endpoint failed', { error: 'Network error' });
    });
  });

  describe('getActiveAlerts', () => {
    it('should load active alerts successfully', async () => {
      // Arrange
      const mockResponse = { success: true, data: mockAlerts };
      mockApiV5Service.get.and.returnValue(of(mockResponse));

      // Act
      const result = await service.getActiveAlerts();

      // Assert
      expect(result).toEqual(mockAlerts);
      expect(mockApiV5Service.get).toHaveBeenCalledWith('dashboard/alerts');
      expect(mockLoggingService.info).toHaveBeenCalledWith('Alerts loaded', { count: 1 });
    });

    it('should handle empty alerts response', async () => {
      // Arrange
      const mockResponse = { success: true, data: [] };
      mockApiV5Service.get.and.returnValue(of(mockResponse));

      // Act
      const result = await service.getActiveAlerts();

      // Assert
      expect(result).toEqual([]);
      expect(mockLoggingService.info).toHaveBeenCalledWith('Alerts loaded', { count: 0 });
    });
  });

  describe('dismissAlert', () => {
    it('should dismiss alert successfully', async () => {
      // Arrange
      const alertId = 'alert_1';
      const mockResponse = { success: true };
      mockApiV5Service.delete.and.returnValue(of(mockResponse));
      
      // Set initial alerts
      service['alertsSubject'].next(mockAlerts);

      // Act
      await service.dismissAlert(alertId);

      // Assert
      expect(mockApiV5Service.delete).toHaveBeenCalledWith(`dashboard/alerts/${alertId}`);
      expect(mockLoggingService.info).toHaveBeenCalledWith('Alert dismissed', { alertId });
      
      // Verify alert was removed from local state
      service.alerts$.subscribe(alerts => {
        expect(alerts.length).toBe(0);
      });
    });

    it('should handle dismiss alert failure', async () => {
      // Arrange
      const alertId = 'alert_1';
      mockApiV5Service.delete.and.returnValue(throwError('Delete failed'));

      // Act & Assert
      await expectAsync(service.dismissAlert(alertId)).toBeRejected();
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        'Failed to dismiss alert',
        { alertId, error: 'Delete failed' }
      );
    });
  });

  describe('refreshDashboard', () => {
    it('should refresh dashboard data', async () => {
      // Arrange
      mockSeasonContextService.getCurrentSeasonId.and.returnValue(mockSeasonId);
      mockApiV5Service.testAuth.and.returnValue(of(true));
      
      const mockResponse = { success: true, data: mockDashboardStats };
      mockApiV5Service.get.and.returnValue(of(mockResponse));

      // Act
      const result = await service.refreshDashboard();

      // Assert
      expect(result).toBeDefined();
      expect(mockApiV5Service.get).toHaveBeenCalled();
    });
  });

  describe('getCurrentStats', () => {
    it('should return current stats from BehaviorSubject', () => {
      // Arrange
      service['dashboardStatsSubject'].next(mockDashboardStats);

      // Act
      const result = service.getCurrentStats();

      // Assert
      expect(result).toEqual(mockDashboardStats);
    });

    it('should return null when no stats loaded', () => {
      // Act
      const result = service.getCurrentStats();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('observables', () => {
    it('should emit dashboard stats through observable', (done) => {
      // Arrange
      const testStats = mockDashboardStats;

      // Act
      service.dashboardStats$.subscribe(stats => {
        if (stats) {
          // Assert
          expect(stats).toEqual(testStats);
          done();
        }
      });

      // Trigger emission
      service['dashboardStatsSubject'].next(testStats);
    });

    it('should emit loading state changes', (done) => {
      // Arrange & Act
      service.loading$.subscribe(loading => {
        if (loading) {
          // Assert
          expect(loading).toBe(true);
          done();
        }
      });

      // Trigger loading state
      service['loadingSubject'].next(true);
    });
  });

  describe('error handling', () => {
    it('should return default stats when API calls fail', async () => {
      // Arrange
      mockSeasonContextService.getCurrentSeasonId.and.returnValue(mockSeasonId);
      mockApiV5Service.testAuth.and.returnValue(of(true));
      mockApiV5Service.get.and.returnValue(throwError('Network failure'));

      // Act
      const result = await service.loadDashboardData();

      // Assert
      expect(result.bookings.total).toBe(0);
      expect(result.clients.total).toBe(0);
      expect(result.revenue.thisMonth).toBe(0);
      expect(mockLoggingService.error).toHaveBeenCalled();
    });
  });
});