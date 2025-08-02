import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, of, timer } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, map, catchError, tap, finalize } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationService } from '../../../../core/services/validation.service';

// V5 Client Services
import { ClientService } from '../../services/client.service';

// Interfaces
import { Season } from '../../../../core/models/season.interface';
import { Client, CreateClientRequest, UpdateClientRequest, ClientAddress, ContactPreferences, EmergencyContact, GDPRConsent, DocumentType, ClientStatus, ContactMethod, TimePreference } from '../../models/client.interface';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TranslateModule} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DatePipe, UpperCasePipe} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressBarModule} from '@angular/material/progress-bar';

// Form data structure
export interface ClientFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    mobilePhone?: string;
    dateOfBirth?: Date;
    nationality?: string;
    avatar?: File;
  };
  documentInfo: {
    documentType: DocumentType;
    documentNumber: string;
    documentExpiryDate?: Date;
  };
  contactInfo: {
    address: ClientAddress;
    emergencyContact?: EmergencyContact;
  };
  preferences: {
    language: string;
    contactMethod: ContactMethod;
    timePreference: TimePreference;
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
    };
    medicalConditions?: string;
    dietaryRestrictions?: string;
    accessibilityNeeds?: string;
  };
  legalConsent: {
    gdprConsent: GDPRConsent;
    marketingConsent: boolean;
    termsAccepted: boolean;
  };
  notes?: string;
}

export type FormStep = 'personal' | 'document' | 'contact' | 'preferences' | 'legal' | 'review';

export interface StepValidation {
  step: FormStep;
  isValid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MatFormFieldModule,
    MatCheckboxModule,
    UpperCasePipe,
    DatePipe,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressBarModule
  ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateX(30px)'}),
        animate('300ms ease-in', style({opacity: 1, transform: 'translateX(0)'}))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({opacity: 0, transform: 'translateX(-30px)'}))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('200ms ease-in', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({opacity: 0}))
      ])
    ])
  ]
})
export class ClientFormComponent implements OnInit, OnDestroy {

  // ==================== INPUTS & OUTPUTS ====================

  @Input() clientId?: number; // For edit mode
  @Input() seasonId?: string; // Override season context
  @Input() initialData?: Partial<ClientFormData>; // Pre-populate form
  @Input() readonly = false; // View-only mode

  @Output() clientSaved = new EventEmitter<Client>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() stepChanged = new EventEmitter<FormStep>();

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  // ==================== COMPONENT STATE ====================

  public clientForm!: FormGroup;
  public currentStep: FormStep = 'personal';
  public isLoading = false;
  public isSaving = false;
  public isEditMode = false;
  public showPreview = false;

  // Form steps configuration
  public readonly steps: { key: FormStep; label: string; icon: string }[] = [
    { key: 'personal', label: 'client_form.steps.personal', icon: 'person' },
    { key: 'document', label: 'client_form.steps.document', icon: 'badge' },
    { key: 'contact', label: 'client_form.steps.contact', icon: 'home' },
    { key: 'preferences', label: 'client_form.steps.preferences', icon: 'settings' },
    { key: 'legal', label: 'client_form.steps.legal', icon: 'gavel' },
    { key: 'review', label: 'client_form.steps.review', icon: 'preview' }
  ];

  public currentStepIndex = 0;

  // Validation state
  public stepValidations: { [key in FormStep]: StepValidation } = {
    personal: { step: 'personal', isValid: false, errors: [] },
    document: { step: 'document', isValid: false, errors: [] },
    contact: { step: 'contact', isValid: false, errors: [] },
    preferences: { step: 'preferences', isValid: false, errors: [] },
    legal: { step: 'legal', isValid: false, errors: [] },
    review: { step: 'review', isValid: false, errors: [] }
  };

  // Data
  public currentClient?: Client;
  public currentSeason$: Observable<Season | null>;
  public avatarPreview?: string;
  public countries: string[] = ['España', 'Francia', 'Portugal', 'Italia', 'Alemania', 'Reino Unido'];
  public languages: string[] = ['es', 'fr', 'en', 'de', 'it', 'pt'];

  // Form options
  public documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'dni', label: 'DNI' },
    { value: 'nie', label: 'NIE' },
    { value: 'passport', label: 'Pasaporte' },
    { value: 'driver_license', label: 'Carnet de Conducir' },
    { value: 'other', label: 'Otro' }
  ];

  public contactMethods: { value: ContactMethod; label: string }[] = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'postal', label: 'Correo postal' }
  ];

  public timePreferences: { value: TimePreference; label: string }[] = [
    { value: 'morning', label: 'Mañana' },
    { value: 'afternoon', label: 'Tarde' },
    { value: 'evening', label: 'Noche' },
    { value: 'any', label: 'Cualquier momento' }
  ];

  private destroy$ = new Subject<void>();

  // ==================== CONSTRUCTOR & LIFECYCLE ====================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private seasonContext: SeasonContextService,
    private clientService: ClientService,
    private logger: LoggingService,
    private notification: NotificationService,
    private validationService: ValidationService
  ) {
    this.initializeForm();
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.logger.info('ClientFormComponent initialized', {
      clientId: this.clientId,
      isEditMode: this.isEditMode
    });

    this.determineMode();
    this.setupFormSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    this.clientForm = this.fb.group({
      // Personal Information
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
        phone: ['', [Validators.required], [this.phoneExistsValidator()]],
        mobilePhone: ['', []],
        dateOfBirth: [''],
        nationality: ['España'],
        avatar: [null]
      }),

      // Document Information
      documentInfo: this.fb.group({
        documentType: ['dni', [Validators.required]],
        documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
        documentExpiryDate: ['']
      }),

      // Contact Information
      contactInfo: this.fb.group({
        address: this.fb.group({
          street: ['', [Validators.required, Validators.maxLength(100)]],
          streetNumber: ['', [Validators.maxLength(10)]],
          apartment: ['', [Validators.maxLength(10)]],
          city: ['', [Validators.required, Validators.maxLength(50)]],
          postalCode: ['', [Validators.required]],
          province: ['', [Validators.required, Validators.maxLength(50)]],
          country: ['España', [Validators.required]]
        }),
        emergencyContact: this.fb.group({
          name: ['', [Validators.required, Validators.maxLength(100)]],
          relationship: ['', [Validators.required, Validators.maxLength(50)]],
          phone: ['', [Validators.required]],
          email: ['', [Validators.email]]
        })
      }),

      // Preferences
      preferences: this.fb.group({
        language: ['es', [Validators.required]],
        contactMethod: ['email', [Validators.required]],
        timePreference: ['any', [Validators.required]],
        notifications: this.fb.group({
          email: [true],
          sms: [false],
          whatsapp: [false],
          push: [false]
        }),
        medicalConditions: ['', [Validators.maxLength(1000)]],
        dietaryRestrictions: ['', [Validators.maxLength(1000)]],
        accessibilityNeeds: ['', [Validators.maxLength(1000)]]
      }),

      // Legal Consent
      legalConsent: this.fb.group({
        gdprConsent: this.fb.group({
          dataProcessingConsent: [false, [Validators.requiredTrue]],
          marketingConsent: [false],
          thirdPartySharingConsent: [false]
        }),
        marketingConsent: [false],
        termsAccepted: [false, [Validators.requiredTrue]]
      }),

      // Notes
      notes: ['', [Validators.maxLength(2000)]]
    });
  }

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;
  }

  private determineMode(): void {
    // Check if we have clientId from input or route
    if (!this.clientId) {
      this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    }

    this.isEditMode = !!this.clientId && this.clientId > 0;

    this.logger.debug('Form mode determined', {
      isEditMode: this.isEditMode,
      clientId: this.clientId
    });
  }

  private setupFormSubscriptions(): void {
    // Watch form changes for real-time validation
    this.clientForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(() => {
      this.validateCurrentStep();
    });

    // Watch for specific field changes
    this.watchEmailField();
    this.watchPhoneField();
    this.watchDocumentFields();
  }

  private loadInitialData(): void {
    if (this.initialData) {
      this.populateFormWithData(this.initialData);
    }

    if (this.isEditMode && this.clientId) {
      this.loadClientData();
    }
  }

  // ==================== DATA LOADING ====================

  private loadClientData(): void {
    this.isLoading = true;

    this.clientService.getClientById(this.clientId!).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(error => {
        this.logger.error('Error loading client data', error);
        this.notification.showError('client_form.error_loading_client');
        return of(null);
      })
    ).subscribe(client => {
      if (client) {
        this.currentClient = client;
        this.populateFormWithClient(client);
        this.logger.info('Client data loaded', { clientId: client.id });
      }
    });
  }

  private populateFormWithClient(client: Client): void {
    try {
      const formData = this.mapClientToFormData(client);
      this.populateFormWithData(formData);

      if (client.profile_picture) {
        this.avatarPreview = client.profile_picture;
      }
    } catch (error) {
      this.logger.error('Error populating form with client data', error);
      this.notification.showError('client_form.error_populating_form');
    }
  }

  private populateFormWithData(data: Partial<ClientFormData>): void {
    this.clientForm.patchValue({
      personalInfo: data.personalInfo || {},
      documentInfo: data.documentInfo || {},
      contactInfo: data.contactInfo || {},
      preferences: data.preferences || {},
      legalConsent: data.legalConsent || {},
      notes: data.notes || ''
    });
  }

  // ==================== FORM STEPS NAVIGATION ====================

  public canNavigateToStep(step: FormStep): boolean {
    const stepIndex = this.getStepIndex(step);
    const currentIndex = this.getStepIndex(this.currentStep);

    // Can always go back
    if (stepIndex < currentIndex) {
      return true;
    }

    // Can go forward only if previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const stepKey = this.steps[i].key;
      if (!this.stepValidations[stepKey].isValid) {
        return false;
      }
    }

    return true;
  }

  public navigateToStep(step: FormStep): void {
    if (!this.canNavigateToStep(step)) {
      this.notification.showWarning('client_form.complete_previous_steps');
      return;
    }

    this.currentStep = step;
    this.currentStepIndex = this.getStepIndex(step);
    this.stepChanged.emit(step);

    this.logger.debug('Navigated to step', { step, index: this.currentStepIndex });
  }

  public nextStep(): void {
    this.validateCurrentStep();

    if (!this.stepValidations[this.currentStep].isValid) {
      this.notification.showWarning('client_form.fix_errors_to_continue');
      return;
    }

    const nextIndex = this.currentStepIndex + 1;
    if (nextIndex < this.steps.length) {
      this.navigateToStep(this.steps[nextIndex].key);
    }
  }

  public previousStep(): void {
    const prevIndex = this.currentStepIndex - 1;
    if (prevIndex >= 0) {
      this.navigateToStep(this.steps[prevIndex].key);
    }
  }

  public isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  public isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  private getStepIndex(step: FormStep): number {
    return this.steps.findIndex(s => s.key === step);
  }

  // ==================== FORM VALIDATION ====================

  private validateCurrentStep(): void {
    const validation: StepValidation = {
      step: this.currentStep,
      isValid: true,
      errors: []
    };

    switch (this.currentStep) {
      case 'personal':
        validation.isValid = this.clientForm.get('personalInfo')?.valid || false;
        validation.errors = this.getControlErrors('personalInfo');
        break;

      case 'document':
        validation.isValid = this.clientForm.get('documentInfo')?.valid || false;
        validation.errors = this.getControlErrors('documentInfo');
        break;

      case 'contact':
        validation.isValid = this.clientForm.get('contactInfo')?.valid || false;
        validation.errors = this.getControlErrors('contactInfo');
        break;

      case 'preferences':
        validation.isValid = this.clientForm.get('preferences')?.valid || false;
        validation.errors = this.getControlErrors('preferences');
        break;

      case 'legal':
        validation.isValid = this.clientForm.get('legalConsent')?.valid || false;
        validation.errors = this.getControlErrors('legalConsent');
        break;

      case 'review':
        validation.isValid = this.clientForm.valid;
        validation.errors = this.getAllFormErrors();
        break;
    }

    this.stepValidations[this.currentStep] = validation;
  }

  private getControlErrors(controlPath: string): string[] {
    const control = this.clientForm.get(controlPath);
    const errors: string[] = [];

    if (control && control.errors) {
      Object.keys(control.errors).forEach(key => {
        errors.push(this.getErrorMessage(key, control.errors![key]));
      });
    }

    return errors;
  }

  private getAllFormErrors(): string[] {
    const errors: string[] = [];

    Object.keys(this.stepValidations).forEach(stepKey => {
      const step = stepKey as FormStep;
      if (step !== 'review') {
        errors.push(...this.stepValidations[step].errors);
      }
    });

    return errors;
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo es obligatorio',
      email: 'Formato de email inválido',
      minlength: `Mínimo ${errorValue.requiredLength} caracteres`,
      maxlength: `Máximo ${errorValue.requiredLength} caracteres`,
      pattern: 'Formato inválido',
      emailExists: 'Este email ya está registrado',
      phoneExists: 'Este teléfono ya está registrado'
    };

    return errorMessages[errorKey] || 'Error de validación';
  }

  // ==================== ASYNC VALIDATORS ====================

  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) {
        return of(null);
      }

      // Skip validation if we're editing and email hasn't changed
      if (this.isEditMode && this.currentClient?.email === control.value) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => this.clientService.validateEmail(control.value)),
        map(exists => exists ? { emailExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  private phoneExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 9) {
        return of(null);
      }

      // Skip validation if we're editing and phone hasn't changed
      if (this.isEditMode && this.currentClient?.phone === control.value) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => this.clientService.validatePhone(control.value)),
        map(exists => exists ? { phoneExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  // ==================== FIELD WATCHERS ====================

  private watchEmailField(): void {
    const emailControl = this.clientForm.get('personalInfo.email');
    if (emailControl) {
      emailControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(value => {
        this.logger.debug('Email field changed', { value });
      });
    }
  }

  private watchPhoneField(): void {
    const phoneControl = this.clientForm.get('personalInfo.phone');
    if (phoneControl) {
      phoneControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(value => {
        this.logger.debug('Phone field changed', { value });
      });
    }
  }

  private watchDocumentFields(): void {
    const documentTypeControl = this.clientForm.get('documentInfo.documentType');
    const documentNumberControl = this.clientForm.get('documentInfo.documentNumber');

    if (documentTypeControl && documentNumberControl) {
      documentTypeControl.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(type => {
        // Update document number validators based on document type
        this.updateDocumentNumberValidators(type);
      });
    }
  }

  private updateDocumentNumberValidators(documentType: DocumentType): void {
    const documentNumberControl = this.clientForm.get('documentInfo.documentNumber');

    if (!documentNumberControl) return;

    let validators = [Validators.required];

    switch (documentType) {
      /*case 'dni':
        validators.push(this.validationService.dniValidator());
        break;
      case 'nie':
        validators.push(this.validationService.nieValidator());
        break;*/
      case 'passport':
        validators.push(Validators.minLength(6), Validators.maxLength(12));
        break;
      default:
        validators.push(Validators.minLength(6), Validators.maxLength(20));
    }

    documentNumberControl.setValidators(validators);
    documentNumberControl.updateValueAndValidity();
  }

  // ==================== FILE HANDLING ====================

  public onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file
      if (!this.isValidImageFile(file)) {
        this.notification.showError('client_form.invalid_image_file');
        return;
      }

      // Update form control
      this.clientForm.get('personalInfo.avatar')?.setValue(file);

      // Generate preview
      this.generateAvatarPreview(file);

      this.logger.debug('Avatar file selected', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    }
  }

  public removeAvatar(): void {
    this.clientForm.get('personalInfo.avatar')?.setValue(null);
    this.avatarPreview = undefined;

    if (this.avatarInput) {
      this.avatarInput.nativeElement.value = '';
    }
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  private generateAvatarPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ==================== FORM SUBMISSION ====================

  public onSubmit(): void {
    if (!this.clientForm.valid) {
      this.markAllFieldsAsTouched();
      this.notification.showError('client_form.fix_errors_before_submit');
      return;
    }

    this.isSaving = true;
    const formValue = this.clientForm.value;

    if (this.isEditMode) {
      this.updateClient(formValue);
    } else {
      this.createClient(formValue);
    }
  }

  private createClient(formValue: any): void {
    const clientData = this.mapFormDataToCreateRequest(formValue);

    this.clientService.createClient(clientData).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSaving = false;
      }),
      catchError(error => {
        this.logger.error('Error creating client', error);
        this.notification.showError('client_form.error_creating_client');
        return of(null);
      })
    ).subscribe(client => {
      if (client) {
        this.logger.info('Client created successfully', { clientId: client.id });
        this.notification.showSuccess('client_form.client_created_successfully');
        this.clientSaved.emit(client);

        if (!this.clientId) {
          this.router.navigate(['/v5/clients', client.id]);
        }
      }
    });
  }

  private updateClient(formValue: any): void {
    const clientData = this.mapFormDataToUpdateRequest(formValue);

    this.clientService.updateClient(this.clientId!, clientData).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSaving = false;
      }),
      catchError(error => {
        this.logger.error('Error updating client', error);
        this.notification.showError('client_form.error_updating_client');
        return of(null);
      })
    ).subscribe(client => {
      if (client) {
        this.logger.info('Client updated successfully', { clientId: client.id });
        this.notification.showSuccess('client_form.client_updated_successfully');
        this.clientSaved.emit(client);
      }
    });
  }

  public onCancel(): void {
    if (this.clientForm.dirty) {
      // Show confirmation dialog
      const confirmDiscard = confirm('¿Estás seguro de que quieres descartar los cambios?');
      if (!confirmDiscard) {
        return;
      }
    }

    this.formCancelled.emit();

    if (this.isEditMode) {
      this.router.navigate(['/v5/clients', this.clientId]);
    } else {
      this.router.navigate(['/v5/clients']);
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      if (control) {
        control.markAsTouched();

        if (control instanceof FormGroup) {
          this.markFormGroupFieldsAsTouched(control);
        }
      }
    });
  }

  private markFormGroupFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();

        if (control instanceof FormGroup) {
          this.markFormGroupFieldsAsTouched(control);
        }
      }
    });
  }

  // ==================== DATA MAPPING ====================

  private mapClientToFormData(client: Client): ClientFormData {
    return {
      personalInfo: {
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        mobilePhone: client.mobile_phone,
        dateOfBirth: client.birth_date,
        nationality: client.nationality
      },
      documentInfo: {
        documentType: client.document_type,
        documentNumber: client.document_number,
        documentExpiryDate: client.document_expiry_date
      },
      contactInfo: {
        address: client.address,
        emergencyContact: client.emergency_contact
      },
      preferences: {
        language: client.contact_preferences.preferred_language,
        contactMethod: client.contact_preferences.preferred_contact_method,
        timePreference: client.contact_preferences.contact_time_preference,
        notifications: {
          email: client.contact_preferences.email_notifications,
          sms: client.contact_preferences.sms_notifications,
          whatsapp: client.contact_preferences.whatsapp_notifications,
          push: client.contact_preferences.push_notifications
        },
        medicalConditions: client.profile.medical_conditions,
        dietaryRestrictions: client.profile.dietary_restrictions,
        accessibilityNeeds: client.profile.accessibility_needs
      },
      legalConsent: {
        gdprConsent: client.gdpr_consent,
        marketingConsent: client.marketing_consent,
        termsAccepted: client.terms_accepted
      },
      notes: client.notes
    };
  }

  private mapFormDataToCreateRequest(formValue: any): {
    terms_accepted: any;
    document_number: any;
    address: any;
    notes: any;
    birth_date: any;
    profile: {
      preferred_activities: any[];
      blacklisted_activities: any[];
      equipment_owned: any[];
      accessibility_needs: any;
      interests: any[];
      previous_experience: {};
      medical_conditions: any;
      dietary_restrictions: any;
      skill_levels: {};
      group_preferences: string
    };
    last_name: any;
    gdpr_consent: {
      third_party_sharing_consent: boolean[];
      legal_basis: string;
      consent_date: Date;
      marketing_consent: any;
      data_processing_consent: (boolean | ((control: AbstractControl) => (ValidationErrors | null))[])[]
    };
    contact_preferences: {
      push_notifications: any;
      contact_time_preference: any;
      preferred_contact_method: any;
      whatsapp_notifications: any;
      email_notifications: any;
      notifications_enabled: boolean;
      sms_notifications: any;
      preferred_language: any
    };
    document_expiry_date: any;
    nationality: any;
    phone: any;
    mobile_phone: any;
    first_name: any;
    marketing_consent: any;
    email: any;
    document_type: any;
    emergency_contact: any
  } {
    return {
      first_name: formValue.personalInfo.firstName,
      last_name: formValue.personalInfo.lastName,
      email: formValue.personalInfo.email,
      phone: formValue.personalInfo.phone,
      mobile_phone: formValue.personalInfo.mobilePhone,
      birth_date: formValue.personalInfo.dateOfBirth,
      nationality: formValue.personalInfo.nationality,
      document_type: formValue.documentInfo.documentType,
      document_number: formValue.documentInfo.documentNumber,
      document_expiry_date: formValue.documentInfo.documentExpiryDate,
      address: formValue.contactInfo.address,
      emergency_contact: formValue.contactInfo.emergencyContact,
      contact_preferences: {
        preferred_language: formValue.preferences.language,
        preferred_contact_method: formValue.preferences.contactMethod,
        contact_time_preference: formValue.preferences.timePreference,
        notifications_enabled: true,
        email_notifications: formValue.preferences.notifications.email,
        sms_notifications: formValue.preferences.notifications.sms,
        whatsapp_notifications: formValue.preferences.notifications.whatsapp,
        push_notifications: formValue.preferences.notifications.push
      },
      profile: {
        medical_conditions: formValue.preferences.medicalConditions,
        dietary_restrictions: formValue.preferences.dietaryRestrictions,
        accessibility_needs: formValue.preferences.accessibilityNeeds,
        interests: [],
        skill_levels: {},
        previous_experience: {},
        preferred_activities: [],
        blacklisted_activities: [],
        group_preferences: 'any',
        equipment_owned: []
      },
      gdpr_consent: {
        data_processing_consent: formValue.legalConsent.gdprConsent.dataProcessingConsent,
        marketing_consent: formValue.legalConsent.gdprConsent.marketingConsent,
        third_party_sharing_consent: formValue.legalConsent.gdprConsent.thirdPartySharingConsent,
        consent_date: new Date(),
        legal_basis: 'consent'
      },
      marketing_consent: formValue.legalConsent.marketingConsent,
      terms_accepted: formValue.legalConsent.termsAccepted,
      notes: formValue.notes
    };
  }

  private mapFormDataToUpdateRequest(formValue: any): {
    terms_accepted: any;
    document_number: any;
    address: any;
    notes: any;
    birth_date: any;
    profile: {
      preferred_activities: any[];
      blacklisted_activities: any[];
      equipment_owned: any[];
      accessibility_needs: any;
      interests: any[];
      previous_experience: {};
      medical_conditions: any;
      dietary_restrictions: any;
      skill_levels: {};
      group_preferences: string
    };
    last_name: any;
    gdpr_consent: {
      third_party_sharing_consent: boolean[];
      legal_basis: string;
      consent_date: Date;
      marketing_consent: any;
      data_processing_consent: (boolean | ((control: AbstractControl) => (ValidationErrors | null))[])[]
    };
    contact_preferences: {
      push_notifications: any;
      contact_time_preference: any;
      preferred_contact_method: any;
      whatsapp_notifications: any;
      email_notifications: any;
      notifications_enabled: boolean;
      sms_notifications: any;
      preferred_language: any
    };
    document_expiry_date: any;
    nationality: any;
    phone: any;
    mobile_phone: any;
    id: number;
    first_name: any;
    marketing_consent: any;
    email: any;
    document_type: any;
    emergency_contact: any
  } {
    const createRequest = this.mapFormDataToCreateRequest(formValue);
    return {
      id: this.clientId!,
      ...createRequest
    };
  }

  // ==================== UTILITY METHODS ====================

  public isStepValid(step: FormStep): boolean {
    return this.stepValidations[step].isValid;
  }

  public isStepCompleted(step: FormStep): boolean {
    const stepIndex = this.getStepIndex(step);
    const currentIndex = this.getStepIndex(this.currentStep);
    return stepIndex < currentIndex && this.isStepValid(step);
  }

  public getStepIcon(step: FormStep): string {
    const stepConfig = this.steps.find(s => s.key === step);
    return stepConfig?.icon || 'help';
  }

  public getFieldError(fieldPath: string): string | null {
    const control = this.clientForm.get(fieldPath);
    if (control && control.errors && control.touched) {
      const firstErrorKey = Object.keys(control.errors)[0];
      return this.getErrorMessage(firstErrorKey, control.errors[firstErrorKey]);
    }
    return null;
  }

  public hasFieldError(fieldPath: string): boolean {
    const control = this.clientForm.get(fieldPath);
    return !!(control && control.errors && control.touched);
  }

  public isFieldPending(fieldPath: string): boolean {
    const control = this.clientForm.get(fieldPath);
    return !!(control && control.pending);
  }

  public getFormProgress(): number {
    const validSteps = Object.values(this.stepValidations).filter(v => v.isValid).length;
    const totalSteps = this.steps.length - 1; // Exclude review step
    return Math.round((validSteps / totalSteps) * 100);
  }
}
