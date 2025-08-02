import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

// Core Services
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';

// Interfaces
import { Booking, BookingStatus, PaymentStatus } from '../models/booking.interface';
import { BookingFilters, BookingStats } from '../components/booking-list-season/booking-list-season.component';

export interface BookingListResponse {
  data: Booking[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface BookingListParams {
  season_id?: string;
  page?: number;
  page_size?: number;
  search?: string;
  status?: string[];
  course_group_id?: number;
  client_id?: number;
  monitor_id?: number;
  location_id?: number;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort?: string;
  sort_direction?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(
    private api: ApiV5Service,
    private http: HttpClient,
    private seasonContext: SeasonContextService
  ) {}

  // ==================== BOOKING CRUD OPERATIONS ====================

  getBookings(params: BookingListParams = {}): Observable<BookingListResponse> {
    // Build query parameters with proper handling
    let httpParams = new HttpParams();
    
    // Add season and school context
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    // Pagination
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('limit', params.page_size.toString());
    
    // Sorting  
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.sort_direction) httpParams = httpParams.set('sort_direction', params.sort_direction);
    
    // Search and filters
    if (params.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    
    // Status filters - handle array properly
    if (params.status && params.status.length > 0) {
      params.status.forEach(status => {
        httpParams = httpParams.append('status[]', status);
      });
    }
    
    if (params.payment_status) httpParams = httpParams.set('payment_status', params.payment_status);
    
    // Date filters
    if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
    if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
    
    // Entity filters
    if (params.client_id) httpParams = httpParams.set('client_id', params.client_id.toString());
    if (params.course_group_id) httpParams = httpParams.set('course_group_id', params.course_group_id.toString());
    if (params.monitor_id) httpParams = httpParams.set('monitor_id', params.monitor_id.toString());
    if (params.location_id) httpParams = httpParams.set('location_id', params.location_id.toString());
    
    // Amount filters
    if (params.min_amount !== undefined) httpParams = httpParams.set('min_amount', params.min_amount.toString());
    if (params.max_amount !== undefined) httpParams = httpParams.set('max_amount', params.max_amount.toString());

    return this.api.get<any>('v5/bookings', httpParams).pipe(
      map(response => {
        // Transform V5 API response to expected format
        if (response.success) {
          return {
            data: response.data.bookings || [],
            total: response.data.pagination?.total || 0,
            page: response.data.pagination?.current_page || 1,
            page_size: response.data.pagination?.per_page || 25,
            pages: response.data.pagination?.last_page || 1
          };
        }
        return {
          data: [],
          total: 0,
          page: 1,
          page_size: 25,
          pages: 1
        };
      })
    );
  }

  getBookingStats(filters: BookingFilters = {}): Observable<BookingStats> {
    let httpParams = new HttpParams();
    
    // Add season and school context
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    // Handle status array properly
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        httpParams = httpParams.append('status[]', status);
      });
    }
    
    // Date filters
    if (filters.date_from) {
      const dateStr = filters.date_from instanceof Date 
        ? filters.date_from.toISOString().split('T')[0]
        : filters.date_from;
      httpParams = httpParams.set('date_from', dateStr);
    }
    
    if (filters.date_to) {
      const dateStr = filters.date_to instanceof Date 
        ? filters.date_to.toISOString().split('T')[0]
        : filters.date_to;
      httpParams = httpParams.set('date_to', dateStr);
    }
    
    // Other filters
    if (filters.course_group_id) httpParams = httpParams.set('course_group_id', filters.course_group_id.toString());
    if (filters.monitor_id) httpParams = httpParams.set('monitor_id', filters.monitor_id.toString());
    if (filters.payment_status) httpParams = httpParams.set('payment_status', filters.payment_status);

    return this.api.get<any>('v5/bookings/stats', httpParams).pipe(
      map(response => {
        // Transform V5 API response to expected format
        if (response.success) {
          return response.data.stats;
        }
        return {
          total_bookings: 0,
          confirmed_bookings: 0,
          pending_bookings: 0,
          cancelled_bookings: 0,
          total_revenue: 0,
          pending_revenue: 0
        };
      })
    );
  }

  getBookingById(id: number): Observable<Booking> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    return this.api.get<any>(`v5/bookings/${id}`, httpParams).pipe(
      map(response => {
        if (response.success) {
          return response.data.booking;
        }
        throw new Error('Booking not found');
      })
    );
  }

  createBooking(bookingData: Partial<Booking>): Observable<Booking> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    
    const payload = {
      ...bookingData,
      season_id: currentSeasonId
    };
    
    return this.api.post<any>('v5/bookings', payload).pipe(
      map(response => {
        if (response.success) {
          return response.data.booking;
        }
        throw new Error('Failed to create booking');
      })
    );
  }

  updateBooking(id: number, bookingData: Partial<Booking>): Observable<Booking> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    
    const payload = {
      ...bookingData,
      season_id: currentSeasonId
    };
    
    return this.api.put<any>(`v5/bookings/${id}`, payload).pipe(
      map(response => {
        if (response.success) {
          return response.data.booking;
        }
        throw new Error('Failed to update booking');
      })
    );
  }

  updateBookingStatus(id: number, status: BookingStatus, reason?: string): Observable<Booking> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    
    const payload = {
      status,
      reason,
      season_id: currentSeasonId
    };
    
    return this.api.patch<any>(`v5/bookings/${id}/status`, payload).pipe(
      map(response => {
        if (response.success) {
          return response.data.booking;
        }
        throw new Error('Failed to update booking status');
      })
    );
  }

  deleteBooking(id: number, reason?: string): Observable<void> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();
    
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    if (reason) {
      httpParams = httpParams.set('reason', reason);
    }
    
    return this.api.delete<any>(`v5/bookings/${id}`, httpParams).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to delete booking');
        }
      })
    );
  }

  // ==================== BOOKING ACTIONS ====================

  sendBookingConfirmation(id: number): Observable<void> {
    return this.api.post<void>(`v5/notifications/`, {
      type: 'booking_confirmation',
      booking_id: id
    });
  }

  cancelBooking(id: number, reason?: string): Observable<Booking> {
    return this.updateBookingStatus(id, 'cancelled' as BookingStatus, reason);
  }

  confirmBooking(id: number): Observable<Booking> {
    return this.updateBookingStatus(id, 'confirmed' as BookingStatus);
  }

  getUpcomingBookings(days: number = 7, limit: number = 20): Observable<Booking[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams().set('days', days.toString()).set('limit', limit.toString());
    
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    return this.api.get<any>('v5/bookings/upcoming', httpParams).pipe(
      map(response => {
        if (response.success) {
          return response.data.bookings || [];
        }
        return [];
      })
    );
  }

  getBookingsRequiringAttention(): Observable<any> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams();
    
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    return this.api.get<any>('v5/bookings/attention', httpParams).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        return {
          expired_pending: [],
          unpaid_confirmed: [],
          starting_soon: []
        };
      })
    );
  }

  // ==================== SEARCH AND FILTERS ====================

  searchBookings(query: string, limit: number = 20): Observable<Booking[]> {
    const currentSeasonId = this.seasonContext.getCurrentSeasonId();
    let httpParams = new HttpParams().set('q', query).set('limit', limit.toString());
    
    if (currentSeasonId) {
      httpParams = httpParams.set('season_id', currentSeasonId.toString());
    }
    
    return this.api.get<any>('v5/bookings/search', httpParams).pipe(
      map(response => {
        if (response.success) {
          return response.data.bookings || [];
        }
        return [];
      })
    );
  }

  getFilterOptions(): Observable<any> {
    return this.api.get<any>('bookings/filters');
  }

  // ==================== EXPORT ====================

  exportBookings(bookingIds?: number[]): Observable<Blob> {
    const params = bookingIds ? { booking_ids: bookingIds } : {};
    return this.api.post<Blob>('export/bookings', params);
  }

  // ==================== VALIDATION ====================

  validateBookingData(bookingData: Partial<Booking>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bookingData.client) {
      errors.push('Client is required');
    }

    if (!bookingData.course_group) {
      errors.push('Course is required');
    }

    if (!bookingData.course_date) {
      errors.push('Course date is required');
    }

    if (!bookingData.total_participants || bookingData.total_participants < 1) {
      errors.push('At least 1 participant is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
