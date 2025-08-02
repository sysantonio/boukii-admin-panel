import { createReducer, on } from '@ngrx/store';
import { 
  Booking, 
  BookingSearchCriteria, 
  BookingStats,
  BookingWizardState 
} from '../models/booking.interface';
import * as BookingActions from './booking.actions';

export interface BookingState {
  // Booking List Management
  bookings: Booking[];
  selectedBooking: Booking | null;
  
  // Search and Filtering
  searchCriteria: BookingSearchCriteria;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Loading States
  loading: boolean;
  loadingBookings: boolean;
  loadingBookingDetails: boolean;
  savingBooking: boolean;
  deletingBooking: boolean;
  
  // Wizard State
  wizardState: BookingWizardState | null;
  
  // Statistics and Analytics
  stats: BookingStats | null;
  loadingStats: boolean;
  
  // Error Handling
  error: string | null;
  lastError: any;
  
  // Cache Management
  lastUpdated: Date | null;
  cacheValid: boolean;
}

const initialState: BookingState = {
  // Booking List Management
  bookings: [],
  selectedBooking: null,
  
  // Search and Filtering
  searchCriteria: {
    page: 1,
    limit: 25,
    sort_by: 'created_at',
    sort_order: 'desc'
  },
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,
  
  // Loading States
  loading: false,
  loadingBookings: false,
  loadingBookingDetails: false,
  savingBooking: false,
  deletingBooking: false,
  
  // Wizard State
  wizardState: null,
  
  // Statistics and Analytics
  stats: null,
  loadingStats: false,
  
  // Error Handling
  error: null,
  lastError: null,
  
  // Cache Management
  lastUpdated: null,
  cacheValid: false,
};

export const bookingReducer = createReducer(
  initialState,

  // ==================== BOOKING LIST ACTIONS ====================

  on(BookingActions.loadBookings, (state, { criteria }) => ({
    ...state,
    loadingBookings: true,
    error: null,
    searchCriteria: { ...state.searchCriteria, ...criteria }
  })),

  on(BookingActions.loadBookingsSuccess, (state, { bookings, totalCount, page }) => ({
    ...state,
    bookings,
    totalCount,
    currentPage: page || state.currentPage,
    loadingBookings: false,
    error: null,
    lastUpdated: new Date(),
    cacheValid: true
  })),

  on(BookingActions.loadBookingsFailure, (state, { error }) => ({
    ...state,
    loadingBookings: false,
    error: error.message || 'Failed to load bookings',
    lastError: error,
    cacheValid: false
  })),

  // ==================== BOOKING DETAILS ACTIONS ====================

  on(BookingActions.loadBookingDetails, (state, { id }) => ({
    ...state,
    loadingBookingDetails: true,
    error: null,
    selectedBooking: state.selectedBooking?.id === id ? state.selectedBooking : null
  })),

  on(BookingActions.loadBookingDetailsSuccess, (state, { booking }) => ({
    ...state,
    selectedBooking: booking,
    loadingBookingDetails: false,
    error: null
  })),

  on(BookingActions.loadBookingDetailsFailure, (state, { error }) => ({
    ...state,
    loadingBookingDetails: false,
    error: error.message || 'Failed to load booking details',
    lastError: error,
    selectedBooking: null
  })),

  // ==================== BOOKING CRUD ACTIONS ====================

  on(BookingActions.createBooking, (state) => ({
    ...state,
    savingBooking: true,
    error: null
  })),

  on(BookingActions.createBookingSuccess, (state, { booking }) => ({
    ...state,
    bookings: [booking, ...state.bookings],
    selectedBooking: booking,
    savingBooking: false,
    error: null,
    totalCount: state.totalCount + 1,
    cacheValid: false // Invalidate cache to trigger refresh
  })),

  on(BookingActions.createBookingFailure, (state, { error }) => ({
    ...state,
    savingBooking: false,
    error: error.message || 'Failed to create booking',
    lastError: error
  })),

  on(BookingActions.updateBooking, (state) => ({
    ...state,
    savingBooking: true,
    error: null
  })),

  on(BookingActions.updateBookingSuccess, (state, { booking }) => ({
    ...state,
    bookings: state.bookings.map(b => b.id === booking.id ? booking : b),
    selectedBooking: state.selectedBooking?.id === booking.id ? booking : state.selectedBooking,
    savingBooking: false,
    error: null,
    cacheValid: false
  })),

  on(BookingActions.updateBookingFailure, (state, { error }) => ({
    ...state,
    savingBooking: false,
    error: error.message || 'Failed to update booking',
    lastError: error
  })),

  on(BookingActions.deleteBooking, (state) => ({
    ...state,
    deletingBooking: true,
    error: null
  })),

  on(BookingActions.deleteBookingSuccess, (state, { id }) => ({
    ...state,
    bookings: state.bookings.filter(b => b.id !== id),
    selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
    deletingBooking: false,
    error: null,
    totalCount: Math.max(0, state.totalCount - 1),
    cacheValid: false
  })),

  on(BookingActions.deleteBookingFailure, (state, { error }) => ({
    ...state,
    deletingBooking: false,
    error: error.message || 'Failed to delete booking',
    lastError: error
  })),

  // ==================== BOOKING STATUS ACTIONS ====================

  on(BookingActions.updateBookingStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingActions.updateBookingStatusSuccess, (state, { id, status }) => ({
    ...state,
    bookings: state.bookings.map(b => 
      b.id === id ? { ...b, status } : b
    ),
    selectedBooking: state.selectedBooking?.id === id 
      ? { ...state.selectedBooking, status } 
      : state.selectedBooking,
    loading: false,
    error: null,
    cacheValid: false
  })),

  on(BookingActions.updateBookingStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error.message || 'Failed to update booking status',
    lastError: error
  })),

  // ==================== WIZARD ACTIONS ====================

  on(BookingActions.initializeWizard, (state, { wizardState }) => ({
    ...state,
    wizardState,
    error: null
  })),

  on(BookingActions.updateWizardState, (state, { updates }) => ({
    ...state,
    wizardState: state.wizardState ? { ...state.wizardState, ...updates } : null
  })),

  on(BookingActions.validateWizardStep, (state, { stepIndex, isValid, errors }) => {
    if (!state.wizardState) return state;
    
    const updatedSteps = [...state.wizardState.steps];
    if (updatedSteps[stepIndex]) {
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        isValid,
        errors: errors || []
      };
    }

    return {
      ...state,
      wizardState: {
        ...state.wizardState,
        steps: updatedSteps,
        isValid: updatedSteps.every(step => step.isValid || step.canSkip)
      }
    };
  }),

  on(BookingActions.clearWizardState, (state) => ({
    ...state,
    wizardState: null
  })),

  // ==================== STATISTICS ACTIONS ====================

  on(BookingActions.loadBookingStats, (state) => ({
    ...state,
    loadingStats: true,
    error: null
  })),

  on(BookingActions.loadBookingStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loadingStats: false,
    error: null
  })),

  on(BookingActions.loadBookingStatsFailure, (state, { error }) => ({
    ...state,
    loadingStats: false,
    error: error.message || 'Failed to load booking statistics',
    lastError: error
  })),

  // ==================== SEARCH AND FILTER ACTIONS ====================

  on(BookingActions.updateSearchCriteria, (state, { criteria }) => ({
    ...state,
    searchCriteria: { ...state.searchCriteria, ...criteria },
    currentPage: criteria.page || 1,
    cacheValid: false
  })),

  on(BookingActions.clearSearchCriteria, (state) => ({
    ...state,
    searchCriteria: {
      page: 1,
      limit: 25,
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    currentPage: 1,
    cacheValid: false
  })),

  // ==================== CACHE MANAGEMENT ACTIONS ====================

  on(BookingActions.invalidateCache, (state) => ({
    ...state,
    cacheValid: false,
    lastUpdated: null
  })),

  on(BookingActions.refreshBookings, (state) => ({
    ...state,
    loadingBookings: true,
    cacheValid: false,
    error: null
  })),

  // ==================== BULK OPERATIONS ====================

  on(BookingActions.bulkUpdateBookings, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingActions.bulkUpdateBookingsSuccess, (state, { updatedBookings }) => ({
    ...state,
    bookings: state.bookings.map(booking => {
      const updated = updatedBookings.find(ub => ub.id === booking.id);
      return updated || booking;
    }),
    loading: false,
    error: null,
    cacheValid: false
  })),

  on(BookingActions.bulkUpdateBookingsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error.message || 'Failed to update bookings',
    lastError: error
  })),

  // ==================== ERROR HANDLING ====================

  on(BookingActions.clearError, (state) => ({
    ...state,
    error: null,
    lastError: null
  })),

  on(BookingActions.setError, (state, { error }) => ({
    ...state,
    error: error.message || 'An error occurred',
    lastError: error,
    loading: false,
    loadingBookings: false,
    loadingBookingDetails: false,
    savingBooking: false,
    deletingBooking: false,
    loadingStats: false
  })),

  // ==================== SELECTION ACTIONS ====================

  on(BookingActions.selectBooking, (state, { booking }) => ({
    ...state,
    selectedBooking: booking
  })),

  on(BookingActions.clearSelection, (state) => ({
    ...state,
    selectedBooking: null
  })),

  // ==================== SEASON CONTEXT ACTIONS ====================

  on(BookingActions.seasonChanged, (state, { seasonId }) => ({
    ...state,
    bookings: [],
    selectedBooking: null,
    totalCount: 0,
    currentPage: 1,
    searchCriteria: {
      ...state.searchCriteria,
      season_id: seasonId,
      page: 1
    },
    cacheValid: false,
    stats: null,
    error: null
  }))
);

// ==================== SELECTORS ====================

export const selectBookingState = (state: { bookings: BookingState }) => state.bookings;
export const selectBookings = (state: { bookings: BookingState }) => state.bookings.bookings;
export const selectSelectedBooking = (state: { bookings: BookingState }) => state.bookings.selectedBooking;
export const selectBookingLoading = (state: { bookings: BookingState }) => state.bookings.loadingBookings;
export const selectBookingError = (state: { bookings: BookingState }) => state.bookings.error;
export const selectBookingStats = (state: { bookings: BookingState }) => state.bookings.stats;
export const selectWizardState = (state: { bookings: BookingState }) => state.bookings.wizardState;