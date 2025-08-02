import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  AppError, 
  ErrorCode, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorRecoveryAction, 
  ErrorRecoveryType,
  ErrorLog,
  ApiErrorResponse 
} from '../models/error.interface';
import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private errorsSubject = new BehaviorSubject<ErrorLog[]>([]);
  private currentErrorSubject = new BehaviorSubject<AppError | null>(null);

  public errors$ = this.errorsSubject.asObservable();
  public currentError$ = this.currentErrorSubject.asObservable();

  constructor(
    private logger: LoggingService,
    private notification: NotificationService,
    private translate: TranslateService
  ) {}

  handleError(error: any): void {
    const appError = this.parseError(error);
    this.processError(appError);
  }

  handleHttpError(httpError: HttpErrorResponse, context?: ErrorContext): AppError {
    const appError = this.parseHttpError(httpError, context);
    this.processError(appError);
    return appError;
  }

  handleBusinessError(
    code: ErrorCode, 
    message: string, 
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): AppError {
    const appError: AppError = {
      code,
      message,
      timestamp: new Date(),
      context,
      severity,
      recoverable: this.isRecoverable(code),
      retryable: this.isRetryable(code),
      userMessage: this.getUserMessage(code)
    };

    this.processError(appError);
    return appError;
  }

  private parseError(error: any): AppError {
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }

    if (error instanceof Error) {
      return {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error.message,
        timestamp: new Date(),
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        retryable: false,
        context: {
          stack: error.stack
        }
      };
    }

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      timestamp: new Date(),
      severity: ErrorSeverity.LOW,
      recoverable: true,
      retryable: false
    };
  }

  private parseHttpError(httpError: HttpErrorResponse, context?: ErrorContext): AppError {
    let code: ErrorCode;
    let severity: ErrorSeverity;
    let recoverable: boolean;
    let retryable: boolean;

    switch (httpError.status) {
      case 0:
        code = ErrorCode.NETWORK_ERROR;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
        retryable = true;
        break;
      case 401:
        code = ErrorCode.UNAUTHORIZED;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
        retryable = false;
        break;
      case 403:
        code = ErrorCode.FORBIDDEN;
        severity = ErrorSeverity.MEDIUM;
        recoverable = false;
        retryable = false;
        break;
      case 404:
        code = ErrorCode.UNKNOWN_ERROR;
        severity = ErrorSeverity.LOW;
        recoverable = true;
        retryable = false;
        break;
      case 422:
        code = ErrorCode.VALIDATION_ERROR;
        severity = ErrorSeverity.LOW;
        recoverable = true;
        retryable = false;
        break;
      case 429:
        code = ErrorCode.TIMEOUT_ERROR;
        severity = ErrorSeverity.MEDIUM;
        recoverable = true;
        retryable = true;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = ErrorCode.EXTERNAL_SERVICE_ERROR;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
        retryable = true;
        break;
      default:
        code = ErrorCode.UNKNOWN_ERROR;
        severity = ErrorSeverity.MEDIUM;
        recoverable = true;
        retryable = false;
    }

    const apiError = httpError.error as ApiErrorResponse;
    const message = apiError?.error?.message || httpError.message || 'HTTP Error';

    return {
      code: apiError?.error?.code as ErrorCode || code,
      message,
      details: apiError?.error?.details || httpError.error,
      timestamp: new Date(),
      context: {
        ...context,
        url: httpError.url || undefined,
        userAgent: navigator.userAgent
      },
      severity,
      recoverable,
      retryable,
      userMessage: this.getUserMessage(code)
    };
  }

  private processError(error: AppError): void {
    // Log error
    this.logger.error('Error occurred', {
      code: error.code,
      message: error.message,
      context: error.context,
      severity: error.severity
    });

    // Add to error log
    const errorLog: ErrorLog = {
      id: this.generateId(),
      error,
      resolved: false,
      createdAt: new Date()
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([errorLog, ...currentErrors]);

    // Set as current error if severity is high or critical
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      this.currentErrorSubject.next(error);
    }

    // Show user notification
    this.showUserNotification(error);

    // Send error to monitoring service
    this.sendToMonitoring(error);
  }

  private showUserNotification(error: AppError): void {
    const userMessage = error.userMessage || this.getUserMessage(error.code as ErrorCode);
    const recoveryActions = this.getRecoveryActions(error);

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        this.notification.showError(userMessage);
        break;
      case ErrorSeverity.MEDIUM:
        this.notification.showWarning(userMessage);
        break;
      case ErrorSeverity.LOW:
        this.notification.showInfo(userMessage);
        break;
    }
  }

  private getUserMessage(code: ErrorCode): string {
    const key = `errors.${code.toLowerCase()}`;
    return this.translate.instant(key, {}) || `An error occurred: ${code}`;
  }

  private getRecoveryActions(error: AppError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    if (error.retryable) {
      actions.push({
        type: ErrorRecoveryType.RETRY,
        label: this.translate.instant('errors.actions.retry'),
        action: () => this.retryLastAction(),
        primary: true
      });
    }

    if (error.code === ErrorCode.UNAUTHORIZED) {
      actions.push({
        type: ErrorRecoveryType.REFRESH,
        label: this.translate.instant('errors.actions.login'),
        action: () => this.redirectToLogin()
      });
    }

    if (error.severity === ErrorSeverity.CRITICAL) {
      actions.push({
        type: ErrorRecoveryType.REFRESH,
        label: this.translate.instant('errors.actions.reload'),
        action: () => window.location.reload()
      });
    }

    actions.push({
      type: ErrorRecoveryType.CONTACT_SUPPORT,
      label: this.translate.instant('errors.actions.contact_support'),
      action: () => this.contactSupport(error)
    });

    return actions;
  }

  private isRecoverable(code: ErrorCode): boolean {
    const nonRecoverableErrors = [
      ErrorCode.FORBIDDEN,
      ErrorCode.CONFIGURATION_ERROR
    ];
    return !nonRecoverableErrors.includes(code);
  }

  private isRetryable(code: ErrorCode): boolean {
    const retryableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.EXTERNAL_SERVICE_ERROR
    ];
    return retryableErrors.includes(code);
  }

  private retryLastAction(): void {
    // Implement retry logic based on last action
    console.log('Retrying last action...');
  }

  private redirectToLogin(): void {
    // Implement redirect to login
    console.log('Redirecting to login...');
  }

  private contactSupport(error: AppError): void {
    // Implement contact support functionality
    console.log('Contacting support for error:', error.code);
  }

  private sendToMonitoring(error: AppError): void {
    // Send error to external monitoring service (Sentry, etc.)
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      console.log('Sending error to monitoring service:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public methods for error management
  markErrorAsResolved(errorId: string, resolution: string): void {
    const errors = this.errorsSubject.value;
    const errorIndex = errors.findIndex(e => e.id === errorId);
    
    if (errorIndex !== -1) {
      errors[errorIndex].resolved = true;
      errors[errorIndex].resolution = resolution;
      errors[errorIndex].resolvedAt = new Date();
      this.errorsSubject.next([...errors]);
    }
  }

  clearErrors(): void {
    this.errorsSubject.next([]);
    this.currentErrorSubject.next(null);
  }

  getUnresolvedErrors(): ErrorLog[] {
    return this.errorsSubject.value.filter(e => !e.resolved);
  }

  dismissCurrentError(): void {
    this.currentErrorSubject.next(null);
  }
}