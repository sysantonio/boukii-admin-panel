import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../services/layout.service';
import { ConfigService } from '../../../config/config.service';
import { Router } from '@angular/router';
// import { DashboardService } from 'src/app/shared/services/dashboard.service';


@Component({
  selector: 'vex-toolbar-enhanced',
  template: `
    <div class="figma-topbar">
      <!-- Botón mobile menu -->
      <button
        *ngIf="isMobile"
        (click)="openSidenav()"
        mat-icon-button
        class="mobile-menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Barra de búsqueda centrada -->
      <div class="search-section">
        <div class="search-container">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            placeholder="Buscar reservas, instructores, cursos..."
            class="search-input"
            [(ngModel)]="searchQuery"
            (keyup.enter)="performSearch()">
          <button
            *ngIf="searchQuery"
            (click)="clearSearch()"
            mat-icon-button
            class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Controles del lado derecho -->
      <div class="controls-section">
        <!-- Selector de idioma -->
        <button
          [matMenuTriggerFor]="languageMenu"
          mat-button
          class="language-selector">
          <mat-icon class="globe-icon">language</mat-icon>
          <span class="language-text">ES</span>
          <mat-icon class="chevron-icon">keyboard_arrow_down</mat-icon>
        </button>

        <!-- Toggle modo oscuro -->
        <button
          (click)="toggleDarkMode()"
          mat-icon-button
          class="theme-toggle">
          <mat-icon>{{ layoutService.isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Notificaciones -->
        <button
          mat-icon-button
          class="notifications-btn"
          [matBadge]="notificationCount"
          matBadgeColor="warn"
          matBadgePosition="above after"
          [matBadgeHidden]="notificationCount === 0">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- Menú del usuario -->
        <button
          [matMenuTriggerFor]="userMenu"
          mat-button
          class="user-menu">
          <img [src]="userAvatar" [alt]="userName" class="user-avatar">
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <mat-icon class="user-chevron">keyboard_arrow_down</mat-icon>
        </button>
      </div>

      <!-- Menús dropdown -->
      <mat-menu #languageMenu="matMenu">
        <button mat-menu-item (click)="changeLanguage('es', 'flag:spain')">
          <mat-icon svgIcon="flag:spain"></mat-icon>
          <span>Español</span>
        </button>
        <button mat-menu-item (click)="changeLanguage('en', 'flag:uk')">
          <mat-icon svgIcon="flag:uk"></mat-icon>
          <span>English</span>
        </button>
        <button mat-menu-item (click)="changeLanguage('fr', 'flag:france')">
          <mat-icon svgIcon="flag:france"></mat-icon>
          <span>Français</span>
        </button>
        <button mat-menu-item (click)="changeLanguage('de', 'flag:germany')">
          <mat-icon svgIcon="flag:germany"></mat-icon>
          <span>Deutsch</span>
        </button>
        <button mat-menu-item (click)="changeLanguage('it', 'flag:italy')">
          <mat-icon svgIcon="flag:italy"></mat-icon>
          <span>Italiano</span>
        </button>
      </mat-menu>

      <mat-menu #userMenu="matMenu">
        <button mat-menu-item (click)="goToProfile()">
          <mat-icon>person</mat-icon>
          <span>Mi Cuenta</span>
        </button>
        <button mat-menu-item (click)="goToSettings()">
          <mat-icon>settings</mat-icon>
          <span>Configuraciones</span>
        </button>
        <button mat-menu-item (click)="goToNotifications()">
          <mat-icon>notifications</mat-icon>
          <span>Notificaciones</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()" class="logout-item">
          <mat-icon>logout</mat-icon>
          <span>Cerrar Sesión</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    /* ============= TOPBAR PRINCIPAL ============= */
    .figma-topbar {
      background: #ffffff;
      border-bottom: 1px solid #e9ecef;
      height: 64px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mobile-menu-btn {
      color: #6c757d;
      margin-right: 16px;
    }

    /* ============= BÚSQUEDA ============= */
    .search-section {
      flex: 1;
      max-width: 480px;
      margin: 0 auto;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 12px 16px;
      transition: all 0.2s ease;
    }

    .search-container:focus-within {
      border-color: #5A3FFF;
      box-shadow: 0 0 0 3px rgba(90, 63, 255, 0.1);
      background: #ffffff;
    }

    .search-icon {
      color: #9ca3af;
      margin-right: 12px;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #374151;
      font-weight: 400;
    }

    .search-input::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }

    .clear-btn {
      color: #9ca3af;
      width: 20px;
      height: 20px;
      margin-left: 4px;
      margin-right: 0;
      padding: 0;
      min-width: 20px;
      flex-shrink: 0;
    }

    .clear-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* ============= CONTROLES ============= */
    .controls-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .language-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      min-width: auto;
    }

    .language-selector:hover {
      background: #f9fafb;
      color: #374151;
    }

    .globe-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .language-text {
      font-size: 14px;
      font-weight: 500;
    }

    .chevron-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .theme-toggle,
    .notifications-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover,
    .notifications-btn:hover {
      background: #f9fafb;
      color: #374151;
    }

    .theme-toggle mat-icon,
    .notifications-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* ============= MENÚ USUARIO ============= */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: none;
      background: transparent;
      border-radius: 8px;
      transition: all 0.2s ease;
      min-width: auto;
      height: auto;
      white-space: nowrap;
    }

    .user-menu:hover {
      background: #f9fafb;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0px;
      text-align: left;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      line-height: 1.2;
    }

    .user-role {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.2;
    }

    .user-chevron {
      font-size: 12px;
      width: 12px;
      height: 12px;
      color: #9ca3af;
    }

    /* ============= BADGES ============= */
    ::ng-deep .mat-badge-content {
      background: #FF6B6B !important;
      color: white !important;
      font-size: 10px !important;
      font-weight: 600 !important;
      min-width: 20px !important;
      height: 20px !important;
      line-height: 20px !important;
    }

    /* ============= MENÚS DROPDOWN ============= */
    .logout-item {
      color: #FF6B6B;
    }

    .logout-item mat-icon {
      color: #FF6B6B;
    }

    /* ============= RESPONSIVE ============= */
    @media (max-width: 768px) {
      .figma-topbar {
        padding: 0 16px;
      }

      .search-section {
        max-width: none;
      }

      .user-info {
        display: none;
      }

      .controls-section {
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .figma-topbar {
        padding: 0 12px;
      }

      .controls-section {
        gap: 8px;
      }

      .language-selector {
        padding: 6px 8px;
      }

      .theme-toggle,
      .notifications-btn {
        width: 32px;
        height: 32px;
      }

      .user-menu {
        padding: 6px 8px;
      }
    }

    /* ============= TEMA OSCURO ============= */
    .vex-dark .figma-topbar {
      background: #1f2937;
      border-bottom-color: #374151;
    }

    .vex-dark .search-container {
      background: #374151;
      border-color: #4b5563;
    }

    .vex-dark .search-container:focus-within {
      background: #1f2937;
      border-color: #6C5CE7;
    }

    .vex-dark .search-input {
      color: #f9fafb;
    }

    .vex-dark .search-input::placeholder {
      color: #9ca3af;
    }

    .vex-dark .language-selector,
    .vex-dark .theme-toggle,
    .vex-dark .notifications-btn,
    .vex-dark .user-menu {
      color: #d1d5db;
    }

    .vex-dark .language-selector:hover,
    .vex-dark .theme-toggle:hover,
    .vex-dark .notifications-btn:hover,
    .vex-dark .user-menu:hover {
      background: #374151;
      color: #f9fafb;
    }

    .vex-dark .user-name {
      color: #f9fafb;
    }

    .vex-dark .user-role {
      color: #9ca3af;
    }
  `]
})
export class ToolbarEnhancedComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Propiedades de búsqueda
  searchQuery = '';

  // Propiedades del usuario
  userName = 'Usuario';
  userRole = 'Administrador';
  userAvatar = 'assets/img/avatar.png';
  notificationCount = 3;
  user: any;

  // Idioma actual
  currentFlag = 'flag:spain';

  // Control de vista móvil
  isMobile = false;

  constructor(
    public layoutService: LayoutService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.loadMetrics();
    this.checkMobileView();
    this.loadUserData();
  }

  private loadUserData(): void {
    this.user = JSON.parse(localStorage.getItem('boukiiUser') || '{}');
    if (this.user && this.user.first_name) {
      this.userName = this.user.first_name;
      this.userRole = this.user.rol || 'Admin';
      if (this.user.avatar) {
        this.userAvatar = this.user.avatar;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMetrics(): void {
    // Mock data for now - remove DashboardService dependency
    // this.dashboardService.getMetrics()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(metrics => {
    //     this.updateHeaderMetrics(metrics);
    //   });
  }


  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  // ============= ACCIONES DE BÚSQUEDA =============
  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscar:', this.searchQuery);
      // Implementar lógica de búsqueda
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  // ============= ACCIONES DE NAVEGACIÓN =============
  openSidenav(): void {
    this.layoutService.openSidenav();
  }

  toggleDarkMode(): void {
    this.layoutService.toggleDarkMode();
  }

  changeLanguage(lang: string, flag: string): void {
    this.currentFlag = flag;
    // Implementar cambio de idioma
    console.log('Cambiar idioma a:', lang);
  }

  // ============= ACCIONES DEL USUARIO =============
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  logout(): void {
    // Implementar logout
    console.log('Cerrar sesión');
    localStorage.removeItem('boukiiUser');
    this.router.navigate(['/login']);
  }
}
