import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

interface UserMenuItem {
  icon: string;
  label: string;
  action: () => void;
  divider?: boolean;
  danger?: boolean;
}

@Component({
  selector: 'vex-toolbar-user-enhanced',
  template: `
    <div class="enhanced-user-menu">
      <!-- Información del usuario -->
      <div class="user-info-section">
        <div class="user-avatar-large">
          <img [src]="userAvatar" [alt]="userName" class="avatar-img">
          <div class="status-indicator online"></div>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRole }}</div>
          <div class="user-email">{{ userEmail }}</div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="quick-actions">
        <button 
          class="quick-action-btn" 
          (click)="switchAccount()"
          matTooltip="Cambiar cuenta">
          <mat-icon>swap_horiz</mat-icon>
        </button>
        <button 
          class="quick-action-btn" 
          (click)="toggleNotifications()"
          matTooltip="Notificaciones"
          [class.active]="notificationsEnabled">
          <mat-icon>{{ notificationsEnabled ? 'notifications' : 'notifications_off' }}</mat-icon>
        </button>
        <button 
          class="quick-action-btn" 
          (click)="toggleAvailability()"
          matTooltip="Estado"
          [class.active]="isAvailable">
          <mat-icon>{{ isAvailable ? 'work' : 'work_off' }}</mat-icon>
        </button>
      </div>

      <!-- Menú de opciones -->
      <div class="menu-options">
        <div 
          class="menu-item" 
          *ngFor="let item of menuItems" 
          (click)="item.action()"
          [class.danger]="item.danger">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label | translate }}</span>
          <mat-divider *ngIf="item.divider"></mat-divider>
        </div>
      </div>

      <!-- Footer con versión -->
      <div class="menu-footer">
        <div class="version-info">
          <span class="app-name">Boukii Admin</span>
          <span class="version">v{{ appVersion }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-user-menu {
      min-width: 280px;
      background: white;
      border-radius: var(--boukii-radius-xl);
      box-shadow: var(--boukii-shadow-xl);
      border: 1px solid var(--boukii-gray-200);
      overflow: hidden;
    }

    /* ============= INFORMACIÓN DEL USUARIO ============= */
    .user-info-section {
      background: linear-gradient(135deg, var(--boukii-primary), var(--boukii-secondary));
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar-large {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.online {
      background: var(--boukii-success);
    }

    .status-indicator.away {
      background: var(--boukii-warning);
    }

    .status-indicator.offline {
      background: var(--boukii-gray-400);
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }

    .user-role {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.125rem;
    }

    .user-email {
      font-size: 0.75rem;
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ============= ACCIONES RÁPIDAS ============= */
    .quick-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--boukii-gray-100);
      background: var(--boukii-gray-50);
    }

    .quick-action-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--boukii-radius-lg);
      border: 1px solid var(--boukii-gray-200);
      background: white;
      color: var(--boukii-gray-600);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-action-btn:hover {
      background: var(--boukii-gray-100);
      color: var(--boukii-primary);
      transform: translateY(-1px);
    }

    .quick-action-btn.active {
      background: var(--boukii-primary);
      color: white;
      border-color: var(--boukii-primary);
    }

    /* ============= OPCIONES DEL MENÚ ============= */
    .menu-options {
      padding: 0.5rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--boukii-gray-700);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .menu-item:hover {
      background: var(--boukii-gray-50);
      color: var(--boukii-gray-900);
    }

    .menu-item.danger {
      color: var(--boukii-danger);
    }

    .menu-item.danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--boukii-danger);
    }

    .menu-item mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: inherit;
    }

    /* ============= FOOTER DEL MENÚ ============= */
    .menu-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--boukii-gray-100);
      background: var(--boukii-gray-50);
    }

    .version-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--boukii-gray-700);
    }

    .version {
      font-size: 0.625rem;
      color: var(--boukii-gray-500);
      background: var(--boukii-gray-200);
      padding: 0.125rem 0.375rem;
      border-radius: var(--boukii-radius);
    }

    /* ============= TEMA OSCURO ============= */
    .vex-dark .enhanced-user-menu {
      background: var(--vex-sidenav-background);
      border-color: var(--vex-sidenav-section-divider-color);
    }

    .vex-dark .quick-actions {
      background: var(--vex-sidenav-section-background);
      border-bottom-color: var(--vex-sidenav-section-divider-color);
    }

    .vex-dark .quick-action-btn {
      background: var(--vex-sidenav-background);
      border-color: var(--vex-sidenav-section-divider-color);
      color: var(--vex-text-secondary);
    }

    .vex-dark .menu-item {
      color: var(--vex-text-secondary);
    }

    .vex-dark .menu-item:hover {
      background: var(--vex-sidenav-item-hover-background);
      color: white;
    }

    .vex-dark .menu-footer {
      background: var(--vex-sidenav-section-background);
      border-top-color: var(--vex-sidenav-section-divider-color);
    }
  `]
})
export class ToolbarUserEnhancedComponent implements OnInit {
  userName = 'Carlos Méndez';
  userRole = 'Administrador';
  userEmail = 'carlos.mendez@boukii.com';
  userAvatar = 'assets/img/avatar.png';
  appVersion = '2.1.0';

  notificationsEnabled = true;
  isAvailable = true;

  menuItems: UserMenuItem[] = [
    {
      icon: 'person',
      label: 'Mi Perfil',
      action: () => this.goToProfile()
    },
    {
      icon: 'settings',
      label: 'Configuraciones',
      action: () => this.goToSettings()
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
      action: () => this.goToNotifications()
    },
    {
      icon: 'help',
      label: 'Ayuda y Soporte',
      action: () => this.openHelp()
    },
    {
      icon: 'feedback',
      label: 'Enviar Feedback',
      action: () => this.sendFeedback()
    },
    {
      icon: 'logout',
      label: 'Cerrar Sesión',
      action: () => this.logout(),
      divider: true,
      danger: true
    }
  ];

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = JSON.parse(localStorage.getItem('boukiiUser') || '{}');
    if (user.first_name && user.last_name) {
      this.userName = `${user.first_name} ${user.last_name}`;
    }
    if (user.email) {
      this.userEmail = user.email;
    }
    if (user.type) {
      this.userRole = user.type;
    }
  }

  // ============= ACCIONES RÁPIDAS =============
  switchAccount(): void {
    console.log('Cambiar cuenta');
    // Implementar switch de cuenta
  }

  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
    console.log('Notificaciones:', this.notificationsEnabled ? 'habilitadas' : 'deshabilitadas');
  }

  toggleAvailability(): void {
    this.isAvailable = !this.isAvailable;
    console.log('Estado:', this.isAvailable ? 'disponible' : 'no disponible');
  }

  // ============= NAVEGACIÓN =============
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  openHelp(): void {
    window.open('https://help.boukii.com', '_blank');
  }

  sendFeedback(): void {
    window.open('mailto:feedback@boukii.com?subject=Feedback desde Admin Panel', '_blank');
  }

  logout(): void {
    localStorage.removeItem('boukiiUser');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}