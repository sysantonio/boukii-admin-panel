import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { AuthV5Service } from './auth-v5.service';
import { SeasonContextService } from './season-context.service';

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageBookings: boolean;
  canManageClients: boolean;
  canManageCourses: boolean;
  canManageMonitors: boolean;
  canViewReports: boolean;  
  canManageSettings: boolean;
  canAccessAnalytics: boolean;
  canViewPlanner: boolean;
  canManageEquipment: boolean;
  canManageBonuses: boolean;
  canManageCommunications: boolean;
  canManagePayments: boolean;
  canManageAdmins: boolean;
  seasonAccess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsV5Service {
  private permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(
    private authService: AuthV5Service,
    private seasonContext: SeasonContextService
  ) {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    // Subscribe to auth and season changes to recalculate permissions
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.calculatePermissions(user);
      } else {
        this.permissionsSubject.next(null);
      }
    });

    // Also recalculate when season changes
    this.seasonContext.currentSeason$.subscribe(() => {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.calculatePermissions(user);
      }
    });
  }

  private calculatePermissions(user: any): void {
    const currentSeason = this.seasonContext.getCurrentSeason();
    const currentSchool = this.authService.getCurrentSchool();
    
    console.log('🔐 Calculating permissions for:', {
      user: user.email,
      season: currentSeason?.name,
      school: currentSchool?.name
    });

    // For now, implement basic permissions logic
    // TODO: This should be enhanced with proper role-based permissions from the backend
    
    const permissions: UserPermissions = {
      canViewDashboard: true, // Everyone can view dashboard
      canManageBookings: this.hasPermission(user, 'bookings.manage'),
      canManageClients: this.hasPermission(user, 'clients.manage'),
      canManageCourses: this.hasPermission(user, 'courses.manage'),
      canManageMonitors: this.hasPermission(user, 'monitors.manage'),
      canViewReports: this.hasPermission(user, 'reports.view'),
      canManageSettings: this.hasPermission(user, 'settings.manage'),
      canAccessAnalytics: this.hasPermission(user, 'analytics.view'),
      canViewPlanner: this.hasPermission(user, 'planner.view'),
      canManageEquipment: this.hasPermission(user, 'equipment.manage'),
      canManageBonuses: this.hasPermission(user, 'bonuses.manage'),
      canManageCommunications: this.hasPermission(user, 'communications.manage'),
      canManagePayments: this.hasPermission(user, 'payments.manage'),
      canManageAdmins: this.hasPermission(user, 'admins.manage'),
      seasonAccess: !!currentSeason && !!currentSchool
    };

    // If user doesn't have season access, restrict most permissions
    if (!permissions.seasonAccess) {
      console.warn('⚠️ User has no season access, restricting permissions');
      permissions.canManageBookings = false;
      permissions.canManageClients = false;
      permissions.canManageCourses = false;
      permissions.canManageMonitors = false;
      permissions.canViewReports = false;
      permissions.canAccessAnalytics = false;
      permissions.canViewPlanner = false;
      permissions.canManageEquipment = false;
      permissions.canManageBonuses = false;
      permissions.canManageCommunications = false;
      permissions.canManagePayments = false;
    }

    this.permissionsSubject.next(permissions);
    console.log('✅ Permissions calculated:', permissions);
  }

  private hasPermission(user: any, permission: string): boolean {
    // For now, check if user has admin role or the specific permission
    if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'school_admin') {
      return true;
    }

    // Check if user has the specific permission
    return user.permissions?.includes(permission) || false;
  }

  /**
   * Get current permissions synchronously
   */
  getCurrentPermissions(): UserPermissions | null {
    return this.permissionsSubject.value;
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(route: string): boolean {
    const permissions = this.getCurrentPermissions();
    if (!permissions) return false;

    const routePermissionMap: { [key: string]: keyof UserPermissions } = {
      '/v5': 'canViewDashboard',
      '/v5/welcome': 'canViewDashboard', 
      '/v5/bookings': 'canManageBookings',
      '/v5/clients': 'canManageClients',
      '/v5/courses': 'canManageCourses',
      '/v5/monitors': 'canManageMonitors',
      '/v5/reports': 'canViewReports',
      '/v5/settings': 'canManageSettings',
      '/v5/analytics': 'canAccessAnalytics',
      '/v5/planner': 'canViewPlanner',
      '/v5/equipment': 'canManageEquipment',
      '/v5/bonuses': 'canManageBonuses',
      '/v5/communications': 'canManageCommunications',
      '/v5/payments': 'canManagePayments',
      '/v5/admins': 'canManageAdmins'
    };

    const permissionKey = routePermissionMap[route];
    return permissionKey ? permissions[permissionKey] : false;
  }

  /**
   * Get user-friendly error message for insufficient permissions
   */
  getPermissionErrorMessage(route: string): string {
    const routeMessages: { [key: string]: string } = {
      '/v5/bookings': 'No tienes permisos para gestionar reservas en esta temporada.',
      '/v5/clients': 'No tienes permisos para gestionar clientes en esta temporada.',
      '/v5/courses': 'No tienes permisos para gestionar cursos en esta temporada.',
      '/v5/monitors': 'No tienes permisos para gestionar monitores en esta temporada.',
      '/v5/reports': 'No tienes permisos para ver reportes en esta temporada.',
      '/v5/settings': 'No tienes permisos para acceder a la configuración.',
      '/v5/analytics': 'No tienes permisos para acceder a analytics en esta temporada.',
      '/v5/planner': 'No tienes permisos para acceder al planificador en esta temporada.',
      '/v5/equipment': 'No tienes permisos para gestionar equipamiento en esta temporada.',
      '/v5/bonuses': 'No tienes permisos para gestionar bonos en esta temporada.',
      '/v5/communications': 'No tienes permisos para gestionar comunicaciones en esta temporada.',
      '/v5/payments': 'No tienes permisos para gestionar pagos en esta temporada.',
      '/v5/admins': 'No tienes permisos para gestionar administradores.'
    };

    return routeMessages[route] || 'No tienes permisos suficientes para acceder a esta sección.';
  }

  /**
   * Check if user has any seasonal permissions
   */
  hasAnySeasonalPermissions(): boolean {
    const permissions = this.getCurrentPermissions();
    if (!permissions || !permissions.seasonAccess) return false;

    return permissions.canManageBookings ||
           permissions.canManageClients ||
           permissions.canManageCourses ||
           permissions.canManageMonitors ||
           permissions.canViewReports ||
           permissions.canAccessAnalytics ||
           permissions.canViewPlanner ||
           permissions.canManageEquipment ||
           permissions.canManageBonuses ||
           permissions.canManageCommunications ||
           permissions.canManagePayments;
  }
}