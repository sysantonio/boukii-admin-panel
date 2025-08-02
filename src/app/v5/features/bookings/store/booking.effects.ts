import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, EMPTY } from 'rxjs';
import {
  map,
  mergeMap,
  catchError,
  switchMap,
  withLatestFrom,
  tap,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';

// Services
import { BookingWizardService } from '../services/booking-wizard.service';
import { BookingStateService } from '../services/booking-state.service';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoggingService } from '../../../core/services/logging.service';
import { I18nService } from '../../../core/services/i18n.service';
import { SeasonContextService } from '../../../core/services/season-context.service';

// Actions
import * as BookingActions from './booking.actions';

// State
import { BookingState } from './booking.reducer';

// Interfaces
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingSearchCriteria
} from '../models/booking.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

@Injectable()
export class BookingEffects {

  constructor(
    private actions$: Actions,
    private store: Store<{ bookings: BookingState }>,
    private bookingWizard: BookingWizardService,
    private bookingState: BookingStateService,
    private apiV5: ApiV5Service,
    private errorHandler: ErrorHandlerService,
    private logger: LoggingService,
    private i18n: I18nService,
    private seasonContext: SeasonContextService
  ) {}

  // ==================== BOOKING LIST EFFECTS ====================

  loadBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadBookings),
      debounceTime(300),
      withLatestFrom(this.store.select(state => state.bookings.searchCriteria)),
      switchMap(([action, currentCriteria]) => {
        const criteria = { ...currentCriteria, ...action.criteria };

        this.logger.info('Loading bookings', criteria);

        return this.apiV5.get<ApiResponse<{
          bookings: Booking[];
          total_count: number;
          current_page: number;
        }>>('bookings', { params: this.buildQueryParams(criteria) }).pipe(
          map(response => {
            if (!response?.data) {
              throw new Error('Invalid bookings response');
            }

            return BookingActions.loadBookingsSuccess({
              bookings: response.data.bookings,
              totalCount: response.data.total_count,
              page: response.data.current_page
            });
          }),
          catchError(error => {
            this.logger.error('Failed to load bookings', { criteria, error });
            return of(BookingActions.loadBookingsFailure({ error }));
          })
        );
      })
    )
  );

  refreshBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.refreshBookings),
      withLatestFrom(this.store.select(state => state.bookings.searchCriteria)),
      switchMap(([_, criteria]) =>
        of(BookingActions.loadBookings({ criteria }))
      )
    )
  );

  // ==================== BOOKING DETAILS EFFECTS ====================

  loadBookingDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadBookingDetails),
      switchMap(action =>
        this.apiV5.get<ApiResponse<Booking>>(`bookings/${action.id}`).pipe(
          map(response => {
            if (!response?.data) {
              throw new Error('Booking not found');
            }
            return BookingActions.loadBookingDetailsSuccess({ booking: response.data });
          }),
          catchError(error => {
            this.logger.error('Failed to load booking details', { id: action.id, error });
            return of(BookingActions.loadBookingDetailsFailure({ error }));
          })
        )
      )
    )
  );

  // ==================== BOOKING CRUD EFFECTS ====================

  createBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.createBooking),
      switchMap(action => {
        this.logger.info('Creating booking', action.bookingData);

        return this.bookingWizard.createBooking(action.bookingData).pipe(
          map(booking => {
            this.logger.info('Booking created successfully', { bookingId: booking.id });
            return BookingActions.createBookingSuccess({ booking });
          }),
          catchError(error => {
            this.logger.error('Failed to create booking', { bookingData: action.bookingData, error });
            this.errorHandler.handleError(error);
            return of(BookingActions.createBookingFailure({ error }));
          })
        );
      })
    )
  );

  updateBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.updateBooking),
      switchMap(action => {
        this.logger.info('Updating booking', action.bookingData);

        return this.bookingWizard.updateBooking(action.bookingData).pipe(
          map(booking => {
            this.logger.info('Booking updated successfully', { bookingId: booking.id });
            return BookingActions.updateBookingSuccess({ booking });
          }),
          catchError(error => {
            this.logger.error('Failed to update booking', { bookingData: action.bookingData, error });
            this.errorHandler.handleError(error);
            return of(BookingActions.updateBookingFailure({ error }));
          })
        );
      })
    )
  );

  deleteBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.deleteBooking),
      switchMap(action =>
        this.apiV5.delete(`bookings/${action.id}`).pipe(
          map(() => {
            this.logger.info('Booking deleted successfully', { bookingId: action.id });
            return BookingActions.deleteBookingSuccess({ id: action.id });
          }),
          catchError(error => {
            this.logger.error('Failed to delete booking', { id: action.id, error });
            this.errorHandler.handleError(error);
            return of(BookingActions.deleteBookingFailure({ error }));
          })
        )
      )
    )
  );

  // ==================== BOOKING STATUS EFFECTS ====================

  updateBookingStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.updateBookingStatus),
      switchMap(action =>
        this.apiV5.patch(`bookings/${action.id}/status`, {
          status: action.status,
          reason: action.reason
        }).pipe(
          map(() => {
            this.logger.info('Booking status updated', {
              bookingId: action.id,
              status: action.status,
              reason: action.reason
            });
            return BookingActions.updateBookingStatusSuccess({
              id: action.id,
              status: action.status
            });
          }),
          catchError(error => {
            this.logger.error('Failed to update booking status', {
              id: action.id,
              status: action.status,
              error
            });
            this.errorHandler.handleError(error);
            return of(BookingActions.updateBookingStatusFailure({ error }));
          })
        )
      )
    )
  );

  confirmBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.confirmBooking),
      switchMap(action =>
        of(BookingActions.updateBookingStatus({
          id: action.id,
          status: 'confirmed'
        }))
      )
    )
  );

  cancelBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.cancelBooking),
      switchMap(action =>
        of(BookingActions.updateBookingStatus({
          id: action.id,
          status: 'cancelled',
          reason: action.reason
        }))
      )
    )
  );

  /*checkInBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.checkInBooking),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.id}/check-in`, {
          participant_ids: action.participantIds
        }).pipe(
          map(() => BookingActions.updateBookingStatusSuccess({
            id: action.id,
            status: 'checked_in'
          })),
          catchError(error => of(BookingActions.updateBookingStatusFailure({ error })))
        )
      )
    )
  );

  completeBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.completeBooking),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.id}/complete`, {
          feedback: action.feedback
        }).pipe(
          map(() => BookingActions.updateBookingStatusSuccess({
            id: action.id,
            status: 'completed'
          })),
          catchError(error => of(BookingActions.updateBookingStatusFailure({ error })))
        )
      )
    )
  );*/

  // ==================== STATISTICS EFFECTS ====================

  loadBookingStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadBookingStats),
      switchMap(action => {
        const params: any = {};
        if (action.seasonId) params.season_id = action.seasonId.toString();
        if (action.dateFrom) params.date_from = action.dateFrom.toISOString();
        if (action.dateTo) params.date_to = action.dateTo.toISOString();

        return this.apiV5.get<ApiResponse<any>>('bookings/statistics', { params }).pipe(
          map(response => {
            if (!response?.data) {
              throw new Error('Invalid statistics response');
            }
            return BookingActions.loadBookingStatsSuccess({ stats: response.data });
          }),
          catchError(error => {
            this.logger.error('Failed to load booking statistics', { params, error });
            return of(BookingActions.loadBookingStatsFailure({ error }));
          })
        );
      })
    )
  );

  // ==================== BULK OPERATIONS EFFECTS ====================

  bulkUpdateBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.bulkUpdateBookings),
      switchMap(action =>
        this.apiV5.patch('bookings/bulk-update', {
          booking_ids: action.bookingIds,
          updates: action.updates
        }).pipe(
          map((response:any) => BookingActions.bulkUpdateBookingsSuccess({
            updatedBookings: response.data || []
          })),
          catchError(error => {
            this.logger.error('Failed to bulk update bookings', {
              bookingIds: action.bookingIds,
              updates: action.updates,
              error
            });
            return of(BookingActions.bulkUpdateBookingsFailure({ error }));
          })
        )
      )
    )
  );

  bulkDeleteBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.bulkDeleteBookings),
      switchMap(action =>
        this.apiV5.delete('bookings/bulk-delete', {
          body: { booking_ids: action.bookingIds }
        }).pipe(
          mergeMap(() => action.bookingIds.map(id =>
            BookingActions.deleteBookingSuccess({ id })
          )),
          catchError(error => of(BookingActions.setError({ error })))
        )
      )
    )
  );

  bulkCancelBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.bulkCancelBookings),
      switchMap(action =>
        of(BookingActions.bulkUpdateBookings({
          bookingIds: action.bookingIds,
          updates: {
            status: 'cancelled',
            internal_notes: action.reason
          }
        }))
      )
    )
  );

  bulkConfirmBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.bulkConfirmBookings),
      switchMap(action =>
        of(BookingActions.bulkUpdateBookings({
          bookingIds: action.bookingIds,
          updates: { status: 'confirmed' }
        }))
      )
    )
  );

  // ==================== PAYMENT EFFECTS ====================

 /* processPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.processPayment),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.bookingId}/payment`, {
          amount: action.amount,
          payment_method: action.paymentMethod,
          payment_details: action.paymentDetails
        }).pipe(
          map(response => {
            this.logger.info('Payment processed successfully', {
              bookingId: action.bookingId,
              amount: action.amount,
              paymentId: response.data.payment_id
            });
            return BookingActions.processPaymentSuccess({
              bookingId: action.bookingId,
              paymentId: response.data.payment_id,
              amount: action.amount
            });
          }),
          catchError(error => {
            this.logger.error('Payment processing failed', {
              bookingId: action.bookingId,
              amount: action.amount,
              error
            });
            this.errorHandler.handleError(error);
            return of(BookingActions.processPaymentFailure({ error }));
          })
        )
      )
    )
  );

  refundPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.refundPayment),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.bookingId}/refund`, {
          amount: action.amount,
          reason: action.reason
        }).pipe(
          map(() => {
            this.logger.info('Payment refunded successfully', {
              bookingId: action.bookingId,
              amount: action.amount,
              reason: action.reason
            });
            // Reload booking details to reflect refund status
            return BookingActions.loadBookingDetails({ id: action.bookingId });
          }),
          catchError(error => {
            this.logger.error('Refund processing failed', {
              bookingId: action.bookingId,
              error
            });
            this.errorHandler.handleError(error);
            return of(BookingActions.setError({ error }));
          })
        )
      )
    )
  );*/

  // ==================== NOTIFICATION EFFECTS ====================

  sendBookingConfirmation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.sendBookingConfirmation),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.bookingId}/send-confirmation`, []).pipe(
          tap(() => this.logger.info('Booking confirmation sent', { bookingId: action.bookingId })),
          map(() => EMPTY),
          catchError(error => {
            this.logger.error('Failed to send booking confirmation', {
              bookingId: action.bookingId,
              error
            });
            return EMPTY;
          })
        )
      )
    ), { dispatch: false }
  );

  sendBookingReminder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.sendBookingReminder),
      switchMap(action =>
        this.apiV5.post(`bookings/${action.bookingId}/send-reminder`, {
          reminder_type: action.reminderType
        }).pipe(
          tap(() => this.logger.info('Booking reminder sent', {
            bookingId: action.bookingId,
            reminderType: action.reminderType
          })),
          map(() => EMPTY),
          catchError(error => {
            this.logger.error('Failed to send booking reminder', {
              bookingId: action.bookingId,
              error
            });
            return EMPTY;
          })
        )
      )
    ), { dispatch: false }
  );

  // ==================== SEARCH AND FILTER EFFECTS ====================

  searchBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.searchBookings),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query),
      switchMap(action =>
        of(BookingActions.updateSearchCriteria({
          page: 1,
          reference_number: action.query.includes('#') ? action.query.replace('#', '') : undefined,
          client_name: !action.query.includes('#') ? action.query : undefined
        }))
      )
    )
  );

  filterBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.filterBookings),
      switchMap(action =>
        of(BookingActions.loadBookings({ criteria: { ...action.filters, page: 1 } }))
      )
    )
  );

  sortBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.sortBookings),
      switchMap(action =>
        of(BookingActions.loadBookings({
          criteria: {
            sort_by: action.sortBy as any,
            sort_order: action.sortOrder,
            page: 1
          }
        }))
      )
    )
  );

  // ==================== SEASON CONTEXT EFFECTS ====================

  seasonChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.seasonChanged),
      switchMap(action => [
        BookingActions.loadBookings({ criteria: { season_id: action.seasonId, page: 1 } }),
        BookingActions.loadBookingStats({ seasonId: action.seasonId })
      ])
    )
  );

  // ==================== REPORTING EFFECTS ====================

 /* generateBookingReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.generateBookingReport),
      switchMap(action =>
        this.apiV5.post<ApiResponse<{ report_url: string }>>('bookings/generate-report', {
          report_type: action.reportType,
          filters: action.filters,
          format: action.format
        }).pipe(
          map(response => {
            if (!response?.data?.report_url) {
              throw new Error('Invalid report response');
            }

            this.logger.info('Booking report generated', {
              reportType: action.reportType,
              format: action.format,
              reportUrl: response.data.report_url
            });

            return BookingActions.generateBookingReportSuccess({
              reportUrl: response.data.report_url,
              reportType: action.reportType
            });
          }),
          catchError(error => {
            this.logger.error('Failed to generate booking report', {
              reportType: action.reportType,
              error
            });
            this.errorHandler.handleError(error);
            return of(BookingActions.generateBookingReportFailure({ error }));
          })
        )
      )
    )
  );*/

  // ==================== SUCCESS SIDE EFFECTS ====================

  // Refresh bookings list after successful operations
  refreshAfterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BookingActions.createBookingSuccess,
        BookingActions.updateBookingSuccess,
        BookingActions.deleteBookingSuccess,
        BookingActions.bulkUpdateBookingsSuccess
      ),
      debounceTime(1000), // Debounce to avoid multiple rapid refreshes
      switchMap(() => of(BookingActions.refreshBookings()))
    )
  );

  // Load booking stats when season changes or after booking operations
  loadStatsAfterChanges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BookingActions.createBookingSuccess,
        BookingActions.updateBookingStatusSuccess,
        BookingActions.deleteBookingSuccess
      ),
      debounceTime(2000),
      withLatestFrom(this.seasonContext.currentSeason$),
      switchMap(([_, season]) => {
        if (season) {
          return of(BookingActions.loadBookingStats({ seasonId: season.id }));
        }
        return EMPTY;
      })
    )
  );

  // ==================== UTILITY METHODS ====================

  private buildQueryParams(criteria: Partial<BookingSearchCriteria>): any {
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
