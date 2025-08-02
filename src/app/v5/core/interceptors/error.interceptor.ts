import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, mergeMap } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { LoggingService } from '../services/logging.service';
import { SeasonContextService } from '../services/season-context.service';
import { AuthV5Service } from '../services/auth-v5.service';
import { ErrorCode } from '../models/error.interface';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(
    private errorHandler: ErrorHandlerService,
    private logger: LoggingService,
    private seasonContext: SeasonContextService,
    private authService: AuthV5Service
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    
    return next.handle(request).pipe(
      retry({
        count: this.shouldRetry(request) ? this.retryAttempts : 0,
        delay: (error, retryCount) => {
          if (this.isRetryableError(error)) {
            const delay = this.getRetryDelay(retryCount);
            this.logger.warn(`Retrying request (${retryCount}/${this.retryAttempts}) after ${delay}ms`, {
              url: request.url,
              method: request.method,
              error: error.status
            });
            return timer(delay);
          }
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        
        // Log API call with error
        this.logger.logApiCall(
          request.method,
          request.url,
          duration,
          error.status
        );

        // Create error context
        const context = {
          userId: this.authService.getCurrentUserId(),
          seasonId: this.seasonContext.getCurrentSeasonId(),
          component: 'HttpInterceptor',
          action: `${request.method} ${request.url}`,
          payload: this.sanitizePayload(request.body),
          url: request.url
        };

        // Handle specific error cases
        this.handleSpecificErrors(error);

        // Process error through error handler
        const appError = this.errorHandler.handleHttpError(error, context);

        return throwError(() => appError);
      })
    );
  }

  private shouldRetry(request: HttpRequest<unknown>): boolean {
    // Don't retry authentication requests
    if (request.url.includes('/auth/')) {
      return false;
    }

    // Don't retry POST requests with body (to avoid duplicates)
    if (request.method === 'POST' && request.body) {
      return false;
    }

    // Don't retry file uploads
    if (request.body instanceof FormData) {
      return false;
    }

    return true;
  }

  private isRetryableError(error: HttpErrorResponse): boolean {
    // Retry on network errors
    if (error.status === 0) {
      return true;
    }

    // Retry on server errors (5xx)
    if (error.status >= 500) {
      return true;
    }

    // Retry on rate limiting
    if (error.status === 429) {
      return true;
    }

    // Retry on timeout
    if (error.status === 408) {
      return true;
    }

    return false;
  }

  private getRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.retryDelay * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 10000); // Max 10 seconds
  }

  private handleSpecificErrors(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // Handle unauthorized - might need to refresh token
        this.handleUnauthorized(error);
        break;
      case 403:
        // Handle forbidden - user doesn't have permission
        this.handleForbidden(error);
        break;
      case 422:
        // Handle validation errors
        this.handleValidationError(error);
        break;
      case 429:
        // Handle rate limiting
        this.handleRateLimit(error);
        break;
    }
  }

  private handleUnauthorized(error: HttpErrorResponse): void {
    this.logger.warn('Unauthorized request detected', {
      url: error.url,
      status: error.status
    });

    // Try to refresh token or redirect to login
    // this.authService.handleUnauthorized();
  }

  private handleForbidden(error: HttpErrorResponse): void {
    this.logger.warn('Forbidden request detected', {
      url: error.url,
      status: error.status,
      currentSeason: this.seasonContext.getCurrentSeasonId()
    });

    // Check if it's a season-related permission issue
    if (error.url?.includes('/seasons/')) {
      this.errorHandler.handleBusinessError(
        ErrorCode.SEASON_CLOSED,
        'Cannot perform action on closed season'
      );
    }
  }

  private handleValidationError(error: HttpErrorResponse): void {
    this.logger.info('Validation error detected', {
      url: error.url,
      validationErrors: error.error?.validation_errors
    });

    // Log validation errors for debugging
    if (error.error?.validation_errors) {
      error.error.validation_errors.forEach((validationError: any) => {
        this.logger.debug('Validation error detail', validationError);
      });
    }
  }

  private handleRateLimit(error: HttpErrorResponse): void {
    const retryAfter = error.headers.get('Retry-After');
    this.logger.warn('Rate limit exceeded', {
      url: error.url,
      retryAfter
    });

    // Could implement exponential backoff based on Retry-After header
  }

  private sanitizePayload(payload: any): any {
    if (!payload) {
      return null;
    }

    // Remove sensitive data from logs
    const sensitiveFields = ['password', 'token', 'credit_card', 'ssn'];
    const sanitized = { ...payload };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const result = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            result[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            result[key] = sanitizeObject(obj[key]);
          } else {
            result[key] = obj[key];
          }
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }
}