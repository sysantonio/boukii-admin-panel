import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, finalize, tap, catchError } from 'rxjs/operators';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

// V5 Core Services
import { AuthV5Service } from '../../../../core/services/auth-v5.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { I18nService } from '../../../../core/services/i18n.service';

// Models
import { LoginCredentials, LoginResponse, AuthError } from '../../models/auth.interface';

// Validators
import { CustomValidators } from '../../../../core/validators/custom-validators';

/**
 * LoginV5Component - Professional authentication component with season context
 * 
 * Features:
 * - Responsive design with accessibility support
 * - Real-time form validation with custom validators
 * - Professional error handling and logging
 * - Internationalization support
 * - Progressive enhancement with animations
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Remember me functionality
 * - Forgot password integration
 * - Loading states and micro-interactions
 */
@Component({
  selector: 'app-login-v5',
  templateUrl: './login-v5.component.html',
  styleUrls: ['./login-v5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('errorShake', [
      transition('* => error', [
        animate('600ms ease-in-out', 
          style({ transform: 'translateX(0)' })),
        query('.login-form', [
          animate('100ms ease-in-out', style({ transform: 'translateX(-10px)' })),
          animate('100ms ease-in-out', style({ transform: 'translateX(10px)' })),
          animate('100ms ease-in-out', style({ transform: 'translateX(-10px)' })),
          animate('100ms ease-in-out', style({ transform: 'translateX(0)' }))
        ], { optional: true })
      ])
    ]),
    trigger('staggerForm', [
      transition(':enter', [
        query('.form-field', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LoginV5Component implements OnInit, OnDestroy, AfterViewInit {

  // ==================== VIEW REFERENCES ====================

  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef<HTMLInputElement>;

  // ==================== COMPONENT STATE ====================

  // Form Management
  public loginForm!: FormGroup;
  public showPassword = false;
  public rememberMe = false;

  // Loading and Error States
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public loginError$ = new BehaviorSubject<string | null>(null);
  public formAnimationState = 'initial';

  // Accessibility
  public emailErrorId = 'email-error';
  public passwordErrorId = 'password-error';
  public formErrorId = 'form-error';

  // Progressive Enhancement
  public supportsAutofill = 'webkitAutofill' in document.createElement('input');
  public supportsWebAuthn = !!window.PublicKeyCredential;

  // Lifecycle
  private destroy$ = new Subject<void>();

  // ==================== COMPUTED PROPERTIES ====================

  public get isFormValid(): boolean {
    return this.loginForm?.valid ?? false;
  }

  public get canSubmit(): boolean {
    return this.isFormValid && !this.isLoading$.value;
  }

  public get emailControl(): AbstractControl {
    return this.loginForm.get('email')!;
  }

  public get passwordControl(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  // ==================== CONSTRUCTOR & LIFECYCLE ====================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthV5Service,
    private logger: LoggingService,
    private notification: NotificationService,
    private i18n: I18nService
  ) {
    this.initializeForm();
    this.setupFormValidation();
  }

  ngOnInit(): void {
    this.logger.info('LoginV5Component initialized', {
      supportsAutofill: this.supportsAutofill,
      supportsWebAuthn: this.supportsWebAuthn,
      userAgent: navigator.userAgent
    });

    this.loadSavedCredentials();
    this.handleReturnUrl();
  }

  ngAfterViewInit(): void {
    // Focus first invalid field or email field by default
    setTimeout(() => {
      if (this.emailInput?.nativeElement) {
        this.emailInput.nativeElement.focus();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.isLoading$.complete();
    this.loginError$.complete();
  }

  // ==================== FORM INITIALIZATION ====================

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        CustomValidators.emailDomain(['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'])
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        CustomValidators.strongPassword()
      ]],
      rememberMe: [false]
    });
  }

  private setupFormValidation(): void {
    // Real-time validation with debounce
    this.emailControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.validateEmailField(value);
    });

    this.passwordControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.validatePasswordField(value);
    });

    // Clear login error when form changes
    this.loginForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.loginError$.value) {
        this.loginError$.next(null);
      }
    });
  }

  // ==================== VALIDATION METHODS ====================

  private validateEmailField(email: string): void {
    if (!email) return;

    const emailControl = this.emailControl;
    
    // Custom email validation logic
    if (emailControl.hasError('email')) {
      this.logger.debug('Email validation failed', { email: email.substring(0, 3) + '***' });
    }

    if (emailControl.hasError('emailDomain')) {
      this.logger.debug('Email domain validation failed', { 
        domain: email.split('@')[1] 
      });
    }
  }

  private validatePasswordField(password: string): void {
    if (!password) return;

    const passwordControl = this.passwordControl;

    if (passwordControl.hasError('minlength')) {
      this.logger.debug('Password too short', { 
        currentLength: password.length,
        minLength: 8 
      });
    }

    if (passwordControl.hasError('strongPassword')) {
      this.logger.debug('Password strength validation failed');
    }
  }

  // ==================== AUTHENTICATION METHODS ====================

  public async onSubmit(): Promise<void> {
    if (!this.canSubmit) {
      this.logger.warn('Login form submitted but validation failed');
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.loginForm.value;
    const credentials: LoginCredentials = {
      email: formValue.email.toLowerCase().trim(),
      password: formValue.password,
      remember_me: formValue.rememberMe,
      device_info: this.getDeviceInfo()
    };

    this.logger.info('Attempting login', {
      email: credentials.email.substring(0, 3) + '***',
      rememberMe: credentials.remember_me,
      deviceInfo: credentials.device_info
    });

    this.setLoadingState(true);
    this.loginError$.next(null);

    try {
      const response = await this.authService.login(credentials).pipe(
        finalize(() => this.setLoadingState(false)),
        catchError(error => this.handleLoginError(error))
      ).toPromise();

      if (response) {
        await this.handleSuccessfulLogin(response, credentials);
      }

    } catch (error) {
      this.handleLoginError(error);
    }
  }

  private async handleSuccessfulLogin(response: LoginResponse, credentials: LoginCredentials): Promise<void> {
    this.logger.info('Login successful', {
      userId: response.user.id,
      userRole: response.user.role,
      seasonsCount: response.available_seasons?.length || 0
    });

    // Save credentials if remember me is checked
    if (credentials.remember_me) {
      this.saveCredentials(credentials.email);
    } else {
      this.clearSavedCredentials();
    }

    // Show success notification
    this.notification.showSuccess(
      this.i18n.translate('auth.login_successful', { 
        name: response.user.first_name 
      })
    );

    // Navigate based on available seasons
    await this.navigateAfterLogin(response);
  }

  private handleLoginError(error: any): never {
    this.formAnimationState = 'error';
    
    let errorMessage: string;
    let errorCode: string;

    if (error?.error?.code) {
      errorCode = error.error.code;
      errorMessage = this.getLocalizedErrorMessage(errorCode);
    } else if (error?.message) {
      errorMessage = error.message;
      errorCode = 'UNKNOWN_ERROR';
    } else {
      errorMessage = this.i18n.translate('auth.login_failed');
      errorCode = 'NETWORK_ERROR';
    }

    this.loginError$.next(errorMessage);

    this.logger.error('Login failed', {
      errorCode,
      errorMessage,
      email: this.emailControl.value?.substring(0, 3) + '***'
    });

    // Focus back to email field for retry
    setTimeout(() => {
      if (this.emailInput?.nativeElement) {
        this.emailInput.nativeElement.focus();
      }
    }, 100);

    throw error;
  }

  // ==================== NAVIGATION METHODS ====================

  private async navigateAfterLogin(response: LoginResponse): Promise<void> {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/v5/dashboard';
    
    // If user has multiple seasons, show season selector
    if (response.available_seasons && response.available_seasons.length > 1) {
      this.logger.info('Multiple seasons available, showing selector', {
        seasonsCount: response.available_seasons.length
      });
      
      await this.router.navigate(['/v5/auth/season-selector'], {
        queryParams: { returnUrl }
      });
    } else {
      // Single season or no seasons - direct navigation
      this.logger.info('Single season or no seasons, direct navigation', {
        returnUrl
      });
      
      await this.router.navigate([returnUrl]);
    }
  }

  private handleReturnUrl(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.logger.info('Login component loaded with return URL', { returnUrl });
    }
  }

  // ==================== UI INTERACTION METHODS ====================

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    
    this.logger.debug('Password visibility toggled', { 
      visible: this.showPassword 
    });

    // Maintain focus on password field
    setTimeout(() => {
      if (this.passwordInput?.nativeElement) {
        this.passwordInput.nativeElement.focus();
      }
    }, 10);
  }

  public onForgotPassword(): void {
    const email = this.emailControl.value?.trim();
    
    this.logger.info('Forgot password clicked', {
      hasEmail: !!email
    });

    if (email && this.emailControl.valid) {
      this.router.navigate(['/v5/auth/forgot-password'], {
        queryParams: { email }
      });
    } else {
      this.router.navigate(['/v5/auth/forgot-password']);
    }
  }

  public onCreateAccount(): void {
    this.logger.info('Create account clicked');
    this.router.navigate(['/v5/auth/register']);
  }

  // ==================== UTILITY METHODS ====================

  private setLoadingState(loading: boolean): void {
    this.isLoading$.next(loading);
    
    if (loading) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }

  private getLocalizedErrorMessage(errorCode: string): string {
    const errorMap: { [key: string]: string } = {
      'INVALID_CREDENTIALS': 'auth.invalid_credentials',
      'ACCOUNT_LOCKED': 'auth.account_locked',
      'ACCOUNT_DISABLED': 'auth.account_disabled',
      'EMAIL_NOT_VERIFIED': 'auth.email_not_verified',
      'TOO_MANY_ATTEMPTS': 'auth.too_many_attempts',
      'MAINTENANCE_MODE': 'auth.maintenance_mode',
      'NETWORK_ERROR': 'auth.network_error'
    };

    const translationKey = errorMap[errorCode] || 'auth.login_failed';
    return this.i18n.translate(translationKey);
  }

  // ==================== PERSISTENCE METHODS ====================

  private loadSavedCredentials(): void {
    try {
      const savedEmail = localStorage.getItem('boukii_saved_email');
      const rememberMe = localStorage.getItem('boukii_remember_me') === 'true';

      if (savedEmail && rememberMe) {
        this.loginForm.patchValue({
          email: savedEmail,
          rememberMe: true
        });

        this.logger.debug('Loaded saved credentials', {
          hasEmail: !!savedEmail
        });
      }
    } catch (error) {
      this.logger.warn('Failed to load saved credentials', error);
    }
  }

  private saveCredentials(email: string): void {
    try {
      localStorage.setItem('boukii_saved_email', email);
      localStorage.setItem('boukii_remember_me', 'true');
    } catch (error) {
      this.logger.warn('Failed to save credentials', error);
    }
  }

  private clearSavedCredentials(): void {
    try {
      localStorage.removeItem('boukii_saved_email');
      localStorage.removeItem('boukii_remember_me');
    } catch (error) {
      this.logger.warn('Failed to clear saved credentials', error);
    }
  }

  // ==================== ERROR HANDLING METHODS ====================

  public getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    const errors = control.errors;

    if (errors['required']) {
      return this.i18n.translate(`auth.field_required`, { field: fieldName });
    }

    if (errors['email']) {
      return this.i18n.translate('auth.invalid_email');
    }

    if (errors['emailDomain']) {
      return this.i18n.translate('auth.invalid_email_domain');
    }

    if (errors['minlength']) {
      return this.i18n.translate('auth.password_too_short', { 
        minLength: errors['minlength'].requiredLength 
      });
    }

    if (errors['strongPassword']) {
      return this.i18n.translate('auth.password_not_strong');
    }

    return this.i18n.translate('auth.field_invalid');
  }

  public hasFieldError(fieldName: string): boolean {
    return !!this.getFieldError(fieldName);
  }

  // ==================== ACCESSIBILITY METHODS ====================

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.canSubmit) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  public getAriaDescribedBy(fieldName: string): string {
    const errorId = fieldName === 'email' ? this.emailErrorId : this.passwordErrorId;
    return this.hasFieldError(fieldName) ? errorId : '';
  }

  // ==================== DEVELOPMENT HELPERS ====================

  public fillDemoCredentials(): void {
    if (environment.production) return;

    this.loginForm.patchValue({
      email: 'admin@boukii.com',
      password: 'Admin123!',
      rememberMe: false
    });

    this.logger.debug('Demo credentials filled');
  }
}