import { createAction, props } from '@ngrx/store';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingSearchCriteria,
  BookingStats,
  BookingStatus,
  BookingWizardState
} from '../models/booking.interface';

// ==================== BOOKING LIST ACTIONS ====================

export const loadBookings = createAction(
  '[Booking] Load Bookings',
  props<{ criteria?: Partial<BookingSearchCriteria> }>()
);

export const loadBookingsSuccess = createAction(
  '[Booking] Load Bookings Success',
  props<{
    bookings: Booking[];
    totalCount: number;
    page?: number;
  }>()
);

export const loadBookingsFailure = createAction(
  '[Booking] Load Bookings Failure',
  props<{ error: any }>()
);

export const refreshBookings = createAction(
  '[Booking] Refresh Bookings'
);

// ==================== BOOKING DETAILS ACTIONS ====================

export const loadBookingDetails = createAction(
  '[Booking] Load Booking Details',
  props<{ id: number }>()
);

export const loadBookingDetailsSuccess = createAction(
  '[Booking] Load Booking Details Success',
  props<{ booking: Booking }>()
);

export const loadBookingDetailsFailure = createAction(
  '[Booking] Load Booking Details Failure',
  props<{ error: any }>()
);

// ==================== BOOKING CRUD ACTIONS ====================

export const createBooking = createAction(
  '[Booking] Create Booking',
  props<{ bookingData: CreateBookingRequest }>()
);

export const createBookingSuccess = createAction(
  '[Booking] Create Booking Success',
  props<{ booking: Booking }>()
);

export const createBookingFailure = createAction(
  '[Booking] Create Booking Failure',
  props<{ error: any }>()
);

export const updateBooking = createAction(
  '[Booking] Update Booking',
  props<{ bookingData: UpdateBookingRequest }>()
);

export const updateBookingSuccess = createAction(
  '[Booking] Update Booking Success',
  props<{ booking: Booking }>()
);

export const updateBookingFailure = createAction(
  '[Booking] Update Booking Failure',
  props<{ error: any }>()
);

export const deleteBooking = createAction(
  '[Booking] Delete Booking',
  props<{ id: number }>()
);

export const deleteBookingSuccess = createAction(
  '[Booking] Delete Booking Success',
  props<{ id: number }>()
);

export const deleteBookingFailure = createAction(
  '[Booking] Delete Booking Failure',
  props<{ error: any }>()
);

// ==================== BOOKING STATUS ACTIONS ====================

export const updateBookingStatus = createAction(
  '[Booking] Update Booking Status',
  props<{ id: number; status: BookingStatus; reason?: string }>()
);

export const updateBookingStatusSuccess = createAction(
  '[Booking] Update Booking Status Success',
  props<{ id: number; status: BookingStatus }>()
);

export const updateBookingStatusFailure = createAction(
  '[Booking] Update Booking Status Failure',
  props<{ error: any }>()
);

export const confirmBooking = createAction(
  '[Booking] Confirm Booking',
  props<{ id: number }>()
);

export const cancelBooking = createAction(
  '[Booking] Cancel Booking',
  props<{ id: number; reason: string }>()
);

export const checkInBooking = createAction(
  '[Booking] Check In Booking',
  props<{ id: number; participantIds?: number[] }>()
);

export const completeBooking = createAction(
  '[Booking] Complete Booking',
  props<{ id: number; feedback?: string }>()
);

// ==================== BOOKING WIZARD ACTIONS ====================

export const initializeWizard = createAction(
  '[Booking Wizard] Initialize',
  props<{ wizardState: BookingWizardState }>()
);

export const updateWizardState = createAction(
  '[Booking Wizard] Update State',
  props<{ updates: Partial<BookingWizardState> }>()
);

export const validateWizardStep = createAction(
  '[Booking Wizard] Validate Step',
  props<{ stepIndex: number; isValid: boolean; errors?: string[] }>()
);

export const proceedToNextStep = createAction(
  '[Booking Wizard] Proceed to Next Step'
);

export const goToPreviousStep = createAction(
  '[Booking Wizard] Go to Previous Step'
);

export const clearWizardState = createAction(
  '[Booking Wizard] Clear State'
);

// ==================== SEARCH AND FILTER ACTIONS ====================

export const updateSearchCriteria = createAction(
  '[Booking] Update Search Criteria',
  props<any>()
);

export const clearSearchCriteria = createAction(
  '[Booking] Clear Search Criteria'
);

export const searchBookings = createAction(
  '[Booking] Search Bookings',
  props<{ query: string }>()
);

export const filterBookings = createAction(
  '[Booking] Filter Bookings',
  props<{ filters: Partial<BookingSearchCriteria> }>()
);

export const sortBookings = createAction(
  '[Booking] Sort Bookings',
  props<{ sortBy: string; sortOrder: 'asc' | 'desc' }>()
);

// ==================== STATISTICS ACTIONS ====================

export const loadBookingStats = createAction(
  '[Booking] Load Booking Stats',
  props<{
    seasonId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }>()
);

export const loadBookingStatsSuccess = createAction(
  '[Booking] Load Booking Stats Success',
  props<{ stats: BookingStats }>()
);

export const loadBookingStatsFailure = createAction(
  '[Booking] Load Booking Stats Failure',
  props<{ error: any }>()
);

// ==================== BULK OPERATIONS ====================

export const bulkUpdateBookings = createAction(
  '[Booking] Bulk Update Bookings',
  props<{
    bookingIds: number[];
    updates: Partial<UpdateBookingRequest>
  }>()
);

export const bulkUpdateBookingsSuccess = createAction(
  '[Booking] Bulk Update Bookings Success',
  props<{ updatedBookings: Booking[] }>()
);

export const bulkUpdateBookingsFailure = createAction(
  '[Booking] Bulk Update Bookings Failure',
  props<{ error: any }>()
);

export const bulkDeleteBookings = createAction(
  '[Booking] Bulk Delete Bookings',
  props<{ bookingIds: number[] }>()
);

export const bulkCancelBookings = createAction(
  '[Booking] Bulk Cancel Bookings',
  props<{ bookingIds: number[]; reason: string }>()
);

export const bulkConfirmBookings = createAction(
  '[Booking] Bulk Confirm Bookings',
  props<{ bookingIds: number[] }>()
);

// ==================== PAYMENT ACTIONS ====================

export const processPayment = createAction(
  '[Booking] Process Payment',
  props<{
    bookingId: number;
    amount: number;
    paymentMethod: string;
    paymentDetails?: any
  }>()
);

export const processPaymentSuccess = createAction(
  '[Booking] Process Payment Success',
  props<{
    bookingId: number;
    paymentId: string;
    amount: number
  }>()
);

export const processPaymentFailure = createAction(
  '[Booking] Process Payment Failure',
  props<{ error: any }>()
);

export const refundPayment = createAction(
  '[Booking] Refund Payment',
  props<{
    bookingId: number;
    amount?: number;
    reason: string
  }>()
);

// ==================== NOTIFICATION ACTIONS ====================

export const sendBookingConfirmation = createAction(
  '[Booking] Send Booking Confirmation',
  props<{ bookingId: number }>()
);

export const sendBookingReminder = createAction(
  '[Booking] Send Booking Reminder',
  props<{ bookingId: number; reminderType: 'day_before' | 'hour_before' }>()
);

export const sendBookingCancellation = createAction(
  '[Booking] Send Booking Cancellation',
  props<{ bookingId: number; reason: string }>()
);

// ==================== CALENDAR INTEGRATION ====================

export const exportToCalendar = createAction(
  '[Booking] Export to Calendar',
  props<{ bookingIds: number[]; calendarType: 'ical' | 'google' | 'outlook' }>()
);

export const syncWithCalendar = createAction(
  '[Booking] Sync with Calendar',
  props<{ bookingId: number }>()
);

// ==================== SELECTION ACTIONS ====================

export const selectBooking = createAction(
  '[Booking] Select Booking',
  props<{ booking: Booking }>()
);

export const clearSelection = createAction(
  '[Booking] Clear Selection'
);

export const selectMultipleBookings = createAction(
  '[Booking] Select Multiple Bookings',
  props<{ bookingIds: number[] }>()
);

// ==================== CACHE MANAGEMENT ====================

export const invalidateCache = createAction(
  '[Booking] Invalidate Cache'
);

export const preloadBookingData = createAction(
  '[Booking] Preload Booking Data',
  props<{ courseId?: number; clientId?: number }>()
);

// ==================== ERROR HANDLING ====================

export const clearError = createAction(
  '[Booking] Clear Error'
);

export const setError = createAction(
  '[Booking] Set Error',
  props<{ error: any }>()
);

export const retryLastAction = createAction(
  '[Booking] Retry Last Action'
);

// ==================== SEASON CONTEXT ACTIONS ====================

export const seasonChanged = createAction(
  '[Booking] Season Changed',
  props<{ seasonId: number }>()
);

export const loadBookingsForSeason = createAction(
  '[Booking] Load Bookings for Season',
  props<{ seasonId: number }>()
);

// ==================== REPORTING ACTIONS ====================

export const generateBookingReport = createAction(
  '[Booking] Generate Booking Report',
  props<{
    reportType: 'summary' | 'detailed' | 'financial' | 'occupancy';
    filters: Partial<BookingSearchCriteria>;
    format: 'pdf' | 'excel' | 'csv';
  }>()
);

export const generateBookingReportSuccess = createAction(
  '[Booking] Generate Booking Report Success',
  props<{ reportUrl: string; reportType: string }>()
);

export const generateBookingReportFailure = createAction(
  '[Booking] Generate Booking Report Failure',
  props<{ error: any }>()
);

// ==================== REAL-TIME UPDATES ====================

export const bookingUpdatedRealTime = createAction(
  '[Booking] Booking Updated Real Time',
  props<{ booking: Booking }>()
);

export const bookingCreatedRealTime = createAction(
  '[Booking] Booking Created Real Time',
  props<{ booking: Booking }>()
);

export const bookingDeletedRealTime = createAction(
  '[Booking] Booking Deleted Real Time',
  props<{ bookingId: number }>()
);

// ==================== AVAILABILITY INTEGRATION ====================

export const checkBookingAvailability = createAction(
  '[Booking] Check Booking Availability',
  props<{
    courseId: number;
    date: Date;
    participantCount: number
  }>()
);

export const reserveBookingSlot = createAction(
  '[Booking] Reserve Booking Slot',
  props<{
    courseId: number;
    date: Date;
    timeSlotId: number;
    participantCount: number
  }>()
);

export const releaseBookingSlot = createAction(
  '[Booking] Release Booking Slot',
  props<{ reservationId: string }>()
);
