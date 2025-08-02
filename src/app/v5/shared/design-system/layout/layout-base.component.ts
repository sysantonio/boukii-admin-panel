import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// V5 Core Services
import { SeasonContextService } from '../../../core/services/season-context.service';
import { I18nService } from '../../../core/services/i18n.service';
import { LoggingService } from '../../../core/services/logging.service';

// Interfaces
import { Season } from '../../../core/models/season.interface';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: NavigationItem[];
  badge?: {
    value: string | number;
    color: 'primary' | 'warning' | 'error' | 'success';
  };
  permission?: string;
  external?: boolean;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'boukii-layout-base',
  template: `
    <div class="boukii-layout" [class.boukii-layout--mobile-sidebar-open]="isMobileSidebarOpen">

      <!-- Skip Links for Accessibility -->
      <div class="boukii-skip-links">
        <a href="#main-content" class="boukii-skip-link">
          {{ 'layout.skip_to_content' | translate }}
        </a>
        <a href="#sidebar-nav" class="boukii-skip-link">
          {{ 'layout.skip_to_navigation' | translate }}
        </a>
      </div>

      <!-- Sidebar -->
      <nav class="boukii-sidebar"
           [class.boukii-sidebar--open]="isMobileSidebarOpen"
           [class.boukii-sidebar--collapsed]="isDesktopSidebarCollapsed"
           [attr.aria-label]="'layout.main_navigation' | translate"
           id="sidebar-nav">

        <!-- Sidebar Header -->
        <div class="boukii-sidebar-header">
          <a href="/" class="boukii-sidebar-logo" [attr.aria-label]="'layout.go_to_homepage' | translate">
            <img [src]="logoSrc" [alt]="logoAlt" class="boukii-sidebar-logo-image" *ngIf="logoSrc">
            <span class="boukii-sidebar-logo-text">{{ appName }}</span>
          </a>

          <boukii-button
            *ngIf="isMobile"
            variant="ghost"
            size="small"
            [iconOnly]="true"
            iconLeading="close"
            [ariaLabel]="'layout.close_sidebar' | translate"
            class="boukii-sidebar-toggle"
            (buttonClick)="toggleMobileSidebar()">
          </boukii-button>
        </div>

        <!-- Sidebar Navigation -->
        <div class="boukii-sidebar-nav">
          <ng-container *ngFor="let section of navigationSections">
            <div class="boukii-nav-section" *ngIf="shouldShowNavSection(section)">
              <div class="boukii-nav-section-title" *ngIf="section.title">
                {{ section.title | translate }}
              </div>

              <ul class="boukii-nav-items" role="list">
                <li *ngFor="let item of section.items" role="listitem">

                  <!-- Regular Navigation Item -->
                  <a *ngIf="!item.children && !item.external"
                     [routerLink]="item.route"
                     routerLinkActive="boukii-nav-item--active"
                     [routerLinkActiveOptions]="{exact: false}"
                     class="boukii-nav-item"
                     [attr.aria-label]="item.label | translate"
                     [class.boukii-nav-item--disabled]="item.disabled"
                     (click)="onNavItemClick(item)">

                    <mat-icon class="boukii-nav-item-icon">{{ item.icon }}</mat-icon>
                    <span class="boukii-nav-item-text">{{ item.label | translate }}</span>

                    <!-- Badge -->
                    <span *ngIf="item.badge"
                          class="boukii-nav-item-badge"
                          [class]="'boukii-nav-item-badge--' + item.badge.color">
                      {{ item.badge.value }}
                    </span>
                  </a>

                  <!-- External Link -->
                  <a *ngIf="!item.children && item.external"
                     [href]="item.route"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="boukii-nav-item"
                     [attr.aria-label]="(item.label | translate) + ' (' + ('layout.opens_new_window' | translate) + ')'"
                     [class.boukii-nav-item--disabled]="item.disabled">

                    <mat-icon class="boukii-nav-item-icon">{{ item.icon }}</mat-icon>
                    <span class="boukii-nav-item-text">{{ item.label | translate }}</span>
                    <mat-icon class="boukii-nav-item-icon">open_in_new</mat-icon>
                  </a>

                  <!-- Submenu Item -->
                  <div *ngIf="item.children">
                    <button class="boukii-nav-item boukii-nav-item--submenu"
                            [class.boukii-nav-item--expanded]="isSubmenuExpanded(item.id)"
                            [attr.aria-expanded]="isSubmenuExpanded(item.id)"
                            [attr.aria-controls]="'submenu-' + item.id"
                            (click)="toggleSubmenu(item.id)">

                      <mat-icon class="boukii-nav-item-icon">{{ item.icon }}</mat-icon>
                      <span class="boukii-nav-item-text">{{ item.label | translate }}</span>
                      <mat-icon class="boukii-nav-item-arrow">chevron_right</mat-icon>
                    </button>

                    <!-- Submenu -->
                    <ul *ngIf="isSubmenuExpanded(item.id)"
                        class="boukii-nav-submenu"
                        [id]="'submenu-' + item.id"
                        role="list">
                      <li *ngFor="let subItem of item.children" role="listitem">
                        <a [routerLink]="subItem.route"
                           routerLinkActive="boukii-nav-item--active"
                           class="boukii-nav-item"
                           [attr.aria-label]="subItem.label | translate"
                           [class.boukii-nav-item--disabled]="subItem.disabled"
                           (click)="onNavItemClick(subItem)">

                          <mat-icon class="boukii-nav-item-icon">{{ subItem.icon }}</mat-icon>
                          <span class="boukii-nav-item-text">{{ subItem.label | translate }}</span>

                          <!-- Badge -->
                          <span *ngIf="subItem.badge"
                                class="boukii-nav-item-badge"
                                [class]="'boukii-nav-item-badge--' + subItem.badge.color">
                            {{ subItem.badge.value }}
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </ng-container>
        </div>

        <!-- Sidebar Footer -->
        <div class="boukii-sidebar-footer" *ngIf="currentUser">
          <div class="boukii-sidebar-user"
               (click)="onUserProfileClick()"
               [attr.aria-label]="'layout.user_profile' | translate"
               role="button"
               tabindex="0"
               (keydown.enter)="onUserProfileClick()"
               (keydown.space)="onUserProfileClick()">

            <img *ngIf="currentUser.avatar"
                 [src]="currentUser.avatar"
                 [alt]="currentUser.name"
                 class="boukii-sidebar-user-avatar">

            <div class="boukii-sidebar-user-info">
              <div class="boukii-sidebar-user-name">{{ currentUser.name }}</div>
              <div class="boukii-sidebar-user-role">{{ currentUser.role | translate }}</div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="boukii-main-content">

        <!-- Header -->
        <header class="boukii-header" role="banner">
          <div class="boukii-header-left">

            <!-- Mobile Menu Toggle -->
            <boukii-button
              *ngIf="isMobile"
              variant="ghost"
              size="medium"
              [iconOnly]="true"
              iconLeading="menu"
              [ariaLabel]="'layout.open_sidebar' | translate"
              class="boukii-header-menu-toggle"
              (buttonClick)="toggleMobileSidebar()">
            </boukii-button>

            <!-- Desktop Sidebar Toggle -->
            <boukii-button
              *ngIf="!isMobile && showSidebarToggle"
              variant="ghost"
              size="medium"
              [iconOnly]="true"
              [iconLeading]="isDesktopSidebarCollapsed ? 'menu_open' : 'menu'"
              [ariaLabel]="isDesktopSidebarCollapsed ? ('layout.expand_sidebar' | translate) : ('layout.collapse_sidebar' | translate)"
              class="boukii-header-sidebar-toggle"
              (buttonClick)="toggleDesktopSidebar()">
            </boukii-button>

            <!-- Breadcrumb -->
            <nav class="boukii-header-breadcrumb"
                 [attr.aria-label]="'layout.breadcrumb' | translate"
                 *ngIf="breadcrumbItems.length > 0">
              <ol class="boukii-breadcrumb">
                <li *ngFor="let item of breadcrumbItems; let last = last">
                  <a *ngIf="!last && item.route"
                     [routerLink]="item.route"
                     class="boukii-breadcrumb-item">
                    <mat-icon *ngIf="item.icon">{{ item.icon }}</mat-icon>
                    {{ item.label | translate }}
                  </a>

                  <span *ngIf="last"
                        class="boukii-breadcrumb-item boukii-breadcrumb-item--current"
                        [attr.aria-current]="'page'">
                    <mat-icon *ngIf="item.icon">{{ item.icon }}</mat-icon>
                    {{ item.label | translate }}
                  </span>

                  <mat-icon *ngIf="!last" class="boukii-breadcrumb-separator">chevron_right</mat-icon>
                </li>
              </ol>
            </nav>
          </div>

          <!-- Header Center - Search -->
          <div class="boukii-header-center" *ngIf="showSearch">
            <div class="boukii-header-search">
              <input type="search"
                     class="boukii-header-search-input"
                     [placeholder]="'layout.search_placeholder' | translate"
                     [value]="searchQuery"
                     (input)="onSearchInput($event)"
                     [attr.aria-label]="'layout.search' | translate"
                     #searchInput>

              <mat-icon class="boukii-header-search-icon">search</mat-icon>

              <kbd class="boukii-header-search-shortcut"
                   *ngIf="!isMobile"
                   [attr.aria-label]="'layout.search_shortcut' | translate">
                {{ searchShortcut }}
              </kbd>
            </div>
          </div>

          <!-- Header Right - Actions -->
          <div class="boukii-header-right">

            <!-- Notifications -->
            <div class="boukii-header-notification" *ngIf="showNotifications">
              <boukii-button
                variant="ghost"
                size="medium"
                [iconOnly]="true"
                iconLeading="notifications"
                [ariaLabel]="'layout.notifications' | translate"
                (buttonClick)="onNotificationsClick()">
              </boukii-button>

              <span *ngIf="notificationCount > 0"
                    class="boukii-header-notification-badge"
                    [attr.aria-label]="notificationCount + ' ' + ('layout.unread_notifications' | translate)">
                {{ notificationCount > 99 ? '99+' : notificationCount }}
              </span>
            </div>

            <!-- Language Selector -->
            <mat-select
              *ngIf="showLanguageSelector"
              class="boukii-header-language"
              [value]="currentLanguage"
              (selectionChange)="onLanguageChange($event.value)"
              [attr.aria-label]="'layout.select_language' | translate">
              <mat-option *ngFor="let lang of availableLanguages" [value]="lang.code">
                {{ lang.flag }} {{ lang.name }}
              </mat-option>
            </mat-select>

            <!-- Season Selector -->
            <mat-select
              *ngIf="showSeasonSelector && (seasons$ | async) as seasons"
              class="boukii-header-season"
              [value]="(currentSeason$ | async)?.id"
              (selectionChange)="onSeasonChange($event.value)"
              [attr.aria-label]="'layout.select_season' | translate">
              <mat-option *ngFor="let season of seasons" [value]="season.id">
                {{ season.name }}
              </mat-option>
            </mat-select>

            <!-- User Profile -->
            <div class="boukii-header-profile" *ngIf="currentUser">
              <button class="boukii-header-profile-button"
                      (click)="onUserProfileClick()"
                      [attr.aria-label]="'layout.user_menu' | translate">
                <img [src]="currentUser.avatar"
                     [alt]="currentUser.name"
                     class="boukii-header-profile-avatar"
                     *ngIf="currentUser.avatar">
              </button>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <main class="boukii-content"
              id="main-content"
              role="main"
              [attr.aria-label]="'layout.main_content' | translate">
          <ng-content></ng-content>
        </main>
      </div>

      <!-- Mobile Sidebar Overlay -->
      <div class="boukii-sidebar-overlay"
           [class.boukii-sidebar-overlay--visible]="isMobileSidebarOpen"
           (click)="closeMobileSidebar()"
           [attr.aria-hidden]="!isMobileSidebarOpen">
      </div>
    </div>
  `,
  styleUrls: ['./layout-base.component.scss']
})
export class BoukiiLayoutBaseComponent implements OnInit, OnDestroy {

  // ==================== INPUT PROPERTIES ====================

  @Input() appName = 'Boukii Admin';
  @Input() logoSrc?: string;
  @Input() logoAlt = 'Logo';
  @Input() navigationSections: { title?: string; items: NavigationItem[] }[] = [];
  @Input() breadcrumbItems: BreadcrumbItem[] = [];
  @Input() currentUser?: UserInfo;

  // Feature toggles
  @Input() showSearch = true;
  @Input() showNotifications = true;
  @Input() showLanguageSelector = true;
  @Input() showSeasonSelector = true;
  @Input() showSidebarToggle = true;
  @Input() searchShortcut = '⌘K';

  // ==================== OUTPUT EVENTS ====================

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() userProfileClick = new EventEmitter<void>();
  @Output() navItemClick = new EventEmitter<NavigationItem>();
  @Output() languageChange = new EventEmitter<string>();
  @Output() seasonChange = new EventEmitter<number>();
  @Output() sidebarToggle = new EventEmitter<boolean>();

  // ==================== COMPONENT STATE ====================

  public isMobile = false;
  public isMobileSidebarOpen = false;
  public isDesktopSidebarCollapsed = false;
  public searchQuery = '';
  public notificationCount = 0;
  public currentLanguage = 'es';
  public availableLanguages: any[] = [];
  public expandedSubmenus = new Set<string>();

  // Observables
  public currentSeason$: Observable<Season | null>;
  public seasons$: Observable<Season[]>;

  private destroy$ = new Subject<void>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // ==================== LIFECYCLE HOOKS ====================

  constructor(
    private breakpointObserver: BreakpointObserver,
    private seasonContext: SeasonContextService,
    private i18n: I18nService,
    private logger: LoggingService
  ) {
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.setupBreakpointObserver();
    this.setupKeyboardShortcuts();
    this.initializeLanguages();
    this.logger.info('Layout base component initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;
    this.seasons$ = this.seasonContext.seasons$;

    // Update current language when i18n service changes
    this.i18n.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang.code;
      });
  }

  private setupBreakpointObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;

        // Close mobile sidebar when switching to desktop
        if (!this.isMobile && this.isMobileSidebarOpen) {
          this.isMobileSidebarOpen = false;
        }
      });
  }

  private setupKeyboardShortcuts(): void {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Search shortcut (Cmd/Ctrl + K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        this.focusSearch();
      }

      // Escape to close mobile sidebar
      if (event.key === 'Escape' && this.isMobileSidebarOpen) {
        this.closeMobileSidebar();
      }
    });
  }

  private initializeLanguages(): void {
    this.availableLanguages = this.i18n.getAvailableLanguages();
  }

  // ==================== SIDEBAR MANAGEMENT ====================

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;

    // Manage body scroll when sidebar is open
    if (this.isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    this.logger.debug('Mobile sidebar toggled', { isOpen: this.isMobileSidebarOpen });
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
    document.body.style.overflow = '';
  }

  toggleDesktopSidebar(): void {
    this.isDesktopSidebarCollapsed = !this.isDesktopSidebarCollapsed;
    this.sidebarToggle.emit(this.isDesktopSidebarCollapsed);

    // Store preference in localStorage
    localStorage.setItem('boukii-sidebar-collapsed', this.isDesktopSidebarCollapsed.toString());

    this.logger.debug('Desktop sidebar toggled', { isCollapsed: this.isDesktopSidebarCollapsed });
  }

  toggleSubmenu(itemId: string): void {
    if (this.expandedSubmenus.has(itemId)) {
      this.expandedSubmenus.delete(itemId);
    } else {
      this.expandedSubmenus.add(itemId);
    }
  }

  isSubmenuExpanded(itemId: string): boolean {
    return this.expandedSubmenus.has(itemId);
  }

  // ==================== NAVIGATION ====================

  shouldShowNavSection(section: { title?: string; items: NavigationItem[] }): boolean {
    return section.items.some(item => !item.disabled);
  }

  onNavItemClick(item: NavigationItem): void {
    // Close mobile sidebar after navigation
    if (this.isMobile) {
      this.closeMobileSidebar();
    }

    this.navItemClick.emit(item);
    this.logger.debug('Navigation item clicked', { item: item.id });
  }

  // ==================== SEARCH ====================

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchQueryChange.emit(this.searchQuery);
  }

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // ==================== USER INTERACTIONS ====================

  onNotificationsClick(): void {
    this.notificationsClick.emit();
  }

  onUserProfileClick(): void {
    this.userProfileClick.emit();
  }

  onLanguageChange(languageCode: string): void {
    this.i18n.setLanguage(languageCode);
    this.languageChange.emit(languageCode);
    this.logger.info('Language changed', { language: languageCode });
  }

  onSeasonChange(seasonId: number): void {
    this.seasonContext.setCurrentSeason(seasonId);
    this.seasonChange.emit(seasonId);
    this.logger.info('Season changed', { seasonId });
  }

  // ==================== WINDOW EVENTS ====================

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    // Handle responsive behavior if needed
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close mobile sidebar when clicking outside on mobile
    if (this.isMobile && this.isMobileSidebarOpen) {
      const target = event.target as Element;
      const sidebar = document.querySelector('.boukii-sidebar');
      const toggle = document.querySelector('.boukii-header-menu-toggle');

      if (sidebar && !sidebar.contains(target) && toggle && !toggle.contains(target)) {
        this.closeMobileSidebar();
      }
    }
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Set the breadcrumb items
   */
  setBreadcrumb(items: BreadcrumbItem[]): void {
    this.breadcrumbItems = items;
  }

  /**
   * Add a breadcrumb item
   */
  addBreadcrumbItem(item: BreadcrumbItem): void {
    this.breadcrumbItems.push(item);
  }

  /**
   * Set the notification count
   */
  setNotificationCount(count: number): void {
    this.notificationCount = count;
  }

  /**
   * Set search query programmatically
   */
  setSearchQuery(query: string): void {
    this.searchQuery = query;
    if (this.searchInput) {
      this.searchInput.nativeElement.value = query;
    }
  }

  /**
   * Get current sidebar state
   */
  getSidebarState(): { isMobileOpen: boolean; isDesktopCollapsed: boolean } {
    return {
      isMobileOpen: this.isMobileSidebarOpen,
      isDesktopCollapsed: this.isDesktopSidebarCollapsed
    };
  }
}
