import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, filter } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { 
  Booking, 
  BookingSearchCriteria, 
  BookingStats,
  BookingSortField,
  BookingStatus,
  PaymentStatus 
} from '../models/booking.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  // ==================== STATE SUBJECTS ====================

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  private selectedBookingSubject = new BehaviorSubject<Booking | null>(null);
  public selectedBooking$ = this.selectedBookingSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private searchCriteriaSubject = new BehaviorSubject<BookingSearchCriteria>({
    page: 1,
    limit: 25,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  public searchCriteria$ = this.searchCriteriaSubject.asObservable();

  private totalCountSubject = new BehaviorSubject<number>(0);
  public totalCount$ = this.totalCountSubject.asObservable();

  private statsSubject = new BehaviorSubject<BookingStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // ==================== COMPUTED OBSERVABLES ====================

  public filteredBookings$ = combineLatest([
    this.bookings$,
    this.searchCriteria$
  ]).pipe(
    map(([bookings, criteria]) => this.applyClientSideFilters(bookings, criteria)),
    distinctUntilChanged()
  );

  public paginationInfo$ = combineLatest([
    this.totalCount$,
    this.searchCriteria$
  ]).pipe(
    map(([total, criteria]) => ({
      currentPage: criteria.page || 1,
      pageSize: criteria.limit || 25,
      totalItems: total,
      totalPages: Math.ceil(total / (criteria.limit || 25)),
      startItem: ((criteria.page || 1) - 1) * (criteria.limit || 25) + 1,
      endItem: Math.min((criteria.page || 1) * (criteria.limit || 25), total)
    }))
  );

  public hasData$ = this.bookings$.pipe(
    map(bookings => bookings.length > 0)
  );

  public isEmpty$ = combineLatest([
    this.bookings$,
    this.loading$
  ]).pipe(
    map(([bookings, loading]) => !loading && bookings.length === 0)
  );

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService
  ) {
    this.initializeService();
  }

  // ==================== INITIALIZATION ====================

  private initializeService(): void {
    // React to season changes
    this.seasonContext.currentSeason$.pipe(
      filter(season => !!season)
    ).subscribe(season => {
      this.updateSearchCriteria({ season_id: season!.id, page: 1 });
      this.loadBookings();
    });

    this.logger.info('Booking state service initialized');
  }

  // ==================== BOOKING MANAGEMENT ====================

  async loadBookings(criteria?: Partial<BookingSearchCriteria>): Promise<void> {
    if (criteria) {
      this.updateSearchCriteria(criteria);
    }

    const currentCriteria = this.searchCriteriaSubject.value;
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const response = await this.apiV5.get<ApiResponse<{
        bookings: Booking[];
        total_count: number;
        current_page: number;
      }>>('bookings', { 
        params: this.buildQueryParams(currentCriteria) 
      }).toPromise();

      if (!response?.data) {
        throw new Error('Invalid bookings response');
      }

      this.bookingsSubject.next(response.data.bookings);
      this.totalCountSubject.next(response.data.total_count);
      
      this.logger.info('Bookings loaded successfully', {
        count: response.data.bookings.length,
        totalCount: response.data.total_count,
        page: response.data.current_page
      });

    } catch (error) {
      this.logger.error('Failed to load bookings', { criteria: currentCriteria, error });
      this.errorSubject.next('Failed to load bookings');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadBookingById(id: number): Promise<Booking> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const response = await this.apiV5.get<ApiResponse<Booking>>(`bookings/${id}`).toPromise();

      if (!response?.data) {
        throw new Error('Booking not found');
      }

      const booking = response.data;
      this.selectedBookingSubject.next(booking);
      
      // Update booking in the list if it exists
      const currentBookings = this.bookingsSubject.value;
      const updatedBookings = currentBookings.map(b => b.id === booking.id ? booking : b);
      if (updatedBookings !== currentBookings) {
        this.bookingsSubject.next(updatedBookings);
      }

      this.logger.info('Booking loaded successfully', { id });
      return booking;

    } catch (error) {
      this.logger.error('Failed to load booking', { id, error });
      this.errorSubject.next('Failed to load booking details');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateBookingStatus(id: number, status: BookingStatus, reason?: string): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.apiV5.patch(`bookings/${id}/status`, {
        status,
        reason
      }).toPromise();

      // Update booking in state
      this.updateBookingInState(id, { status });
      
      this.logger.info('Booking status updated', { id, status, reason });

    } catch (error) {
      this.logger.error('Failed to update booking status', { id, status, error });
      this.errorSubject.next('Failed to update booking status');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteBooking(id: number): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.apiV5.delete(`bookings/${id}`).toPromise();

      // Remove booking from state
      const currentBookings = this.bookingsSubject.value;
      const updatedBookings = currentBookings.filter(b => b.id !== id);
      this.bookingsSubject.next(updatedBookings);

      // Clear selection if deleted booking was selected
      const selectedBooking = this.selectedBookingSubject.value;
      if (selectedBooking?.id === id) {
        this.selectedBookingSubject.next(null);
      }

      // Update total count
      const currentTotal = this.totalCountSubject.value;
      this.totalCountSubject.next(Math.max(0, currentTotal - 1));

      this.logger.info('Booking deleted successfully', { id });

    } catch (error) {
      this.logger.error('Failed to delete booking', { id, error });
      this.errorSubject.next('Failed to delete booking');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== SEARCH AND FILTERING ====================

  updateSearchCriteria(criteria: Partial<BookingSearchCriteria>): void {
    const currentCriteria = this.searchCriteriaSubject.value;
    const updatedCriteria = { ...currentCriteria, ...criteria };
    this.searchCriteriaSubject.next(updatedCriteria);
  }

  clearSearchCriteria(): void {
    this.searchCriteriaSubject.next({
      page: 1,
      limit: 25,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  }

  searchBookings(query: string): void {
    const isReference = query.startsWith('#');
    const searchValue = isReference ? query.substring(1) : query;

    this.updateSearchCriteria({
      page: 1,
      reference_number: isReference ? searchValue : undefined,
      client_name: !isReference && searchValue ? searchValue : undefined
    });
  }

  filterByStatus(statuses: BookingStatus[]): void {
    this.updateSearchCriteria({
      page: 1,
      status: statuses.length > 0 ? statuses : undefined
    });
  }

  filterByPaymentStatus(paymentStatuses: PaymentStatus[]): void {
    this.updateSearchCriteria({
      page: 1,
      payment_status: paymentStatuses.length > 0 ? paymentStatuses : undefined
    });
  }

  filterByDateRange(dateFrom?: Date, dateTo?: Date): void {
    this.updateSearchCriteria({
      page: 1,
      date_from: dateFrom,
      date_to: dateTo
    });
  }

  sortBookings(sortBy: BookingSortField, sortOrder: 'asc' | 'desc' = 'desc'): void {
    this.updateSearchCriteria({
      page: 1,
      sort_by: sortBy,
      sort_order: sortOrder
    });
  }

  // ==================== PAGINATION ====================

  goToPage(page: number): void {
    this.updateSearchCriteria({ page });
    this.loadBookings();
  }

  changePageSize(pageSize: number): void {
    this.updateSearchCriteria({ 
      limit: pageSize,
      page: 1 // Reset to first page when changing page size
    });
    this.loadBookings();
  }

  nextPage(): void {
    const currentCriteria = this.searchCriteriaSubject.value;
    const currentPage = currentCriteria.page || 1;
    const totalCount = this.totalCountSubject.value;
    const pageSize = currentCriteria.limit || 25;
    const maxPage = Math.ceil(totalCount / pageSize);

    if (currentPage < maxPage) {
      this.goToPage(currentPage + 1);
    }
  }

  previousPage(): void {
    const currentCriteria = this.searchCriteriaSubject.value;
    const currentPage = currentCriteria.page || 1;

    if (currentPage > 1) {
      this.goToPage(currentPage - 1);
    }
  }

  // ==================== STATISTICS ====================

  async loadStats(seasonId?: number, dateFrom?: Date, dateTo?: Date): Promise<BookingStats> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const params: any = {};
      if (seasonId) params.season_id = seasonId.toString();
      if (dateFrom) params.date_from = dateFrom.toISOString();
      if (dateTo) params.date_to = dateTo.toISOString();

      const response = await this.apiV5.get<ApiResponse<BookingStats>>('bookings/statistics', {
        params
      }).toPromise();

      if (!response?.data) {
        throw new Error('Invalid statistics response');
      }

      const stats = response.data;
      this.statsSubject.next(stats);
      
      this.logger.info('Booking statistics loaded', { seasonId, dateFrom, dateTo });
      return stats;

    } catch (error) {
      this.logger.error('Failed to load booking statistics', { seasonId, dateFrom, dateTo, error });
      this.errorSubject.next('Failed to load statistics');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== SELECTION MANAGEMENT ====================

  selectBooking(booking: Booking): void {
    this.selectedBookingSubject.next(booking);
    this.logger.debug('Booking selected', { id: booking.id });
  }

  clearSelection(): void {
    this.selectedBookingSubject.next(null);
    this.logger.debug('Booking selection cleared');
  }

  // ==================== ERROR HANDLING ====================

  clearError(): void {
    this.errorSubject.next(null);
  }

  setError(error: string): void {
    this.errorSubject.next(error);
  }

  // ==================== CACHE MANAGEMENT ====================

  refreshBookings(): void {
    this.loadBookings();
  }

  addBookingToState(booking: Booking): void {
    const currentBookings = this.bookingsSubject.value;
    this.bookingsSubject.next([booking, ...currentBookings]);
    this.totalCountSubject.next(this.totalCountSubject.value + 1);
  }

  updateBookingInState(id: number, updates: Partial<Booking>): void {
    const currentBookings = this.bookingsSubject.value;
    const updatedBookings = currentBookings.map(booking =>
      booking.id === id ? { ...booking, ...updates } : booking
    );
    this.bookingsSubject.next(updatedBookings);

    // Update selected booking if it matches
    const selectedBooking = this.selectedBookingSubject.value;
    if (selectedBooking?.id === id) {
      this.selectedBookingSubject.next({ ...selectedBooking, ...updates });
    }
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateStatus(bookingIds: number[], status: BookingStatus, reason?: string): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.apiV5.patch('bookings/bulk-update-status', {
        booking_ids: bookingIds,
        status,
        reason
      }).toPromise();

      // Update bookings in state
      bookingIds.forEach(id => {
        this.updateBookingInState(id, { status });
      });

      this.logger.info('Bulk status update completed', { 
        bookingIds, 
        status, 
        count: bookingIds.length 
      });

    } catch (error) {
      this.logger.error('Failed to bulk update booking status', { 
        bookingIds, 
        status, 
        error 
      });
      this.errorSubject.next('Failed to update booking statuses');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async bulkDelete(bookingIds: number[]): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      await this.apiV5.delete('bookings/bulk-delete', {
        body: { booking_ids: bookingIds }
      }).toPromise();

      // Remove bookings from state
      const currentBookings = this.bookingsSubject.value;
      const updatedBookings = currentBookings.filter(b => !bookingIds.includes(b.id));
      this.bookingsSubject.next(updatedBookings);

      // Update total count
      const currentTotal = this.totalCountSubject.value;
      this.totalCountSubject.next(Math.max(0, currentTotal - bookingIds.length));

      this.logger.info('Bulk delete completed', { bookingIds, count: bookingIds.length });

    } catch (error) {
      this.logger.error('Failed to bulk delete bookings', { bookingIds, error });
      this.errorSubject.next('Failed to delete bookings');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // ==================== UTILITY METHODS ====================

  getCurrentBookings(): Booking[] {
    return this.bookingsSubject.value;
  }

  getCurrentSearchCriteria(): BookingSearchCriteria {
    return this.searchCriteriaSubject.value;
  }

  getBookingById(id: number): Booking | undefined {
    return this.bookingsSubject.value.find(booking => booking.id === id);
  }

  // ==================== PRIVATE METHODS ====================

  private applyClientSideFilters(bookings: Booking[], criteria: BookingSearchCriteria): Booking[] {
    let filtered = [...bookings];

    // Apply client-side filters if needed (for additional filtering not handled by backend)
    
    return filtered;
  }

  private buildQueryParams(criteria: BookingSearchCriteria): any {
    const params: any = {};

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          params[key] = value.join(',');
        } else {
          params[key] = value.toString();
        }
      }
    });

    return params;
  }
}