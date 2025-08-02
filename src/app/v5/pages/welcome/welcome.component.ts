import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { SeasonContextService } from '../../core/services/season-context.service';
import { AuthV5Service } from '../../core/services/auth-v5.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardService, DashboardStats, RecentActivity, AlertItem, WeatherData, MonitorStats } from '../../core/services/dashboard.service';
import { TranslateService } from '@ngx-translate/core';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: Date;
  school: {
    id: number;
    name: string;
    location?: string;
  };
  permissions: string[];
  avatar?: string;
}

interface QuickAction {
  icon: string;
  labelKey: string;
  route: string;
  action: string;
  color: string;
  permission?: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // User and session data
  currentUser: CurrentUser | null = null;
  currentSeason: any = null;

  // Dashboard data
  dashboardStats: DashboardStats | null = null;
  recentActivity: RecentActivity[] = [];
  criticalAlerts: AlertItem[] = [];
  weatherData: WeatherData | null = null;
  monitorStats: MonitorStats | null = null;

  // Loading states
  loading = true;
  loadingStats = true;
  loadingActivity = true;
  loadingWeather = true;
  loadingUser = true;

  // Error states
  hasError = false;
  errorMessage = '';

  // Quick actions with permissions
  quickActions: QuickAction[] = [
    {
      icon: 'add_circle',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.NEW_BOOKING',
      route: '/v5/bookings',
      action: 'create',
      color: 'primary',
      permission: 'bookings.create'
    },
    {
      icon: 'person_add',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.NEW_CLIENT',
      route: '/v5/clients',
      action: 'create',
      color: 'accent',
      permission: 'clients.create'
    },
    {
      icon: 'calendar_today',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.PLANNER',
      route: '/v5/planner',
      action: 'view',
      color: 'primary',
      permission: 'planner.view'
    },
    {
      icon: 'school',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.NEW_COURSE',
      route: '/v5/courses',
      action: 'create',
      color: 'accent',
      permission: 'courses.create'
    },
    {
      icon: 'assessment',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.REPORTS',
      route: '/v5/reports',
      action: 'view',
      color: 'warn',
      permission: 'reports.view'
    },
    {
      icon: 'people',
      labelKey: 'DASHBOARD.QUICK_ACTIONS.MONITORS',
      route: '/v5/monitors',
      action: 'view',
      color: 'primary',
      permission: 'monitors.view'
    }
  ];

  // Filtered actions based on permissions
  availableActions: QuickAction[] = [];

  constructor(
    private router: Router,
    private seasonContext: SeasonContextService,
    private authService: AuthV5Service,
    private dashboardService: DashboardService,
    private notifications: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.subscribeToRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== USER DATA LOADING ====================

  private loadUserData(): void {
    this.loadingUser = true;
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = {
              id: user.id,
              name: user.name || `${user.first_name} ${user.last_name}`.trim(),
              email: user.email,
              role: user.role?.name || user.role_name || 'Usuario',
              lastLogin: new Date(user.last_login_at || user.updated_at),
              school: {
                id: user.school?.id || 0,
                name: user.school?.name || 'Escuela de Esquí',
                location: user.school?.location
              },
              permissions: user.permissions || [],
              avatar: user.avatar_url
            };

            this.filterQuickActionsByPermissions();
            this.loadingUser = false;

            this.authService.logUserAction('dashboard_viewed', {
              userId: this.currentUser.id,
              userName: this.currentUser.name
            });
          }
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.notifications.showError(
            this.translate.instant('DASHBOARD.ERRORS.USER_LOAD_FAILED')
          );
          this.loadingUser = false;
        }
      });
  }

  private filterQuickActionsByPermissions(): void {
    if (!this.currentUser) {
      this.availableActions = [];
      return;
    }

    this.availableActions = this.quickActions.filter(action => {
      if (!action.permission) return true;
      return this.currentUser!.permissions.includes(action.permission);
    });
  }

  // ==================== DASHBOARD DATA LOADING ====================

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load current season first
    this.seasonContext.currentSeason$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (season) => {
          this.currentSeason = season;
          if (season) {
            this.loadStatsAndActivity(season.id);
          } else {
            this.handleNoSeasonSelected();
          }
        },
        error: (error) => {
          console.error('Error loading season:', error);
          this.notifications.showError(
            this.translate.instant('DASHBOARD.ERRORS.SEASON_LOAD_FAILED')
          );
          this.handleLoadingError(error);
        }
      });
  }

  private async loadStatsAndActivity(seasonId: number): Promise<void> {
    try {
      // Load all dashboard data in parallel
      const promises = [
        this.loadDashboardStats(seasonId),
        this.loadRecentActivity(),
        this.loadAlerts(),
        this.loadWeatherData(),
        this.loadMonitorStats(seasonId)
      ];

      await Promise.allSettled(promises);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.handleLoadingError(error);
    } finally {
      this.loading = false;
    }
  }

  private async loadDashboardStats(seasonId: number): Promise<void> {
    this.loadingStats = true;
    
    try {
      this.dashboardStats = await this.dashboardService.loadDashboardData(seasonId);
      
      this.authService.logUserAction('dashboard_stats_loaded', {
        seasonId,
        totalBookings: this.dashboardStats.bookings.total,
        totalRevenue: this.dashboardStats.revenue.thisMonth
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      this.notifications.showError(
        this.translate.instant('DASHBOARD.ERRORS.STATS_LOAD_FAILED')
      );
    } finally {
      this.loadingStats = false;
    }
  }

  private async loadRecentActivity(): Promise<void> {
    this.loadingActivity = true;
    
    try {
      this.recentActivity = await this.dashboardService.getRecentActivity(10);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      this.recentActivity = [];
    } finally {
      this.loadingActivity = false;
    }
  }

  private async loadAlerts(): Promise<void> {
    try {
      this.criticalAlerts = await this.dashboardService.getActiveAlerts();
      
      // Show critical alerts as notifications
      this.criticalAlerts
        .filter(alert => alert.type === 'critical')
        .forEach(alert => {
          this.notifications.showError(alert.message, 10000);
        });

    } catch (error) {
      console.error('Error loading alerts:', error);
      this.criticalAlerts = [];
    }
  }

  private async loadWeatherData(): Promise<void> {
    this.loadingWeather = true;
    
    try {
      this.weatherData = await this.dashboardService.getWeatherData();
    } catch (error) {
      console.error('Error loading weather data:', error);
      this.weatherData = null;
    } finally {
      this.loadingWeather = false;
    }
  }

  private async loadMonitorStats(seasonId: number): Promise<void> {
    try {
      this.monitorStats = await this.dashboardService.getMonitorStats(seasonId);
    } catch (error) {
      console.error('Error loading monitor stats:', error);
      this.monitorStats = null;
    }
  }

  // ==================== REALTIME UPDATES ====================

  private subscribeToRealtimeUpdates(): void {
    // Subscribe to dashboard service observables for real-time updates
    this.dashboardService.dashboardStats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        if (stats) {
          this.dashboardStats = stats;
        }
      });

    this.dashboardService.recentActivity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activity => {
        this.recentActivity = activity;
      });

    this.dashboardService.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.criticalAlerts = alerts;
      });
  }

  // ==================== USER INTERACTIONS ====================

  navigateToQuickAction(action: QuickAction): void {
    this.authService.logUserAction('quick_action_clicked', {
      action: action.action,
      route: action.route,
      labelKey: action.labelKey
    });

    if (action.action === 'create') {
      // For create actions, could open modals in the future
      this.router.navigate([action.route, 'new']);
    } else {
      this.router.navigate([action.route]);
    }
  }

  navigateToAlert(alert: AlertItem): void {
    this.authService.logUserAction('alert_clicked', {
      alertId: alert.id,
      alertType: alert.type,
      actionUrl: alert.actionUrl
    });

    if (alert.actionUrl) {
      this.router.navigate([alert.actionUrl]);
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    try {
      await this.dashboardService.dismissAlert(alertId);
      
      this.authService.logUserAction('alert_dismissed', { alertId });
      
      this.notifications.showSuccess(
        this.translate.instant('DASHBOARD.MESSAGES.ALERT_DISMISSED')
      );

    } catch (error) {
      console.error('Error dismissing alert:', error);
      this.notifications.showError(
        this.translate.instant('DASHBOARD.ERRORS.ALERT_DISMISS_FAILED')
      );
    }
  }

  async refreshDashboard(): Promise<void> {
    this.authService.logUserAction('dashboard_refreshed');
    
    this.notifications.showInfo(
      this.translate.instant('DASHBOARD.MESSAGES.REFRESHING')
    );

    try {
      await this.loadDashboardData();
      
      this.notifications.showSuccess(
        this.translate.instant('DASHBOARD.MESSAGES.REFRESH_SUCCESS')
      );

    } catch (error) {
      this.notifications.showError(
        this.translate.instant('DASHBOARD.ERRORS.REFRESH_FAILED')
      );
    }
  }

  // ==================== UTILITY METHODS ====================

  getActivityIcon(type: string): string {
    const icons = {
      booking: 'event_note',
      payment: 'payment',
      client: 'person_add',
      course: 'school',
      monitor: 'person',
      cancellation: 'cancel'
    };
    return icons[type as keyof typeof icons] || 'info';
  }

  getStatusColor(status: string): string {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return this.translate.instant('DASHBOARD.TIME.JUST_NOW');
    } else if (diffMins < 60) {
      return this.translate.instant('DASHBOARD.TIME.MINUTES_AGO', { minutes: diffMins });
    } else if (diffHours < 24) {
      return this.translate.instant('DASHBOARD.TIME.HOURS_AGO', { hours: diffHours });
    } else {
      return this.translate.instant('DASHBOARD.TIME.DAYS_AGO', { days: diffDays });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getWeatherIcon(condition: string): string {
    const icons = {
      'sunny': 'wb_sunny',
      'partly-cloudy': 'partly_cloudy_day',
      'cloudy': 'cloud',
      'rainy': 'rainy',
      'snowy': 'ac_unit',
      'stormy': 'thunderstorm'
    };
    return icons[condition as keyof typeof icons] || 'wb_sunny';
  }

  // ==================== ERROR HANDLING ====================

  private handleLoadingError(error: any): void {
    this.hasError = true;
    this.errorMessage = this.translate.instant('DASHBOARD.ERRORS.GENERAL_ERROR');
    this.loading = false;
    this.loadingStats = false;
    this.loadingActivity = false;
    this.loadingWeather = false;
  }

  private handleNoSeasonSelected(): void {
    this.notifications.showWarning(
      this.translate.instant('DASHBOARD.WARNINGS.NO_SEASON_SELECTED')
    );
    
    // Could redirect to season selection or show season selector
    this.loading = false;
  }

  // ==================== GETTERS FOR TEMPLATE ====================

  get totalActiveUsers(): number {
    if (!this.dashboardStats) return 0;
    return this.dashboardStats.clients.active + (this.monitorStats?.active || 0);
  }

  get todayRevenue(): number {
    return this.dashboardStats?.bookings.todayRevenue || 0;
  }

  get weatherTemperature(): string {
    if (!this.weatherData) return '--';
    return `${Math.round(this.weatherData.temperature)}°C`;
  }

  get isDataLoaded(): boolean {
    return !this.loading && !this.loadingStats && !this.loadingUser;
  }

  get hasAlerts(): boolean {
    return this.criticalAlerts.length > 0;
  }

  get criticalAlertsCount(): number {
    return this.criticalAlerts.filter(alert => alert.type === 'critical').length;
  }

  navigateToActivityDetail(actionUrl: string): void {
    this.router.navigate([actionUrl]);
  }

  // ==================== NEW TEMPLATE METHODS ====================

  get recentSessions() {
    return this.dashboardStats?.dailySessions?.slice(-7) || [];
  }

  get displayReservations() {
    return this.dashboardStats?.todayReservations?.slice(0, 8) || [];
  }

  getWeatherConditionText(condition: string): string {
    const conditions = {
      'sunny': 'Soleado',
      'partly-cloudy': 'Parcialmente nublado',
      'cloudy': 'Nublado',
      'rainy': 'Lluvioso',
      'snowy': 'Nevando',
      'stormy': 'Tormentoso'
    };
    return conditions[condition as keyof typeof conditions] || 'Soleado';
  }

  getDayName(index: number): string {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days[index] || 'Lun';
  }

  getReservationTypeClass(courseType: string): string {
    if (courseType.toLowerCase().includes('privado')) return 'private';
    if (courseType.toLowerCase().includes('colectivo')) return 'collective';
    return 'collective';
  }

  getReservationTypeLabel(courseType: string): string {
    if (courseType.toLowerCase().includes('privado')) return 'Privado';
    return 'Colectivo';
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getClientEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    return `${cleanName}@email.com`;
  }

  getStatusLabel(status: string): string {
    const labels = {
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getReservationPrice(courseType: string): number {
    const prices = {
      'Principiante': 85,
      'Intermedio': 45,
      'Avanzado': 95,
      'Snowboard': 110,
      'Privado': 150,
      'Freestyle': 110,
      'Paralelo': 55,
      'Fondo': 40,
      'Competición': 150
    };
    
    // Find matching price based on course type
    for (const [key, price] of Object.entries(prices)) {
      if (courseType.includes(key)) {
        return price;
      }
    }
    
    return 85; // Default price
  }
}