import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { LoggingService } from '../../../../core/services/logging.service';

// Course Services
import { CourseSeasonService } from '../../../courses/services/course-season.service';
import { CourseAvailabilityService } from '../../../courses/services/course-availability.service';

// Booking Services
import { BookingPricingService } from '../../services/booking-pricing.service';
import { BookingWizardService } from '../../services/booking-wizard.service';

// Interfaces
import { Course } from '../../../../core/models/course.interface';
import { Season } from '../../../../core/models/season.interface';
import {
  CreateBookingRequest,
  BookingParticipant,
  BookingPricing,
  BookingWizardState,
  BookingWizardStep
} from '../../models/booking.interface';
import { AvailabilityQuery, AvailabilityResult } from '../../../courses/services/course-availability.service';

@Component({
  selector: 'app-booking-wizard-season',
  templateUrl: './booking-wizard-season.component.html',
  styleUrls: ['./booking-wizard-season.component.scss']
})
export class BookingWizardSeasonComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  // Form Management
  courseSelectionForm!: FormGroup;
  dateTimeForm!: FormGroup;
  participantsForm!: FormGroup;
  extrasForm!: FormGroup;
  paymentForm!: FormGroup;

  // State Management
  private destroy$ = new Subject<void>();
  private wizardStateSubject = new BehaviorSubject<BookingWizardState>(this.getInitialWizardState());
  public wizardState$ = this.wizardStateSubject.asObservable();

  // Data Observables
  public currentSeason$: Observable<Season | null>;
  public availableCourses$: Observable<Course[]>;
  public currentPricing$: Observable<BookingPricing | null>;
  public availabilityResult$: Observable<AvailabilityResult | null>;

  // Loading States
  public isLoadingCourses = false;
  public isLoadingAvailability = false;
  public isCalculatingPricing = false;
  public isSubmitting = false;

  // Current Data
  public selectedCourse: Course | null = null;
  private bookingId: number | null = null;
  public isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private seasonContext: SeasonContextService,
    private courseSeasonService: CourseSeasonService,
    private courseAvailability: CourseAvailabilityService,
    private bookingPricing: BookingPricingService,
    private bookingWizard: BookingWizardService,
    private validation: ValidationService,
    private errorHandler: ErrorHandlerService,
    private i18n: I18nService,
    private logger: LoggingService
  ) {
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.logger.info('Booking wizard initialized');

    // Check if editing existing booking
    this.bookingId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id'], 10) : null;
    this.isEditMode = !!this.bookingId;

    this.initializeForms();
    this.setupFormValidation();
    this.setupPricingCalculation();

    if (this.isEditMode) {
      this.loadBookingForEdit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.bookingPricing.clearCurrentPricing();
  }

  // ==================== INITIALIZATION ====================

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;
    this.currentPricing$ = this.bookingPricing.currentPricing$;

    this.availableCourses$ = this.seasonContext.currentSeason$.pipe(
      switchMap(season => {
        if (!season) return [];
        this.isLoadingCourses = true;
        return this.courseSeasonService.getCoursesBySeason(season.id);
      }),
      map(courses => {
        this.isLoadingCourses = false;
        return courses;
      })
    );
  }

  private initializeForms(): void {
    // Step 1: Course Selection
    this.courseSelectionForm = this.fb.group({
      course_id: ['', [this.validation.required('Please select a course')]],
      client_id: ['', [this.validation.required('Please select a client')]]
    });

    // Step 2: Date and Time Selection
    this.dateTimeForm = this.fb.group({
      course_date: ['', [
        this.validation.required('Please select a date'),
        this.validation.dateInFuture('Date must be in the future')
      ]],
      time_slot_id: ['', [this.validation.required('Please select a time slot')]],
      participant_count: [1, [
        this.validation.required('Number of participants is required'),
        this.validation.min(1, 'At least 1 participant required'),
        this.validation.max(50, 'Maximum 50 participants allowed')
      ]]
    });

    // Step 3: Participants Information
    this.participantsForm = this.fb.group({
      participants: this.fb.array([])
    });

    // Step 4: Extras and Equipment
    this.extrasForm = this.fb.group({
      equipment_rentals: this.fb.array([]),
      special_requirements: [''],
      notes: [''],
      insurance_required: [false]
    });

    // Step 5: Payment Information
    this.paymentForm = this.fb.group({
      payment_method: ['', [this.validation.required('Please select payment method')]],
      discount_code: [''],
      accept_terms: [false, [Validators.requiredTrue]]
    });
  }

  private setupFormValidation(): void {
    // Real-time validation for course selection
    this.courseSelectionForm.get('course_id')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(courseId => {
      if (courseId) {
        this.onCourseSelected(courseId);
      }
    });

    // Real-time validation for date/time changes
    combineLatest([
      this.dateTimeForm.get('course_date')?.valueChanges || [],
      this.dateTimeForm.get('participant_count')?.valueChanges || []
    ]).pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(([date, participants]) => {
      if (date && participants && this.selectedCourse) {
        this.checkAvailability();
        this.calculatePricing();
      }
    });
  }

  private setupPricingCalculation(): void {
    // Watch for changes that affect pricing
    combineLatest([
      this.dateTimeForm.valueChanges,
      this.participantsForm.valueChanges,
      this.extrasForm.valueChanges
    ]).pipe(
      debounceTime(800),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.canCalculatePricing()) {
        this.calculatePricing();
      }
    });
  }

  // ==================== STEP NAVIGATION ====================

  canProceedToStep(stepIndex: number): boolean {
    const wizardState = this.wizardStateSubject.value;
    return wizardState.steps[stepIndex]?.isValid || false;
  }

  onStepChange(event: any): void {
    const stepIndex = event.selectedIndex;
    this.updateWizardState({ currentStep: this.getStepByIndex(stepIndex) });

    // Perform step-specific validations
    switch (stepIndex) {
      case 1: // Date & Time
        if (this.selectedCourse) {
          this.checkAvailability();
        }
        break;
      case 2: // Participants
        this.updateParticipantsArray();
        break;
      case 3: // Extras
        this.calculatePricing();
        break;
    }
  }

  nextStep(): void {
    if (this.stepper.selectedIndex < this.stepper.steps.length - 1) {
      this.stepper.next();
    }
  }

  previousStep(): void {
    if (this.stepper.selectedIndex > 0) {
      this.stepper.previous();
    }
  }

  // ==================== COURSE SELECTION ====================

  private async onCourseSelected(courseId: number): Promise<void> {
    try {
      this.selectedCourse = await this.courseSeasonService.getCourseById(courseId);
      this.updateWizardState({
        formData: {
          ...this.wizardStateSubject.value.formData,
          course_id: courseId
        }
      });

      // Reset dependent forms
      this.dateTimeForm.patchValue({
        course_date: '',
        time_slot_id: ''
      });

      this.validateCurrentStep();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  // ==================== AVAILABILITY CHECKING ====================

  private async checkAvailability(): Promise<void> {
    if (!this.selectedCourse || !this.dateTimeForm.valid) return;

    const formData = this.dateTimeForm.value;
    const query: AvailabilityQuery = {
      courseId: this.selectedCourse.id,
      dateFrom: new Date(formData.course_date),
      dateTo: new Date(formData.course_date),
      participantCount: formData.participant_count
    };

    try {
      this.isLoadingAvailability = true;
      const availability = await this.courseAvailability.checkAvailability(query);

      if (!availability.isAvailable) {
        this.showAvailabilityWarning(availability);
      }

      this.validateCurrentStep();
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isLoadingAvailability = false;
    }
  }

  private showAvailabilityWarning(availability: AvailabilityResult): void {
    if (availability.restrictions.length > 0) {
      const messages = availability.restrictions.map(r => r.message).join(', ');
      this.snackBar.open(`Availability restrictions: ${messages}`, 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  // ==================== PARTICIPANTS MANAGEMENT ====================

  get participantsArray(): FormArray {
    return this.participantsForm.get('participants') as FormArray;
  }

  private updateParticipantsArray(): void {
    const participantCount = this.dateTimeForm.get('participant_count')?.value || 1;
    const currentCount = this.participantsArray.length;

    if (participantCount > currentCount) {
      // Add new participant forms
      for (let i = currentCount; i < participantCount; i++) {
        this.participantsArray.push(this.createParticipantForm());
      }
    } else if (participantCount < currentCount) {
      // Remove excess participant forms
      for (let i = currentCount - 1; i >= participantCount; i--) {
        this.participantsArray.removeAt(i);
      }
    }
  }

  private createParticipantForm(): FormGroup {
    return this.fb.group({
      name: ['', [this.validation.required('Name is required')]],
      age: ['', [
        this.validation.required('Age is required'),
        this.validation.min(5, 'Minimum age is 5'),
        this.validation.max(99, 'Maximum age is 99')
      ]],
      birth_date: ['', [this.validation.required('Birth date is required')]],
      emergency_contact: ['', [this.validation.required('Emergency contact is required')]],
      emergency_phone: ['', [
        this.validation.required('Emergency phone is required'),
        this.validation.phone('Please enter a valid phone number')
      ]],
      medical_conditions: [''],
      skill_level: ['beginner'],
      previous_experience: [false],
      equipment_rental: this.fb.array([]),
      dietary_restrictions: ['']
    });
  }

  // ==================== PRICING CALCULATION ====================

  private canCalculatePricing(): boolean {
    return !!(
      this.selectedCourse &&
      this.dateTimeForm.get('course_date')?.valid &&
      this.dateTimeForm.get('participant_count')?.valid
    );
  }

  private async calculatePricing(): Promise<void> {
    if (!this.canCalculatePricing()) return;

    const courseData = this.dateTimeForm.value;
    const extrasData = this.extrasForm.value;

    try {
      this.isCalculatingPricing = true;

      await this.bookingPricing.calculatePricing({
        course_id: this.selectedCourse!.id,
        participant_count: courseData.participant_count,
        course_date: new Date(courseData.course_date),
        time_slot_id: courseData.time_slot_id,
        equipment_rentals: extrasData.equipment_rentals || [],
        client_id: this.courseSelectionForm.get('client_id')?.value
      });

    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isCalculatingPricing = false;
    }
  }

  // ==================== FORM SUBMISSION ====================

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      this.validation.markAllFieldsAsTouched(this.courseSelectionForm);
      this.validation.markAllFieldsAsTouched(this.dateTimeForm);
      this.validation.markAllFieldsAsTouched(this.participantsForm);
      this.validation.markAllFieldsAsTouched(this.extrasForm);
      this.validation.markAllFieldsAsTouched(this.paymentForm);
      return;
    }

    try {
      this.isSubmitting = true;
      const bookingRequest = this.buildBookingRequest();

      let result;
      if (this.isEditMode) {
        result = await this.bookingWizard.updateBooking({ ...bookingRequest, id: this.bookingId! });
      } else {
        result = await this.bookingWizard.createBooking(bookingRequest);
      }

      this.logger.info('Booking operation completed', { bookingId: result.id, isEdit: this.isEditMode });

      const message = this.isEditMode ?
        this.i18n.translateSync('booking.updated_successfully') :
        this.i18n.translateSync('booking.created_successfully');

      this.snackBar.open(message, 'Close', { duration: 3000 });

      // Navigate to booking details
      this.router.navigate(['/v5/bookings', result.id]);

    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private buildBookingRequest(): CreateBookingRequest {
    const courseData = this.courseSelectionForm.value;
    const dateTimeData = this.dateTimeForm.value;
    const participantsData = this.participantsForm.value;
    const extrasData = this.extrasForm.value;

    return {
      course_id: courseData.course_id,
      client_id: courseData.client_id,
      course_date: new Date(dateTimeData.course_date),
      time_slot_id: dateTimeData.time_slot_id,
      participant_count: dateTimeData.participant_count,
      participants: participantsData.participants,
      special_requirements: extrasData.special_requirements,
      notes: extrasData.notes
    };
  }

  // ==================== VALIDATION ====================

  private isFormValid(): boolean {
    return (
      this.courseSelectionForm.valid &&
      this.dateTimeForm.valid &&
      this.participantsForm.valid &&
      this.extrasForm.valid &&
      this.paymentForm.valid
    );
  }

  private validateCurrentStep(): void {
    const currentStep = this.stepper.selectedIndex;
    let isValid = false;

    switch (currentStep) {
      case 0:
        isValid = this.courseSelectionForm.valid;
        break;
      case 1:
        isValid = this.dateTimeForm.valid;
        break;
      case 2:
        isValid = this.participantsForm.valid;
        break;
      case 3:
        isValid = this.extrasForm.valid;
        break;
      case 4:
        isValid = this.paymentForm.valid;
        break;
    }

    // Update wizard state
    const wizardState = this.wizardStateSubject.value;
    wizardState.steps[currentStep].isValid = isValid;
    this.wizardStateSubject.next(wizardState);
  }

  // ==================== EDIT MODE ====================

  private async loadBookingForEdit(): Promise<void> {
    if (!this.bookingId) return;

    try {
      const booking = await this.bookingWizard.getBookingById(this.bookingId);
      this.populateFormsFromBooking(booking);
    } catch (error) {
      this.errorHandler.handleError(error);
      this.router.navigate(['/v5/bookings']);
    }
  }

  private populateFormsFromBooking(booking: any): void {
    // Populate course selection
    this.courseSelectionForm.patchValue({
      course_id: booking.course_id,
      client_id: booking.client_id
    });

    // Populate date/time
    this.dateTimeForm.patchValue({
      course_date: booking.course_date,
      time_slot_id: booking.time_slot_id,
      participant_count: booking.participant_count
    });

    // Populate participants
    this.updateParticipantsArray();
    booking.participants.forEach((participant: BookingParticipant, index: number) => {
      this.participantsArray.at(index)?.patchValue(participant);
    });

    // Populate extras
    this.extrasForm.patchValue({
      special_requirements: booking.special_requirements,
      notes: booking.notes
    });
  }

  // ==================== UTILITY METHODS ====================

  private getInitialWizardState(): BookingWizardState {
    return {
      currentStep: 'course_selection',
      steps: [
        { step: 'course_selection', title: 'Course Selection', description: 'Select course and client', isValid: false, isComplete: false, canSkip: false, errors: [] },
        { step: 'date_time', title: 'Date & Time', description: 'Choose date and time', isValid: false, isComplete: false, canSkip: false, errors: [] },
        { step: 'participants', title: 'Participants', description: 'Enter participant details', isValid: false, isComplete: false, canSkip: false, errors: [] },
        { step: 'extras', title: 'Extras', description: 'Add equipment and services', isValid: false, isComplete: false, canSkip: true, errors: [] },
        { step: 'payment', title: 'Payment', description: 'Review and confirm', isValid: false, isComplete: false, canSkip: false, errors: [] }
      ],
      isValid: false,
      canProceed: false,
      formData: {},
      errors: {}
    };
  }

  private getStepByIndex(index: number): BookingWizardStep {
    const steps: BookingWizardStep[] = ['course_selection', 'date_time', 'participants', 'extras', 'payment'];
    return steps[index] || 'course_selection';
  }

  private updateWizardState(updates: Partial<BookingWizardState>): void {
    const currentState = this.wizardStateSubject.value;
    this.wizardStateSubject.next({ ...currentState, ...updates });
  }

  // Template helper methods
  getStepIcon(stepIndex: number): string {
    const icons = ['school', 'event', 'people', 'add_circle', 'payment'];
    return icons[stepIndex] || 'help';
  }

  getStepErrors(stepIndex: number): string[] {
    const wizardState = this.wizardStateSubject.value;
    return wizardState.steps[stepIndex]?.errors || [];
  }
}
