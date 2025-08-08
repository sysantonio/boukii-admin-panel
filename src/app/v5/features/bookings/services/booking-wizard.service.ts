import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingWizardState,
  BookingWizardStep,
  BookingWizardStepData
} from '../models/booking.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingWizardService {
  private wizardStateSubject = new BehaviorSubject<BookingWizardState | null>(null);
  public wizardState$ = this.wizardStateSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlerService,
    private validation: ValidationService
  ) {}

  // ==================== WIZARD STATE MANAGEMENT ====================

  initializeWizard(editMode: boolean = false, bookingId?: number): BookingWizardState {
    const wizardState: BookingWizardState = {
      currentStep: 'course_selection',
      steps: this.getInitialSteps(),
      isValid: false,
      canProceed: false,
      formData: {},
      errors: {}
    };

    this.wizardStateSubject.next(wizardState);
    this.logger.info('Booking wizard initialized', { editMode, bookingId });

    return wizardState;
  }

  updateWizardState(updates: Partial<BookingWizardState>): void {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return;

    const updatedState = { ...currentState, ...updates };
    this.wizardStateSubject.next(updatedState);
  }

  validateStep(step: BookingWizardStep, formData: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (step) {
      case 'course_selection':
        if (!formData.course_id) errors.push('Course selection is required');
        if (!formData.client_id) errors.push('Client selection is required');
        break;

      case 'date_time':
        if (!formData.course_date) errors.push('Course date is required');
        if (!formData.time_slot_id) errors.push('Time slot selection is required');
        if (!formData.participant_count || formData.participant_count < 1) {
          errors.push('At least 1 participant is required');
        }
        break;

      case 'participants':
        if (!formData.participants || formData.participants.length === 0) {
          errors.push('Participant information is required');
        } else {
          formData.participants.forEach((participant: any, index: number) => {
            if (!participant.name) errors.push(`Participant ${index + 1} name is required`);
            if (!participant.emergency_contact) errors.push(`Participant ${index + 1} emergency contact is required`);
            if (!participant.emergency_phone) errors.push(`Participant ${index + 1} emergency phone is required`);
          });
        }
        break;

      case 'extras':
        // Extras are generally optional, but we can add business rule validations
        if (formData.special_requirements && formData.special_requirements.length > 500) {
          warnings.push('Special requirements are quite long - consider being more concise');
        }
        break;

      case 'payment':
        if (!formData.payment_method) errors.push('Payment method is required');
        if (!formData.accept_terms) errors.push('Terms and conditions must be accepted');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  proceedToNextStep(): boolean {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return false;

    const currentStepIndex = this.getStepIndex(currentState.currentStep);
    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex >= currentState.steps.length) {
      return false; // Already at last step
    }

    const nextStep = this.getStepByIndex(nextStepIndex);
    this.updateWizardState({ currentStep: nextStep });

    return true;
  }

  goToPreviousStep(): boolean {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return false;

    const currentStepIndex = this.getStepIndex(currentState.currentStep);
    const previousStepIndex = currentStepIndex - 1;

    if (previousStepIndex < 0) {
      return false; // Already at first step
    }

    const previousStep = this.getStepByIndex(previousStepIndex);
    this.updateWizardState({ currentStep: previousStep });

    return true;
  }

  clearWizardState(): void {
    this.wizardStateSubject.next(null);
    this.logger.info('Booking wizard state cleared');
  }

  // ==================== BOOKING OPERATIONS ====================

  createBooking(bookingData: CreateBookingRequest): Observable<Booking> {
    this.logger.info('Creating booking via wizard service', bookingData);
    this.isLoadingSubject.next(true);

    const requestData = {
      ...bookingData,
      season_id: this.seasonContext.getCurrentSeasonId(),
      course_date: bookingData.course_date.toISOString()
    };

    return this.apiV5.post<ApiResponse<Booking>>('bookings', requestData).pipe(
      map((response:any) => {
        if (!response?.data) {
          throw new Error('Invalid booking creation response');
        }

        this.logger.info('Booking created successfully', {
          bookingId: response.data.id,
          referenceNumber: response.data.reference_number
        });

        return response.data;
      }),
      catchError(error => {
        this.logger.error('Failed to create booking', { bookingData, error });
        this.errorHandler.handleError(error);
        throw error;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateBooking(bookingData: UpdateBookingRequest): Observable<Booking> {
    this.logger.info('Updating booking via wizard service', bookingData);
    this.isLoadingSubject.next(true);

    const requestData = {
      ...bookingData,
      course_date: bookingData.course_date ? bookingData.course_date.toISOString() : undefined
    };

    return this.apiV5.put<ApiResponse<Booking>>(`bookings/${bookingData.id}`, requestData).pipe(
      map(response => {
        if (!response?.data) {
          throw new Error('Invalid booking update response');
        }

        this.logger.info('Booking updated successfully', {
          bookingId: response.data.id
        });

        return response.data;
      }),
      catchError(error => {
        this.logger.error('Failed to update booking', { bookingData, error });
        this.errorHandler.handleError(error);
        throw error;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  getBookingById(id: number): Observable<Booking> {
    this.logger.info('Loading booking for edit', { id });
    this.isLoadingSubject.next(true);

    return this.apiV5.get<ApiResponse<Booking>>(`bookings/${id}`).pipe(
      map(response => {
        if (!response?.data) {
          throw new Error('Booking not found');
        }
        return response.data;
      }),
      catchError(error => {
        this.logger.error('Failed to load booking', { id, error });
        this.errorHandler.handleError(error);
        throw error;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // ==================== WIZARD HELPERS ====================

  canCompleteWizard(): boolean {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return false;

    return currentState.steps.every(step => step.isValid || step.canSkip);
  }

  getCompletionPercentage(): number {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return 0;

    const completedSteps = currentState.steps.filter(step => step.isComplete).length;
    return Math.round((completedSteps / currentState.steps.length) * 100);
  }

  getCurrentStepIndex(): number {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return 0;

    return this.getStepIndex(currentState.currentStep);
  }

  isFirstStep(): boolean {
    return this.getCurrentStepIndex() === 0;
  }

  isLastStep(): boolean {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return false;

    return this.getCurrentStepIndex() === currentState.steps.length - 1;
  }

  // ==================== FORM DATA MANAGEMENT ====================

  updateFormData(stepData: any): void {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return;

    const updatedFormData = { ...currentState.formData, ...stepData };
    this.updateWizardState({ formData: updatedFormData });
  }

  getFormData(): any {
    const currentState = this.wizardStateSubject.value;
    return currentState?.formData || {};
  }

  clearFormData(): void {
    this.updateWizardState({ formData: {} });
  }

  // ==================== VALIDATION HELPERS ====================

  validateAllSteps(): { [stepIndex: number]: { isValid: boolean; errors: string[] } } {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return {};

    const validationResults: { [stepIndex: number]: { isValid: boolean; errors: string[] } } = {};
    const formData = currentState.formData;

    currentState.steps.forEach((step, index) => {
      const validation = this.validateStep(step.step, formData);
      validationResults[index] = {
        isValid: validation.isValid,
        errors: validation.errors
      };
    });

    return validationResults;
  }

  hasErrors(): boolean {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return false;

    return Object.keys(currentState.errors).length > 0;
  }

  getErrors(): string[] {
    const currentState = this.wizardStateSubject.value;
    if (!currentState) return [];

    return Object.values(currentState.errors).flat();
  }

  clearErrors(): void {
    this.updateWizardState({ errors: {} });
  }

  // ==================== DRAFT MANAGEMENT ====================

  saveDraft(): Observable<void> {
    const currentState = this.wizardStateSubject.value;
    if (!currentState || !currentState.formData) {
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }

    const draftData = {
      wizard_state: currentState,
      season_id: this.seasonContext.getCurrentSeasonId(),
      created_at: new Date().toISOString()
    };

    return this.apiV5.post('bookings/save-draft', draftData).pipe(
      map(() => {
        this.logger.info('Booking draft saved');
      }),
      catchError(error => {
        this.logger.warn('Failed to save booking draft', error);
        // Don't throw error for draft saving failures - return empty observable that completes
        return of(undefined);
      })
    );
  }

  loadDraft(draftId: string): Observable<BookingWizardState> {
    return this.apiV5.get<ApiResponse<{ wizard_state: BookingWizardState }>>(`bookings/drafts/${draftId}`).pipe(
      map(response => {
        if (!response?.data?.wizard_state) {
          throw new Error('Draft not found');
        }

        const wizardState = response.data.wizard_state;
        this.wizardStateSubject.next(wizardState);

        this.logger.info('Booking draft loaded', { draftId });
        return wizardState;
      }),
      catchError(error => {
        this.logger.error('Failed to load booking draft', { draftId, error });
        throw error;
      })
    );
  }

  // ==================== PRIVATE METHODS ====================

  private getInitialSteps(): BookingWizardStepData[] {
    return [
      {
        step: 'course_selection',
        title: 'Course & Client',
        description: 'Select the course and client for the booking',
        isValid: false,
        isComplete: false,
        canSkip: false,
        errors: []
      },
      {
        step: 'date_time',
        title: 'Date & Time',
        description: 'Choose the date, time and number of participants',
        isValid: false,
        isComplete: false,
        canSkip: false,
        errors: []
      },
      {
        step: 'participants',
        title: 'Participants',
        description: 'Enter participant details and requirements',
        isValid: false,
        isComplete: false,
        canSkip: false,
        errors: []
      },
      {
        step: 'extras',
        title: 'Extras & Services',
        description: 'Add equipment rentals and additional services',
        isValid: true, // This step is optional
        isComplete: false,
        canSkip: true,
        errors: []
      },
      {
        step: 'payment',
        title: 'Review & Payment',
        description: 'Review booking details and process payment',
        isValid: false,
        isComplete: false,
        canSkip: false,
        errors: []
      }
    ];
  }

  private getStepIndex(step: BookingWizardStep): number {
    const steps: BookingWizardStep[] = [
      'course_selection',
      'date_time',
      'participants',
      'extras',
      'payment'
    ];
    return steps.indexOf(step);
  }

  private getStepByIndex(index: number): BookingWizardStep {
    const steps: BookingWizardStep[] = [
      'course_selection',
      'date_time',
      'participants',
      'extras',
      'payment'
    ];
    return steps[index] || 'course_selection';
  }
}
