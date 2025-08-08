import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TrackByFunction, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, startWith, switchMap, map, catchError, finalize } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExportService } from '../../../../core/services/export.service';

// V5 Booking Services
import { BookingService } from '../../services/booking.service';
import { BookingStateService } from '../../services/booking-state.service';

// V5 Shared Services
import { ClientService } from '../../../clients/services/client.service';
import { MonitorService } from '../../../monitors/services/monitor.service';
import { CourseService } from '../../../courses/services/course.service';

// Interfaces
import { Season } from '../../../../core/models/season.interface';
import { Booking, BookingStatus, PaymentStatus } from '../../models/booking.interface';
import { Client } from '../../../clients/models/client.interface';
import { Monitor } from '../../../monitors/models/monitor.interface';
import { CourseGroup } from '../../../courses/services/course.service';
import { Location } from '../../../../shared/models/location.interface';
import {LocationService} from '../../../../shared/services/location.service';

// Booking list interfaces
export interface BookingFilters {
  search?: string;
  status?: BookingStatus[];
  course_group_id?: number;
  client_search?: Client;
  monitor_id?: number;
  location_id?: number;
  payment_status?: PaymentStatus;
  date_range?: string;
  date_from?: string; // Changed to string to match API expectation
  date_to?: string; // Changed to string to match API expectation
  min_amount?: number;
  max_amount?: number;
  participants_range?: string;
  has_special_requirements?: boolean;
  recurring_only?: boolean;
  group_bookings_only?: boolean;
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_booking_value: number;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

export type BookingViewMode = 'list' | 'grid' | 'calendar';
export type BookingSortField = 'course_date' | 'created_at' | 'client_name' | 'total_amount' | 'status';
export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-booking-list-season',
  templateUrl: './booking-list-season.component.html',
  styleUrls: ['./booking-list-season.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: 0 }),
        animate('300ms ease-in', style({ opacity: 1, maxHeight: '500px' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, maxHeight: 0 }))
      ])
    ])
  ]
})
export class BookingListSeasonComponent implements OnInit, OnDestroy {

  // ==================== COMPONENT STATE ====================

  public isLoading = false;
  public showAdvancedFilters = false;
  public currentView: BookingViewMode = 'list';
  public sortBy: BookingSortField = 'course_date';
  public sortDirection: SortDirection = 'desc';

  // Pagination
  public currentPage = 1;
  public pageSize = 25;
  public totalBookings = 0;

  // Selection
  public selectedBookings = new Set<number>();

  // Form and Filters
  public filtersForm: FormGroup;
  public activeFilters: ActiveFilter[] = [];

  // Data
  public bookings: any[] = [];
  public bookingStats: BookingStats | null = null;

  // Supporting data
  public courseGroups: CourseGroup[] = [];
  public monitors: Monitor[] = [];
  public locations: Location[] = [];

  // Observables
  public currentSeason$: Observable<Season | null>;
  public filteredClients$: Observable<Client[]>;

  // Math reference for template
  public Math = Math;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new BehaviorSubject<string>('');

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  // ==================== CONSTRUCTOR & LIFECYCLE ====================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private seasonContext: SeasonContextService,
    private bookingService: BookingService,
    private bookingState: BookingStateService,
    private clientService: ClientService,
    private monitorService: MonitorService,
    private courseService: CourseService,
    private locationService: LocationService,
    private logger: LoggingService,
    private notification: NotificationService,
    private exportService: ExportService
  ) {
    this.initializeForm();
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.logger.info('BookingListSeasonComponent initialized');
    this.loadSupportingData();
    this.setupFormSubscriptions();
    this.loadBookings();
    this.loadBookingStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      // Basic filters
      search: [''],
      status: [[]],
      course_group_id: [''],
      date_range: [''],
      date_from: [''],
      date_to: [''],

      // Advanced filters
      client_search: [''],
      monitor_id: [''],
      location_id: [''],
      payment_status: [''],
      min_amount: [''],
      max_amount: [''],
      participants_range: [''],
      has_special_requirements: [false],
      recurring_only: [false],
      group_bookings_only: [false]
    });
  }

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;

    // Client autocomplete
    this.filteredClients$ = this.filtersForm.get('client_search')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | Client) => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.clientService.searchClients(value).pipe(
            catchError(error => {
              this.logger.error('Error searching clients', error);
              return EMPTY;
            })
          );
        }
        return EMPTY;
      })
    );
  }

  private setupFormSubscriptions(): void {
    // Watch for form changes to trigger search
    this.filtersForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onFiltersChange();
    });

    // Watch for search field specifically
    this.filtersForm.get('search')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onFiltersChange();
    });
  }

  // ==================== DATA LOADING ====================

  private loadSupportingData(): void {
    // Load course groups
    this.courseService.getCourseGroups().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error loading course groups', error);
        return EMPTY;
      })
    ).subscribe(groups => {
      this.courseGroups = groups;
    });

    // Load monitors
    this.monitorService.getMonitors().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error loading monitors', error);
        return EMPTY;
      })
    ).subscribe(monitors => {
      this.monitors = monitors;
    });

    // Load locations
    this.locationService.getLocations().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error loading locations', error);
        return EMPTY;
      })
    ).subscribe(locations => {
      this.locations = locations;
    });
  }

  private loadBookings(): void {
    this.isLoading = true;

    const filters = this.buildFiltersFromForm();

    combineLatest([
      this.currentSeason$,
      this.bookingService.getBookings({
        ...filters,
        page: this.currentPage,
        page_size: this.pageSize,
        sort: this.sortBy,
        sort_direction: this.sortDirection
      })
    ]).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(error => {
        this.logger.error('Error loading bookings', error);
        this.notification.showError('bookings.error_loading_bookings');
        return EMPTY;
      })
    ).subscribe(([season, response]) => {
      this.bookings = response.data;
      this.totalBookings = response.total;

      this.logger.debug('Bookings loaded', {
        count: this.bookings.length,
        total: this.totalBookings,
        season: season?.name
      });
    });
  }

  private loadBookingStats(): void {
    const filters = this.buildFiltersFromForm();

    this.bookingService.getBookingStats(filters).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error loading booking stats', error);
        return EMPTY;
      })
    ).subscribe(stats => {
      this.bookingStats = stats;
    });
  }

  private buildFiltersFromForm(): BookingFilters {
    const formValue = this.filtersForm.value;
    const filters: BookingFilters = {};

    // Basic filters
    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }

    if (formValue.status?.length > 0) {
      filters.status = formValue.status;
    }

    if (formValue.course_group_id) {
      filters.course_group_id = parseInt(formValue.course_group_id);
    }

    // Date range handling - convert dates to ISO strings for API
    if (formValue.date_range === 'custom') {
      if (formValue.date_from) {
        const date = new Date(formValue.date_from);
        filters.date_from = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      if (formValue.date_to) {
        const date = new Date(formValue.date_to);
        filters.date_to = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    } else if (formValue.date_range) {
      // Handle predefined date ranges
      const today = new Date();
      switch (formValue.date_range) {
        case 'today':
          filters.date_from = today.toISOString().split('T')[0];
          filters.date_to = today.toISOString().split('T')[0];
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          filters.date_from = weekStart.toISOString().split('T')[0];
          filters.date_to = weekEnd.toISOString().split('T')[0];
          break;
        // Add more predefined ranges as needed
      }
    }

    // Advanced filters
    if (formValue.client_search && typeof formValue.client_search === 'object') {
      // Client object selected from autocomplete
      filters.client_search = formValue.client_search;
    }

    if (formValue.monitor_id) {
      filters.monitor_id = parseInt(formValue.monitor_id);
    }

    if (formValue.location_id) {
      filters.location_id = parseInt(formValue.location_id);
    }

    if (formValue.payment_status) {
      filters.payment_status = formValue.payment_status;
    }

    if (formValue.min_amount) {
      filters.min_amount = parseFloat(formValue.min_amount);
    }

    if (formValue.max_amount) {
      filters.max_amount = parseFloat(formValue.max_amount);
    }

    if (formValue.participants_range) {
      filters.participants_range = formValue.participants_range;
    }

    // Boolean filters
    if (formValue.has_special_requirements) {
      filters.has_special_requirements = true;
    }

    if (formValue.recurring_only) {
      filters.recurring_only = true;
    }

    if (formValue.group_bookings_only) {
      filters.group_bookings_only = true;
    }

    return filters;
  }

  // ==================== EVENT HANDLERS ====================

  onFiltersChange(): void {
    this.currentPage = 1;
    this.updateActiveFilters();
    this.loadBookings();
    this.loadBookingStats();
  }

  onViewModeChange(mode: BookingViewMode): void {
    this.currentView = mode;
    this.logger.debug('View mode changed', { mode });
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  onBookingRowClick(booking: Booking): void {
    this.router.navigate(['/v5/bookings', booking.id]);
  }

  // ==================== FILTER MANAGEMENT ====================

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.showAdvancedFilters = false;
    this.activeFilters = [];
    this.currentPage = 1;
    this.loadBookings();
    this.loadBookingStats();
  }

  hasActiveFilters(): boolean {
    return this.activeFilters.length > 0;
  }

  removeFilter(filterKey: string): void {
    const control = this.filtersForm.get(filterKey);
    if (control) {
      if (Array.isArray(control.value)) {
        control.setValue([]);
      } else {
        control.setValue('');
      }
    }
  }

  private updateActiveFilters(): void {
    const filters: ActiveFilter[] = [];
    const formValue = this.filtersForm.value;

    // Add active filters to the array
    if (formValue.search?.trim()) {
      filters.push({
        key: 'search',
        label: 'bookings.search',
        value: formValue.search
      });
    }

    if (formValue.status?.length > 0) {
      filters.push({
        key: 'status',
        label: 'bookings.status',
        value: formValue.status.map((s: BookingStatus) => `bookings.status.${s}`).join(', ')
      });
    }

    // Add more filter mappings as needed...

    this.activeFilters = filters;
  }

  // ==================== SELECTION MANAGEMENT ====================

  toggleBookingSelection(bookingId: number): void {
    if (this.selectedBookings.has(bookingId)) {
      this.selectedBookings.delete(bookingId);
    } else {
      this.selectedBookings.add(bookingId);
    }
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedBookings.clear();
    } else {
      this.bookings.forEach(booking => {
        this.selectedBookings.add(booking.id);
      });
    }
  }

  isAllSelected(): boolean {
    return this.bookings.length > 0 && this.bookings.every(booking =>
      this.selectedBookings.has(booking.id)
    );
  }

  isPartiallySelected(): boolean {
    return this.selectedBookings.size > 0 && !this.isAllSelected();
  }

  clearSelection(): void {
    this.selectedBookings.clear();
  }

  // ==================== BULK ACTIONS ====================

  bulkSendEmails(): void {
    const selectedIds = Array.from(this.selectedBookings);
    // Implement bulk email sending
    this.logger.info('Bulk sending emails', { bookingIds: selectedIds });
    this.notification.showSuccess('bookings.emails_sent_successfully');
  }

  bulkExport(): void {
    const selectedBookings = this.bookings.filter(booking =>
      this.selectedBookings.has(booking.id)
    );

    this.exportService.exportBookings(selectedBookings).subscribe({
      next: () => {
        this.notification.showSuccess('bookings.export_successful');
      },
      error: (error) => {
        this.logger.error('Error exporting bookings', error);
        this.notification.showError('bookings.export_failed');
      }
    });
  }

  bulkCancel(): void {
    const selectedIds = Array.from(this.selectedBookings);
    // Implement bulk cancellation with confirmation
    this.logger.info('Bulk cancelling bookings', { bookingIds: selectedIds });
  }

  // ==================== BOOKING ACTIONS ====================

  refreshBookings(): void {
    this.loadBookings();
    this.loadBookingStats();
    this.notification.showSuccess('bookings.list_refreshed');
  }

  exportBookings(): void {
    const filters = this.buildFiltersFromForm();
    this.exportService.exportAllBookings(filters).subscribe({
      next: () => {
        this.notification.showSuccess('bookings.export_successful');
      },
      error: (error) => {
        this.logger.error('Error exporting all bookings', error);
        this.notification.showError('bookings.export_failed');
      }
    });
  }

  confirmBooking(booking: Booking): void {
    this.bookingService.updateBookingStatus(booking.id, 'confirmed').pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error confirming booking', error);
        this.notification.showError('bookings.error_confirming_booking');
        return EMPTY;
      })
    ).subscribe(() => {
      this.notification.showSuccess('bookings.booking_confirmed');
      this.loadBookings();
    });
  }

  cancelBooking(booking: Booking): void {
    // Show confirmation dialog first
    this.bookingService.updateBookingStatus(booking.id, 'cancelled').pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error cancelling booking', error);
        this.notification.showError('bookings.error_cancelling_booking');
        return EMPTY;
      })
    ).subscribe(() => {
      this.notification.showSuccess('bookings.booking_cancelled');
      this.loadBookings();
    });
  }

  duplicateBooking(booking: Booking): void {
    this.router.navigate(['/v5/bookings/new'], {
      queryParams: { duplicate: booking.id }
    });
  }

  sendBookingEmail(booking: Booking): void {
    this.bookingService.sendBookingConfirmation(booking.id).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error sending booking email', error);
        this.notification.showError('bookings.error_sending_email');
        return EMPTY;
      })
    ).subscribe(() => {
      this.notification.showSuccess('bookings.confirmation_email_sent');
    });
  }

  printBooking(booking: Booking): void {
    // Implement print functionality
    this.logger.info('Printing booking', { bookingId: booking.id });
  }

  deleteBooking(booking: Booking): void {
    // Show confirmation dialog first
    this.bookingService.deleteBooking(booking.id).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error deleting booking', error);
        this.notification.showError('bookings.error_deleting_booking');
        return EMPTY;
      })
    ).subscribe(() => {
      this.notification.showSuccess('bookings.booking_deleted');
      this.loadBookings();
    });
  }

  // ==================== UTILITY METHODS ====================

  canEditBooking(booking: Booking): boolean {
    return booking.status !== 'completed' && booking.status !== 'cancelled';
  }

  canCancelBooking(booking: Booking): boolean {
    return booking.status === 'pending_payment' || booking.status === 'confirmed';
  }

  canDeleteBooking(booking: Booking): boolean {
    return booking.status === 'cancelled' || booking.status === 'pending_payment';
  }

  getStatusIcon(status: BookingStatus): string {
    const statusIcons = {
      pending: 'schedule',
      confirmed: 'check_circle',
      cancelled: 'cancel',
      completed: 'task_alt',
      no_show: 'person_off'
    };
    return statusIcons[status] || 'help';
  }

  getClientInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getSpecialRequirementsTooltip(booking: Booking): string {
    const requirements: string[] = [];

    if (booking.special_requirements) {
      requirements.push(booking.special_requirements);
    }

    if (booking.accessibility_requirements) {
      requirements.push(booking.accessibility_requirements);
    }

    return requirements.join(', ') || 'Special requirements';
  }

  displayClientFn = (client: Client): string => {
    return client ? client.full_name : '';
  };

  // Track by function for ngFor performance
  trackByBookingId: TrackByFunction<Booking> = (index: number, booking: Booking) => {
    return booking.id;
  };
}
